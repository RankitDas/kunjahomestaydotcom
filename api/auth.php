<?php
/**
 * Kunja Homestay — Authentication Endpoint
 * Supports Multi-Admin (Max 3), Strong Passwords, and 6-Digit Email OTP verification.
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/mailer.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Helper to get raw JSON payload
function get_json_input() {
    $input = json_decode(file_get_contents('php://input'), true);
    return is_array($input) ? $input : $_POST;
}

// 1. Status Check
if ($action === 'status') {
    $creds = get_credentials();
    $admins = $creds['admins'] ?? [];
    $adminCount = count($admins);

    $currentUser = null;
    if (is_authenticated()) {
        $curId = $_SESSION['admin_id'] ?? '';
        foreach ($admins as $a) {
            if ($a['id'] === $curId || $a['email'] === ($_SESSION['admin_email'] ?? '')) {
                $currentUser = [
                    'id' => $a['id'],
                    'name' => $a['name'],
                    'email' => $a['email'],
                    'phone' => $a['phone']
                ];
                break;
            }
        }
    }

    echo json_encode([
        'authenticated'   => is_authenticated(),
        'setup_required'  => ($adminCount === 0),
        'admin_count'     => $adminCount,
        'max_admins'      => MAX_ADMINS,
        'can_register'    => ($adminCount < MAX_ADMINS),
        'current_admin'   => $currentUser,
        'csrf_token'      => get_csrf_token()
    ]);
    exit;
}

// 2. Request 6-Digit OTP via Email (For Registration OR Password Reset)
if ($action === 'request_otp') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    $input = get_json_input();
    $email = strtolower(trim($input['email'] ?? ''));
    $purpose = trim($input['purpose'] ?? 'register'); // 'register' or 'reset'
    $name = trim($input['name'] ?? 'Homestay Admin');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Please provide a valid email address.']);
        exit;
    }

    $creds = get_credentials();
    $admins = $creds['admins'] ?? [];

    if ($purpose === 'register') {
        if (count($admins) >= MAX_ADMINS) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Maximum of 3 administrators already registered.']);
            exit;
        }
        foreach ($admins as $a) {
            if (strtolower($a['email']) === $email) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'An administrator with this email already exists.']);
                exit;
            }
        }
    } elseif ($purpose === 'reset') {
        $found = false;
        foreach ($admins as $a) {
            if (strtolower($a['email']) === $email) {
                $found = true;
                $name = $a['name'];
                break;
            }
        }
        if (!$found) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'No administrator found with this email address.']);
            exit;
        }
    }

    // Generate 6-Digit Cryptographic OTP
    $otp = (string)random_int(100000, 999999);
    $expires = time() + (10 * 60); // 10 minutes

    // Store hashed OTP
    $creds['otps'][$email] = [
        'hash'    => password_hash($otp, PASSWORD_DEFAULT),
        'expires' => $expires,
        'purpose' => $purpose
    ];
    save_credentials($creds);

    // Send OTP via Email
    $sent = send_otp_email($email, $name, $otp, ($purpose === 'reset' ? 'Password Reset' : 'Admin Registration'));

    echo json_encode([
        'success' => true,
        'message' => 'A 6-digit verification code has been sent to your email address.',
        'expires_in' => 600,
        // Include development code if running locally without mail setup
        'dev_hint' => (!empty($_SERVER['SERVER_NAME']) && $_SERVER['SERVER_NAME'] === 'localhost') ? "Code: {$otp}" : null
    ]);
    exit;
}

// 3. Register New Admin (Requires Valid 6-Digit OTP + Strong Password)
if ($action === 'register') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    $input = get_json_input();
    $name     = trim($input['name'] ?? '');
    $email    = strtolower(trim($input['email'] ?? ''));
    $phone    = sanitize_phone($input['phone'] ?? '');
    $password = (string)($input['password'] ?? '');
    $otp      = trim($input['otp'] ?? '');

    if (empty($name) || strlen($name) < 2) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Full Name is required.']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'A valid email address is required.']);
        exit;
    }

    if (empty($phone) || strlen($phone) < 10) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'A valid 10-digit phone / WhatsApp number is required.']);
        exit;
    }

    if (!validate_strong_password($password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character (e.g. @Rashi321).'
        ]);
        exit;
    }

    $creds = get_credentials();
    $admins = $creds['admins'] ?? [];

    if (count($admins) >= MAX_ADMINS) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Maximum of 3 administrators already registered.']);
        exit;
    }

    // Verify dual uniqueness: Email AND Phone must be unique
    foreach ($admins as $a) {
        if (strtolower($a['email']) === $email) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'An administrator with this email is already registered.']);
            exit;
        }
        if (sanitize_phone($a['phone']) === $phone) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'An administrator with this phone number is already registered.']);
            exit;
        }
    }

    // Verify 6-digit OTP
    $otpRecord = $creds['otps'][$email] ?? null;
    if (!$otpRecord || time() > $otpRecord['expires']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'OTP has expired or was not requested. Please request a new code.']);
        exit;
    }

    if (!password_verify($otp, $otpRecord['hash'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid verification code. Please check your email and try again.']);
        exit;
    }

    // Remove used OTP
    unset($creds['otps'][$email]);

    $newAdmin = [
        'id'            => 'admin-' . time() . '-' . random_int(100, 999),
        'name'          => $name,
        'email'         => $email,
        'phone'         => $phone,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'created_at'    => date('c'),
        'failed_attempts' => 0,
        'lockout_until' => 0
    ];

    $creds['admins'][] = $newAdmin;
    save_credentials($creds);

    // Auto-login upon registration
    session_regenerate_id(true);
    $_SESSION['is_kunja_admin'] = true;
    $_SESSION['admin_id']       = $newAdmin['id'];
    $_SESSION['admin_name']     = $newAdmin['name'];
    $_SESSION['admin_email']    = $newAdmin['email'];
    $_SESSION['login_time']     = time();

    echo json_encode([
        'success'       => true,
        'message'       => 'Administrator registered and verified successfully.',
        'current_admin' => [
            'id'    => $newAdmin['id'],
            'name'  => $newAdmin['name'],
            'email' => $newAdmin['email'],
            'phone' => $newAdmin['phone']
        ],
        'csrf_token'    => get_csrf_token()
    ]);
    exit;
}

// 4. Regular Login: Email OR Phone + Password (NO OTP REQUIRED)
if ($action === 'login') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    $input = get_json_input();
    $identifier = trim($input['identifier'] ?? $input['username'] ?? '');
    $password   = (string)($input['password'] ?? '');

    if (empty($identifier) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email/Phone and Password are required.']);
        exit;
    }

    $creds = get_credentials();
    $admins = $creds['admins'] ?? [];
    $now = time();

    // Match by Email OR Phone OR Username
    $matchedIndex = -1;
    $cleanId = sanitize_phone($identifier);
    $lowerId = strtolower($identifier);

    foreach ($admins as $idx => $a) {
        if (strtolower($a['email']) === $lowerId || 
            (!empty($cleanId) && sanitize_phone($a['phone']) === $cleanId) ||
            (!empty($a['username']) && strtolower($a['username']) === $lowerId)) {
            $matchedIndex = $idx;
            break;
        }
    }

    if ($matchedIndex === -1) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'No administrator found matching that Email or Phone.']);
        exit;
    }

    $admin = &$creds['admins'][$matchedIndex];

    // Check Lockout
    if (!empty($admin['lockout_until']) && $admin['lockout_until'] > $now) {
        $remaining = ceil(($admin['lockout_until'] - $now) / 60);
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => "Account is locked due to too many failed attempts. Try again in {$remaining} minute(s)."]);
        exit;
    }

    // Verify Password
    if (password_verify($password, $admin['password_hash'])) {
        $admin['failed_attempts'] = 0;
        $admin['lockout_until'] = 0;
        save_credentials($creds);

        session_regenerate_id(true);
        $_SESSION['is_kunja_admin'] = true;
        $_SESSION['admin_id']       = $admin['id'];
        $_SESSION['admin_name']     = $admin['name'];
        $_SESSION['admin_email']    = $admin['email'];
        $_SESSION['login_time']     = time();

        echo json_encode([
            'success'       => true,
            'message'       => 'Login successful',
            'current_admin' => [
                'id'    => $admin['id'],
                'name'  => $admin['name'],
                'email' => $admin['email'],
                'phone' => $admin['phone']
            ],
            'csrf_token'    => get_csrf_token()
        ]);
        exit;
    } else {
        $failed = ($admin['failed_attempts'] ?? 0) + 1;
        $admin['failed_attempts'] = $failed;
        $lockMsg = '';
        if ($failed >= 5) {
            $admin['lockout_until'] = $now + (15 * 60);
            $admin['failed_attempts'] = 0;
            $lockMsg = ' Too many failed attempts. Account locked for 15 minutes.';
        }
        save_credentials($creds);

        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid password.' . $lockMsg]);
        exit;
    }
}

// 5. Password Reset via Email OTP
if ($action === 'reset_password') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    $input = get_json_input();
    $email       = strtolower(trim($input['email'] ?? ''));
    $otp         = trim($input['otp'] ?? '');
    $newPassword = (string)($input['new_password'] ?? '');

    if (!validate_strong_password($newPassword)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'New password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
        ]);
        exit;
    }

    $creds = get_credentials();
    $otpRecord = $creds['otps'][$email] ?? null;

    if (!$otpRecord || time() > $otpRecord['expires'] || $otpRecord['purpose'] !== 'reset') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Verification code expired or invalid. Please request a new code.']);
        exit;
    }

    if (!password_verify($otp, $otpRecord['hash'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid verification code.']);
        exit;
    }

    $found = false;
    foreach ($creds['admins'] as &$a) {
        if (strtolower($a['email']) === $email) {
            $a['password_hash'] = password_hash($newPassword, PASSWORD_DEFAULT);
            $a['failed_attempts'] = 0;
            $a['lockout_until'] = 0;
            $found = true;
            break;
        }
    }

    if (!$found) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Admin account not found.']);
        exit;
    }

    unset($creds['otps'][$email]);
    save_credentials($creds);

    echo json_encode(['success' => true, 'message' => 'Password reset successfully. You can now log in.']);
    exit;
}

// 6. List Administrators (Requires Login)
if ($action === 'list_admins') {
    require_auth();
    $creds = get_credentials();
    $list = array_map(function($a) {
        return [
            'id'         => $a['id'],
            'name'       => $a['name'],
            'email'      => $a['email'],
            'phone'      => $a['phone'],
            'created_at' => $a['created_at'] ?? null
        ];
    }, $creds['admins'] ?? []);

    echo json_encode(['success' => true, 'admins' => $list, 'max' => MAX_ADMINS]);
    exit;
}

// 7. Remove an Administrator (Requires Login, at least 1 admin must remain)
if ($action === 'remove_admin') {
    require_auth();
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    $input = get_json_input();
    $csrf = $input['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!verify_csrf_token($csrf)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Invalid or expired CSRF token']);
        exit;
    }

    $targetId = trim($input['admin_id'] ?? '');
    $creds = get_credentials();
    $admins = $creds['admins'] ?? [];

    if (count($admins) <= 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'At least one administrator must remain active.']);
        exit;
    }

    $filtered = [];
    $found = false;
    foreach ($admins as $a) {
        if ($a['id'] === $targetId) {
            $found = true;
        } else {
            $filtered[] = $a;
        }
    }

    if (!$found) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Administrator ID not found.']);
        exit;
    }

    $creds['admins'] = $filtered;
    save_credentials($creds);

    // If current logged in admin removed themselves, destroy session
    if (($_SESSION['admin_id'] ?? '') === $targetId) {
        $_SESSION = [];
        session_destroy();
    }

    echo json_encode(['success' => true, 'message' => 'Administrator removed successfully.']);
    exit;
}

// 8. Logout
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

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid action']);
