<?php
/**
 * Kunja Homestay — Security, Session & Helper Configurations
 */

// Prevent clickjacking & MIME sniffing
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-Robots-Tag: noindex, nofollow');

// Secure Session Cookie Settings
ini_set('session.use_strict_mode', 1);
ini_set('session.cookie_httponly', 1);
$isHttps = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ||
           (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'domain'   => '',
    'secure'   => $isHttps,
    'httponly' => true,
    'samesite' => 'Strict'
]);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

define('CREDENTIALS_FILE', __DIR__ . '/admin_credentials.json');
define('DATA_FILE', dirname(__DIR__) . '/kunjaData.json');
define('BACKUP_DIR', __DIR__ . '/backups');
define('IMAGES_DIR', dirname(__DIR__) . '/images');
define('PRESENCE_FILE', __DIR__ . '/admin_presence.json');
define('CHANGELOG_FILE', __DIR__ . '/changelog.json');
define('MAX_ADMINS', 3);

// Record admin activity into structured changelog (keeps max 500 entries)
function log_change_action($actionType, $summary) {
    $adminName = $_SESSION['admin_name'] ?? 'Admin';
    $rawEmail = $_SESSION['admin_email'] ?? '';
    $maskedId = function_exists('mask_email') ? mask_email($rawEmail) : (substr($rawEmail, 0, 2) . '***');
    
    $entry = [
        'id'            => 'log-' . time() . '-' . mt_rand(100, 999),
        'timestamp'     => date('d M Y, h:i A') . ' IST',
        'iso'           => date('c'),
        'dateKey'       => date('Y-m-d'),
        'adminName'     => $adminName,
        'adminMaskedId' => "{$adminName} ({$maskedId})",
        'actionType'    => $actionType,
        'summary'       => $summary
    ];

    $logs = [];
    if (file_exists(CHANGELOG_FILE)) {
        $raw = file_get_contents(CHANGELOG_FILE);
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) $logs = $decoded;
    }
    array_unshift($logs, $entry);
    if (count($logs) > 500) {
        $logs = array_slice($logs, 0, 500);
    }
    file_put_contents(CHANGELOG_FILE, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
    
    // Also ping presence
    update_admin_presence();
}

// Update admin presence timestamp
function update_admin_presence() {
    if (!is_authenticated()) return;
    $curId = $_SESSION['admin_id'] ?? '';
    if (!$curId) return;

    $presence = [];
    if (file_exists(PRESENCE_FILE)) {
        $raw = file_get_contents(PRESENCE_FILE);
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) $presence = $decoded;
    }

    $presence[$curId] = [
        'id'        => $curId,
        'name'      => $_SESSION['admin_name'] ?? 'Admin',
        'last_seen' => time()
    ];

    // Clean entries older than 24 hours
    $now = time();
    foreach ($presence as $k => $v) {
        if (($now - ($v['last_seen'] ?? 0)) > 86400) {
            unset($presence[$k]);
        }
    }
    file_put_contents(PRESENCE_FILE, json_encode($presence, JSON_PRETTY_PRINT), LOCK_EX);
}

// Get live online status for all admin IDs (active in last 3 minutes = 180s)
function get_admins_presence_map() {
    if (!file_exists(PRESENCE_FILE)) return [];
    $raw = file_get_contents(PRESENCE_FILE);
    $presence = json_decode($raw, true);
    if (!is_array($presence)) return [];
    
    $now = time();
    $result = [];
    foreach ($presence as $id => $info) {
        $lastSeen = $info['last_seen'] ?? 0;
        $isOnline = ($now - $lastSeen) <= 180;
        $result[$id] = [
            'online'    => $isOnline,
            'last_seen' => $lastSeen
        ];
    }
    return $result;
}

// Check if any admin account is registered
function has_admin_credentials() {
    if (!file_exists(CREDENTIALS_FILE)) return false;
    $creds = get_credentials();
    return !empty($creds['admins']) && count($creds['admins']) > 0;
}

// Return raw admin credentials structure with multi-admin migration support
function get_credentials() {
    if (!file_exists(CREDENTIALS_FILE)) {
        return ['admins' => [], 'otps' => []];
    }
    $raw = file_get_contents(CREDENTIALS_FILE);
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return ['admins' => [], 'otps' => []];
    }
    // Backward compatibility if single admin format was saved
    if (isset($data['username']) && !isset($data['admins'])) {
        $legacy = [
            'id' => 'admin-1',
            'name' => 'Owner',
            'email' => $data['email'] ?? 'owner@kunjahomestay.com',
            'phone' => $data['phone'] ?? '919064629141',
            'username' => $data['username'],
            'password_hash' => $data['password_hash'] ?? '',
            'created_at' => $data['updated_at'] ?? date('c'),
            'failed_attempts' => $data['failed_attempts'] ?? 0,
            'lockout_until' => $data['lockout_until'] ?? 0
        ];
        $data = ['admins' => [$legacy], 'otps' => []];
    }
    if (!isset($data['admins'])) $data['admins'] = [];
    if (!isset($data['otps'])) $data['otps'] = [];
    return $data;
}

function save_credentials($data) {
    $data['updated_at'] = date('c');
    file_put_contents(CREDENTIALS_FILE, json_encode($data, JSON_PRETTY_PRINT), LOCK_EX);
}

// Strong Password Validator: >=8 chars, uppercase, lowercase, digit, special character
function validate_strong_password($password) {
    if (strlen($password) < 8) return false;
    if (!preg_match('/[A-Z]/', $password)) return false;
    if (!preg_match('/[a-z]/', $password)) return false;
    if (!preg_match('/[0-9]/', $password)) return false;
    if (!preg_match('/[^A-Za-z0-9]/', $password)) return false;
    return true;
}

// Sanitize Phone (extract digits)
function sanitize_phone($phone) {
    return preg_replace('/\D+/', '', $phone);
}

function get_csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf_token($token) {
    return !empty($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], (string)$token);
}

function is_authenticated() {
    return !empty($_SESSION['is_kunja_admin']) && $_SESSION['is_kunja_admin'] === true;
}

function require_auth() {
    if (!is_authenticated()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized access. Please log in.']);
        exit;
    }
}
