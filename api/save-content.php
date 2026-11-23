<?php
/**
 * Kunja Homestay — Save Content API
 * Authenticated endpoint for saving updates to kunjaData.json with automatic backup & atomic file lock.
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON input payload']);
    exit;
}

$csrf = $input['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
if (!verify_csrf_token($csrf)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Invalid or expired CSRF token']);
    exit;
}

$data = $input['data'] ?? null;
if (!is_array($data) || empty($data['siteConfig']) || empty($data['contact'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Data payload must contain siteConfig and contact objects']);
    exit;
}

// 1. Create automatic backup of current kunjaData.json
if (!is_dir(BACKUP_DIR)) {
    mkdir(BACKUP_DIR, 0755, true);
}

if (file_exists(DATA_FILE)) {
    $currentContent = file_get_contents(DATA_FILE);
    file_put_contents(BACKUP_DIR . '/kunjaData.bak.json', $currentContent, LOCK_EX);
    
    // Also store timestamped rotation backup (keep max 10)
    $backupFile = BACKUP_DIR . '/kunjaData_' . date('Ymd_His') . '.json';
    file_put_contents($backupFile, $currentContent, LOCK_EX);

    $allBackups = glob(BACKUP_DIR . '/kunjaData_*.json');
    if (count($allBackups) > 10) {
        sort($allBackups);
        $toDelete = array_slice($allBackups, 0, count($allBackups) - 10);
        foreach ($toDelete as $f) {
            @unlink($f);
        }
    }
}

// 2. Atomic write to kunjaData.json with LOCK_EX
$jsonString = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if ($jsonString === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to encode JSON data']);
    exit;
}

$writeResult = file_put_contents(DATA_FILE, $jsonString, LOCK_EX);
if ($writeResult === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to write to kunjaData.json. Check file permissions.']);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Homestay data updated and backed up successfully.',
    'timestamp' => date('c'),
    'bytes_written' => $writeResult
]);
