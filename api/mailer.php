<?php
/**
 * Kunja Homestay — Free 6-Digit Email OTP Dispatcher
 * Sends HTML Email via Hostinger SMTP (Socket Connection) with automatic PHP mail() Fallback.
 * No external composer packages or paid APIs needed.
 */

function send_otp_email($recipientEmail, $recipientName, $otpCode, $purpose = 'Registration') {
    $configFile = __DIR__ . '/mail_config.php';
    $config = file_exists($configFile) ? require $configFile : [];

    $fromEmail = $config['from_email'] ?? 'support@kunjahomestay.com';
    $fromName  = $config['from_name'] ?? 'Kunja Homestay Security';
    $subject   = "Kunja Homestay Owner Desk — Your 6-Digit Verification Code: {$otpCode}";

    $htmlBody = <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Kunja Homestay Verification</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF5EE; margin: 0; padding: 24px; color: #2C2825;">
  <div style="max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E2D9CC; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
    <div style="background: #1B382B; padding: 24px 28px; text-align: center;">
      <h1 style="color: #FAF5EE; margin: 0; font-size: 22px; letter-spacing: -0.02em;">Kunja Homestay</h1>
      <p style="color: #C69249; margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 600;">Bolpur, Santiniketan • Owner Desk</p>
    </div>
    
    <div style="padding: 28px 28px 32px;">
      <h2 style="font-size: 18px; color: #1B382B; margin-top: 0;">Verification Code</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #5C554E;">
        Hello <strong>{$recipientName}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #5C554E;">
        You requested a 6-digit one-time password (OTP) for <strong>{$purpose}</strong> on the Kunja Homestay Owner Desk.
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <div style="display: inline-block; background: #F3ECE1; border: 2px dashed #C69249; border-radius: 8px; padding: 14px 28px; font-size: 32px; font-weight: 700; letter-spacing: 0.25em; color: #1B382B;">
          {$otpCode}
        </div>
        <p style="font-size: 12px; color: #8C827A; margin-top: 10px;">This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>

      <p style="font-size: 13px; color: #8C827A; line-height: 1.5; border-top: 1px solid #EFE8DE; padding-top: 16px; margin-bottom: 0;">
        If you did not initiate this request, please disregard this email or review your homestay security settings.
      </p>
    </div>
  </div>
</body>
</html>
HTML;

    // 1. Attempt Native SMTP Socket connection if SMTP password is provided
    if (!empty($config['smtp_password']) && !empty($config['smtp_host'])) {
        $smtpSent = send_via_smtp_socket($config, $recipientEmail, $subject, $htmlBody);
        if ($smtpSent) {
            return true;
        }
    }

    // 2. Automatic Fallback to standard PHP mail()
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=utf-8',
        "From: {$fromName} <{$fromEmail}>",
        "Reply-To: {$fromEmail}",
        'X-Mailer: PHP/' . phpversion()
    ];

    $mailSent = @mail($recipientEmail, $subject, $htmlBody, implode("\r\n", $headers));
    return $mailSent;
}

// Lightweight native SMTP Socket implementation (No 3rd-party libraries needed)
function send_via_smtp_socket($config, $to, $subject, $body) {
    $host = $config['smtp_host'];
    $port = $config['smtp_port'] ?? 465;
    $secure = $config['smtp_secure'] ?? 'ssl';
    $user = $config['smtp_username'];
    $pass = $config['smtp_password'];
    $from = $config['from_email'];
    $fromName = $config['from_name'];

    $prefix = ($secure === 'ssl') ? 'ssl://' : '';
    $socket = @fsockopen($prefix . $host, $port, $errno, $errstr, 10);
    if (!$socket) return false;

    $read = function() use ($socket) {
        $res = '';
        while ($str = fgets($socket, 515)) {
            $res .= $str;
            if (substr($str, 3, 1) === ' ') break;
        }
        return $res;
    };

    $write = function($cmd) use ($socket) {
        fputs($socket, $cmd . "\r\n");
    };

    $read();
    $write("EHLO " . ($_SERVER['SERVER_NAME'] ?? 'localhost'));
    $read();

    if ($secure === 'tls') {
        $write("STARTTLS");
        $read();
        stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
        $write("EHLO " . ($_SERVER['SERVER_NAME'] ?? 'localhost'));
        $read();
    }

    $write("AUTH LOGIN");
    $read();
    $write(base64_encode($user));
    $read();
    $write(base64_encode($pass));
    $authRes = $read();
    if (substr($authRes, 0, 3) !== '235') {
        fclose($socket);
        return false;
    }

    $write("MAIL FROM: <{$from}>");
    $read();
    $write("RCPT TO: <{$to}>");
    $read();
    $write("DATA");
    $read();

    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: {$fromName} <{$from}>\r\n";
    $headers .= "To: <{$to}>\r\n";
    $headers .= "Subject: {$subject}\r\n";

    $write($headers . "\r\n" . $body . "\r\n.");
    $read();
    $write("QUIT");
    fclose($socket);
    return true;
}
