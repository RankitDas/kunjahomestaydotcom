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

// Check if admin credentials file exists
function has_admin_credentials() {
    return file_exists(CREDENTIALS_FILE);
}

function get_credentials() {
    if (!file_exists(CREDENTIALS_FILE)) {
        return null;
    }
    $raw = file_get_contents(CREDENTIALS_FILE);
    return json_decode($raw, true);
}

function save_credentials($data) {
    $data['updated_at'] = date('c');
    file_put_contents(CREDENTIALS_FILE, json_encode($data, JSON_PRETTY_PRINT), LOCK_EX);
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
