<?php
/**
 * Kunja Homestay — Visitor Analytics API
 * Privacy-friendly, cookie-free visitor tracking.
 * Records page views, unique daily visitors (hashed IP + date),
 * referrers, and device types without storing personally identifiable info.
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

define('ANALYTICS_FILE', __DIR__ . '/analytics.json');

$action = $_GET['action'] ?? $_POST['action'] ?? 'track';

// 1. Log Visitor Hit (Public endpoint called by app.js on index.html)
if ($action === 'track') {
    // Only accept POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    $today = date('Y-m-d');
    $now = time();

    // Anonymized Visitor Hash: SHA256 of IP + salt + date (changes daily so IP is never stored)
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    if (!empty($forwarded)) {
        $ip = trim(explode(',', $forwarded)[0]);
    }
    $visitorHash = hash('sha256', $ip . 'kunja_salt_2026' . $today);

    // Read payload
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) $input = $_POST;

    $referrer = trim($input['referrer'] ?? $_SERVER['HTTP_REFERER'] ?? 'Direct');
    $page = trim($input['page'] ?? '/');
    $device = trim($input['device'] ?? 'Desktop'); // 'Mobile', 'Tablet', 'Desktop'

    // Categorize referrer
    $refSource = 'Direct / Search';
    $refLower = strtolower($referrer);
    if (strpos($refLower, 'google') !== false) $refSource = 'Google Search';
    elseif (strpos($refLower, 'whatsapp') !== false || strpos($refLower, 'wa.me') !== false) $refSource = 'WhatsApp';
    elseif (strpos($refLower, 'facebook') !== false || strpos($refLower, 'fb.com') !== false) $refSource = 'Facebook';
    elseif (strpos($refLower, 'instagram') !== false) $refSource = 'Instagram';
    elseif (strpos($refLower, 'youtube') !== false) $refSource = 'YouTube';
    elseif (!empty($referrer) && $referrer !== 'Direct' && strpos($refLower, 'kunjahomestay.com') === false) {
        $refSource = 'Other Websites';
    }

    // Load existing analytics
    $analytics = [
        'total_views' => 0,
        'unique_visitors' => 0,
        'daily' => [],
        'referrers' => [
            'Direct / Search' => 0,
            'Google Search' => 0,
            'WhatsApp' => 0,
            'Facebook' => 0,
            'Instagram' => 0,
            'Other Websites' => 0
        ],
        'devices' => [
            'Mobile' => 0,
            'Tablet' => 0,
            'Desktop' => 0
        ],
        'recent_hits' => []
    ];

    if (file_exists(ANALYTICS_FILE)) {
        $raw = file_get_contents(ANALYTICS_FILE);
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $analytics = array_merge($analytics, $decoded);
        }
    }

    // Init today if not exists
    if (!isset($analytics['daily'][$today])) {
        $analytics['daily'][$today] = [
            'date' => $today,
            'views' => 0,
            'uniques' => 0,
            'hashes' => []
        ];
    }

    // Update counts
    $analytics['total_views']++;
    $analytics['daily'][$today]['views']++;

    $isUniqueToday = false;
    if (!in_array($visitorHash, $analytics['daily'][$today]['hashes'] ?? [])) {
        $analytics['daily'][$today]['hashes'][] = $visitorHash;
        $analytics['daily'][$today]['uniques']++;
        $analytics['unique_visitors']++;
        $isUniqueToday = true;
    }

    // Limit stored hashes to prevent file bloating
    if (count($analytics['daily'][$today]['hashes']) > 1000) {
        $analytics['daily'][$today]['hashes'] = array_slice($analytics['daily'][$today]['hashes'], -1000);
    }

    // Keep only last 60 days in daily
    if (count($analytics['daily']) > 60) {
        ksort($analytics['daily']);
        $analytics['daily'] = array_slice($analytics['daily'], -60, null, true);
    }

    // Update referrers & devices
    $analytics['referrers'][$refSource] = ($analytics['referrers'][$refSource] ?? 0) + 1;
    $analytics['devices'][$device] = ($analytics['devices'][$device] ?? 0) + 1;

    // Recent hits record (keep max 30)
    $hitRecord = [
        'time' => date('d M, h:i A'),
        'device' => $device,
        'source' => $refSource,
        'unique' => $isUniqueToday
    ];
    array_unshift($analytics['recent_hits'], $hitRecord);
    if (count($analytics['recent_hits']) > 30) {
        $analytics['recent_hits'] = array_slice($analytics['recent_hits'], 0, 30);
    }

    // Save with atomic lock
    file_put_contents(ANALYTICS_FILE, json_encode($analytics, JSON_PRETTY_PRINT), LOCK_EX);

    echo json_encode([
        'success' => true,
        'views_today' => $analytics['daily'][$today]['views'],
        'uniques_today' => $analytics['daily'][$today]['uniques'],
        'total_views' => $analytics['total_views']
    ]);
    exit;
}

// 2. Fetch Visitor Stats (Protected endpoint for Owner Desk)
if ($action === 'stats') {
    require_auth();

    $analytics = [
        'total_views' => 0,
        'unique_visitors' => 0,
        'daily' => [],
        'referrers' => [],
        'devices' => [],
        'recent_hits' => []
    ];

    if (file_exists(ANALYTICS_FILE)) {
        $raw = file_get_contents(ANALYTICS_FILE);
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $analytics = array_merge($analytics, $decoded);
        }
    }

    $today = date('Y-m-d');
    $yesterday = date('Y-m-d', strtotime('-1 day'));

    $todayViews = $analytics['daily'][$today]['views'] ?? 0;
    $todayUniques = $analytics['daily'][$today]['uniques'] ?? 0;

    $yesterdayViews = $analytics['daily'][$yesterday]['views'] ?? 0;
    $yesterdayUniques = $analytics['daily'][$yesterday]['uniques'] ?? 0;

    // Last 7 days summary
    $last7Days = [];
    for ($i = 6; $i >= 0; $i--) {
        $d = date('Y-m-d', strtotime("-{$i} days"));
        $dayLabel = date('D (j M)', strtotime($d));
        $views = $analytics['daily'][$d]['views'] ?? 0;
        $uniques = $analytics['daily'][$d]['uniques'] ?? 0;
        $last7Days[] = [
            'date' => $d,
            'label' => $dayLabel,
            'views' => $views,
            'uniques' => $uniques
        ];
    }

    // Sanitize daily output (strip internal hashes before returning)
    $cleanDaily = [];
    foreach ($analytics['daily'] as $d => $data) {
        $cleanDaily[$d] = [
            'date' => $d,
            'views' => $data['views'] ?? 0,
            'uniques' => $data['uniques'] ?? 0
        ];
    }

    echo json_encode([
        'success' => true,
        'summary' => [
            'total_views' => $analytics['total_views'],
            'total_uniques' => $analytics['unique_visitors'],
            'today_views' => $todayViews,
            'today_uniques' => $todayUniques,
            'yesterday_views' => $yesterdayViews,
            'yesterday_uniques' => $yesterdayUniques
        ],
        'last7Days' => $last7Days,
        'referrers' => $analytics['referrers'] ?? [],
        'devices' => $analytics['devices'] ?? [],
        'recent_hits' => $analytics['recent_hits'] ?? []
    ]);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid action']);
