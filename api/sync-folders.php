<?php
/**
 * Kunja Homestay — Folder Auto-Sync API
 * Scans ./images/ subdirectories recursively using RecursiveDirectoryIterator
 * and synchronizes new photos into kunjaData.json (gallery and properties/rooms)
 * without overwriting existing titles, captions, prices, or user edits.
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
$input = json_decode(file_get_contents('php://input'), true);
if (is_array($input) && isset($input['csrf_token'])) {
    $csrf = $input['csrf_token'];
}

if (!verify_csrf_token($csrf)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Invalid or expired CSRF token']);
    exit;
}

if (!file_exists(DATA_FILE)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'kunjaData.json file not found.']);
    exit;
}

$dataRaw = file_get_contents(DATA_FILE);
$data = json_decode($dataRaw, true);
if (!is_array($data)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON in kunjaData.json']);
    exit;
}

$imagesRoot = realpath(IMAGES_DIR);
if (!$imagesRoot || !is_dir($imagesRoot)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Images directory not found.']);
    exit;
}

// Build index of already tracked image paths
$existingPaths = [];
if (!empty($data['gallery']) && is_array($data['gallery'])) {
    foreach ($data['gallery'] as $g) {
        if (!empty($g['image'])) $existingPaths[ltrim($g['image'], '/')] = true;
    }
}
if (!empty($data['rooms']) && is_array($data['rooms'])) {
    foreach ($data['rooms'] as $r) {
        if (!empty($r['images']) && is_array($r['images'])) {
            foreach ($r['images'] as $img) {
                $existingPaths[ltrim($img, '/')] = true;
            }
        }
    }
}
if (!empty($data['properties']) && is_array($data['properties'])) {
    foreach ($data['properties'] as $prop) {
        if (!empty($prop['coverImage'])) $existingPaths[ltrim($prop['coverImage'], '/')] = true;
        if (!empty($prop['rooms']) && is_array($prop['rooms'])) {
            foreach ($prop['rooms'] as $r) {
                if (!empty($r['images']) && is_array($r['images'])) {
                    foreach ($r['images'] as $img) {
                        $existingPaths[ltrim($img, '/')] = true;
                    }
                }
            }
        }
    }
}

$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
$newFilesDiscovered = [];
$addedToGallery = 0;
$addedToRooms = 0;

$dirIterator = new RecursiveDirectoryIterator($imagesRoot, RecursiveDirectoryIterator::SKIP_DOTS);
$iterator = new RecursiveIteratorIterator($dirIterator, RecursiveIteratorIterator::SELF_FIRST);

foreach ($iterator as $item) {
    if ($item->isFile()) {
        $ext = strtolower($item->getExtension());
        if (!in_array($ext, $allowedExtensions)) continue;

        $fullPath = $item->getRealPath();
        // Calculate relative path from repository root, e.g. "images/gallery/photo1.jpg"
        $relPath = 'images/' . ltrim(str_replace('\\', '/', substr($fullPath, strlen($imagesRoot))), '/');

        if (!isset($existingPaths[$relPath])) {
            $newFilesDiscovered[] = $relPath;
            $existingPaths[$relPath] = true;

            // Route image according to folder name
            if (strpos($relPath, 'images/certificates/') === 0) {
                $data['siteConfig']['recognition']['certificateImage'] = $relPath;
            } elseif (strpos($relPath, 'images/kunja_bati_homestay/') === 0 || strpos($relPath, 'images/building-1/') === 0) {
                if (!empty($data['properties'][0]['rooms'][0])) {
                    $data['properties'][0]['rooms'][0]['images'][] = $relPath;
                    $addedToRooms++;
                }
            } elseif (strpos($relPath, 'images/kunja_homestay/') === 0 || strpos($relPath, 'images/building-2/') === 0) {
                if (!empty($data['properties'][1]['rooms'][0])) {
                    $data['properties'][1]['rooms'][0]['images'][] = $relPath;
                    $addedToRooms++;
                }
            }
            // Note: Never auto-inject generic raw images into the public gallery to prevent unwanted duplicate clutter
        }
    }
}

// Keep flat rooms synchronized with properties rooms
if (!empty($data['properties']) && is_array($data['properties'])) {
    $flatRooms = [];
    foreach ($data['properties'] as $prop) {
        if (!empty($prop['rooms']) && is_array($prop['rooms'])) {
            foreach ($prop['rooms'] as $rm) {
                $flatRooms[] = $rm;
            }
        }
    }
    $data['rooms'] = $flatRooms;
}

if (count($newFilesDiscovered) > 0) {
    // Create backup before saving
    if (!is_dir(BACKUP_DIR)) {
        mkdir(BACKUP_DIR, 0755, true);
    }
    file_put_contents(BACKUP_DIR . '/kunjaData.bak.json', $dataRaw, LOCK_EX);
    file_put_contents(DATA_FILE, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

echo json_encode([
    'success' => true,
    'message' => count($newFilesDiscovered) . ' new photos synced successfully.',
    'newFilesCount' => count($newFilesDiscovered),
    'addedToGallery' => $addedToGallery,
    'addedToRooms' => $addedToRooms,
    'newFiles' => $newFilesDiscovered
]);
