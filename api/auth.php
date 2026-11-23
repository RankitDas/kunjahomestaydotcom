<?php
/**
 * Kunja Homestay — Authentication Endpoint
 * Handles login, session status check, logout, and password/username changes.
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// 1. Check Session Status
if ($action === 'status') {
    $hasCreds = has_admin_credentials();
    $creds = $hasCreds ? get_credentials() : null;
    echo json_encode([
        'authenticated' => is_authenticated(),
        'setup_required' => !$hasCreds,
        'username' => is_authenticated() ? ($_SESSION['admin_username'] ?? 'Owner') : null,
        'csrf_token' => get_csrf_token(),
        'is_default_password' => is_authenticated() ? (!empty($creds['is_default_password'])) : false
    ]);
    exit;
}

// 1.5. First-time Setup: Create Master Owner Account
if ($action === 'setup') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    if (has_admin_credentials()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Setup has already been completed. Please sign in.']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        $input = $_POST;
    }

    $username = trim($input['username'] ?? '');
    $password = (string)($input['password'] ?? '');

    if (empty($username) || strlen($username) < 3) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Username must be at least 3 characters long.']);
        exit;
    }

    if (empty($password) || strlen($password) < 8) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Password must be at least 8 characters long.']);
        exit;
    }

    $data = [
        'username' => $username,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'is_default_password' => false,
        'failed_attempts' => 0,
        'lockout_until' => 0,
        'updated_at' => date('c')
    ];
    save_credentials($data);

    // Auto-login upon setup
    session_regenerate_id(true);
    $_SESSION['is_kunja_admin'] = true;
    $_SESSION['admin_username'] = $username;
    $_SESSION['login_time'] = time();

    echo json_encode([
        'success' => true,
        'message' => 'Admin account created successfully.',
        'username' => $username,
        'csrf_token' => get_csrf_token(),
        'is_default_password' => false
    ]);
    exit;
}

// 2. Login
if ($action === 'login') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        $input = $_POST;
    }

    $username = trim($input['username'] ?? '');
    $password = (string)($input['password'] ?? '');

    $creds = get_credentials();
    if (!$creds) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Admin account not set up yet. Please complete setup first.']);
        exit;
    }
    $now = time();

    // Check Lockout
    if (!empty($creds['lockout_until']) && $creds['lockout_until'] > $now) {
        $waitMinutes = ceil(($creds['lockout_until'] - $now) / 60);
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => "Account is locked due to too many failed attempts. Please try again in {$waitMinutes} minute(s)."
        ]);
        exit;
    }

    // Verify Credentials
    if ($username === $creds['username'] && password_verify($password, $creds['password_hash'])) {
        // Reset failed attempts
        $creds['failed_attempts'] = 0;
        $creds['lockout_until'] = 0;
        save_credentials($creds);

        // Regenerate Session ID to prevent session fixation
        session_regenerate_id(true);
        $_SESSION['is_kunja_admin'] = true;
        $_SESSION['admin_username'] = $username;
        $_SESSION['login_time'] = time();

        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'username' => $username,
            'csrf_token' => get_csrf_token(),
            'is_default_password' => !empty($creds['is_default_password'])
        ]);
        exit;
    } else {
        // Increment failed attempts
        $failed = ($creds['failed_attempts'] ?? 0) + 1;
        $creds['failed_attempts'] = $failed;
        $lockoutMsg = '';

        if ($failed >= 5) {
            $creds['lockout_until'] = $now + (15 * 60); // 15-minute lockout
            $creds['failed_attempts'] = 0; // reset counter after locking
            $lockoutMsg = ' Too many failed attempts. Account locked for 15 minutes.';
        }

        save_credentials($creds);

        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid username or password.' . $lockoutMsg
        ]);
        exit;
    }
}

// 3. Logout
if ($action === 'logout') {
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
    exit;
}

// 4. Update Account Security (Username & Password)
if ($action === 'update_security') {
    require_auth();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        $input = $_POST;
    }

    $csrf = $input['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!verify_csrf_token($csrf)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Invalid or expired CSRF token']);
        exit;
    }

    $currentPassword = (string)($input['current_password'] ?? '');
    $newUsername = trim($input['new_username'] ?? '');
    $newPassword = (string)($input['new_password'] ?? '');

    $creds = get_credentials();

    if (!password_verify($currentPassword, $creds['password_hash'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Current password verification failed.']);
        exit;
    }

    if (!empty($newUsername)) {
        $creds['username'] = $newUsername;
        $_SESSION['admin_username'] = $newUsername;
    }

    if (!empty($newPassword)) {
        if (strlen($newPassword) < 8) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'New password must be at least 8 characters long.']);
            exit;
        }
        $creds['password_hash'] = password_hash($newPassword, PASSWORD_DEFAULT);
        $creds['is_default_password'] = false;
    }

    save_credentials($creds);

    echo json_encode([
        'success' => true,
        'message' => 'Account security settings updated successfully.',
        'username' => $creds['username'],
        'is_default_password' => false
    ]);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid action']);
