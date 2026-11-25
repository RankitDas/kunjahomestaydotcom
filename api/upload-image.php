<?php
/**
 * Kunja Homestay — Secure Image Upload API
 * Handles authenticated photo upload, MIME validation, path traversal prevention,
 * resizing down to max 1600px width, and compression into ./images/
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$csrf = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
if (!verify_csrf_token($csrf)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Invalid or expired CSRF token']);
    exit;
}

$fileKey = isset($_FILES['photo']) ? 'photo' : (isset($_FILES['image']) ? 'image' : null);
if (!$fileKey || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
    $code = $fileKey ? ($_FILES[$fileKey]['error'] ?? 'missing') : 'missing';
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => "Image upload failed with error code: {$code}"]);
    exit;
}

$tmpPath = $_FILES[$fileKey]['tmp_name'];
$originalName = $_FILES[$fileKey]['name'];

// 1. Server-side MIME validation with finfo_file
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $tmpPath);
finfo_close($finfo);

$allowedMimes = [
    'image/jpeg' => 'jpeg',
    'image/jpg'  => 'jpeg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif'
];

if (!isset($allowedMimes[$mime])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => "Unsupported file type: {$mime}. Please upload a JPEG, PNG, WebP, or GIF file."]);
    exit;
}

$extension = $allowedMimes[$mime];

// Optional target subfolder: gallery, certificates, kunja_homestay/Room X, kunja_bati_homestay/Room X
$targetSubfolder = trim($_POST['subfolder'] ?? $_POST['target_folder'] ?? '');
$targetSubfolder = preg_replace('/[^a-zA-Z0-9_\-\/ ]/', '', $targetSubfolder);
$targetSubfolder = trim($targetSubfolder, '/');

$targetDir = IMAGES_DIR;
if (!empty($targetSubfolder)) {
    $targetDir = IMAGES_DIR . '/' . $targetSubfolder;
    if (!is_dir($targetDir)) {
        @mkdir($targetDir, 0755, true);
    }
}

// 2. Sanitize and generate unique safe filename in target directory
$safeBase = strtolower(preg_replace('/[^a-zA-Z0-9_-]/', '-', pathinfo($originalName, PATHINFO_FILENAME)));
$safeBase = trim($safeBase, '-');
if (empty($safeBase)) {
    $safeBase = 'photo';
}

$filename = 'kunja-' . $safeBase . '-' . substr(bin2hex(random_bytes(4)), 0, 6) . '.' . $extension;
$destPath = $targetDir . '/' . $filename;

// Ensure IMAGES_DIR exists and prevent directory traversal
$realImagesDir = realpath(IMAGES_DIR);
if (!$realImagesDir) {
    if (!mkdir(IMAGES_DIR, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Images directory does not exist and could not be created.']);
        exit;
    }
    $realImagesDir = realpath(IMAGES_DIR);
}

// 3. Process image with GD: resize if > 1600px width and save
$processed = false;

if ($extension !== 'gif' && extension_loaded('gd')) {
    $srcImg = null;
    switch ($mime) {
        case 'image/jpeg':
        case 'image/jpg':
            $srcImg = @imagecreatefromjpeg($tmpPath);
            break;
        case 'image/png':
            $srcImg = @imagecreatefrompng($tmpPath);
            break;
        case 'image/webp':
            $srcImg = @imagecreatefromwebp($tmpPath);
            break;
    }

    if ($srcImg) {
        $origW = imagesx($srcImg);
        $origH = imagesy($srcImg);

        $maxW = 1600;
        if ($origW > $maxW) {
            $newW = $maxW;
            $newH = (int)round(($origH / $origW) * $newW);

            $dstImg = imagecreatetruecolor($newW, $newH);
            if ($mime === 'image/png' || $mime === 'image/webp') {
                imagealphablending($dstImg, false);
                imagesavealpha($dstImg, true);
            }

            imagecopyresampled($dstImg, $srcImg, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
            imagedestroy($srcImg);
            $srcImg = $dstImg;
        }

        // Save with compression
        if ($extension === 'jpeg') {
            $processed = imagejpeg($srcImg, $destPath, 85);
        } elseif ($extension === 'png') {
            $processed = imagepng($srcImg, $destPath, 8);
        } elseif ($extension === 'webp') {
            $processed = imagewebp($srcImg, $destPath, 85);
        }
        imagedestroy($srcImg);
    }
}

// Fallback to move_uploaded_file if GD is not present or processing failed
if (!$processed) {
    $moved = move_uploaded_file($tmpPath, $destPath);
    if (!$moved) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to save uploaded image to images directory.']);
        exit;
    }
}

// 4. Double check realpath of written file to strictly prevent directory traversal
$realDestPath = realpath($destPath);
if (!$realDestPath || strpos($realDestPath, $realImagesDir) !== 0) {
    @unlink($destPath);
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid destination path detected.']);
    exit;
}

$relativePath = 'images/' . ltrim(str_replace('\\', '/', substr($realDestPath, strlen($realImagesDir))), '/');

// Audit log
$subMsg = !empty($targetSubfolder) ? "into {$targetSubfolder}" : "into gallery";
log_change_action('Photo Uploaded', "Uploaded photo " . basename($destPath) . " {$subMsg}.");

echo json_encode([
    'success' => true,
    'message' => 'Image uploaded and processed successfully.',
    'imagePath' => $relativePath,
    'path' => $relativePath,
    'filename' => basename($destPath)
]);
