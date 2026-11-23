<?php
/**
 * Kunja Homestay — Mail & Hostinger SMTP Configuration
 * Free 6-Digit Email OTP Delivery with Automatic PHP mail() Fallback
 */

return [
    // Hostinger SMTP Settings
    'smtp_host'     => 'smtp.hostinger.com',
    'smtp_port'     => 465,                     // 465 for SSL, or 587 for TLS
    'smtp_secure'   => 'ssl',                   // 'ssl' or 'tls'
    'smtp_username' => 'support@kunjahomestay.com', // Configured in Hostinger Email
    'smtp_password' => '',                      // Hostinger Email Password
    'from_email'    => 'support@kunjahomestay.com',
    'from_name'     => 'Kunja Homestay Security'
];
