<?php
/**
 * Kunja Homestay — Public Guest Review Submission API
 * Strictly scoped to appending unapproved guest reviews to kunjaData.json.
 * Includes honeypot spam check, input sanitization, length limits, and basic rate limiting.
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
if (!is_array($input)) {
    $input = $_POST;
}

// 1. Honeypot spam check
$honeypot = trim($input['website'] ?? $input['hp_field'] ?? '');
if ($honeypot !== '') {
    // Pretend success to bots without saving
    echo json_encode(['success' => true, 'message' => 'Thank you! Your review has been submitted and will appear once approved by our team.']);
    exit;
}

// 2. Basic IP-based rate limiting (max 5 submissions per hour)
$ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
$ipHash = hash('sha256', $ip . 'kunja_rev_salt_2026');
$rateFile = __DIR__ . '/review_ratelimit.json';
$now = time();
$rates = [];
if (file_exists($rateFile)) {
    $decoded = json_decode(file_get_contents($rateFile), true);
    if (is_array($decoded)) {
        $rates = $decoded;
    }
}
// Clean old entries (> 3600s)
foreach ($rates as $k => $timestamps) {
    $rates[$k] = array_values(array_filter((array)$timestamps, function($ts) use ($now) {
        return ($now - $ts) < 3600;
    }));
    if (empty($rates[$k])) {
        unset($rates[$k]);
    }
}
if (isset($rates[$ipHash]) && count($rates[$ipHash]) >= 5) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Too many review submissions. Please try again later.']);
    exit;
}

// 3. Sanitize & Validate Inputs
$guestName = strip_tags(trim($input['guestName'] ?? ''));
$property  = strip_tags(trim($input['property'] ?? 'Kunja Homestay'));
$rating    = intval($input['rating'] ?? 5);
$reviewText = strip_tags(trim($input['reviewText'] ?? ''));

if (mb_strlen($guestName) < 2 || mb_strlen($guestName) > 80) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Please enter your name (2 to 80 characters).']);
    exit;
}

if (mb_strlen($reviewText) < 5 || mb_strlen($reviewText) > 1000) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Please write a short review (5 to 1000 characters).']);
    exit;
}

if ($rating < 1 || $rating > 5) {
    $rating = 5;
}

$allowedProps = ['Kunja Bati Homestay', 'Kunja Homestay'];
if (!in_array($property, $allowedProps, true)) {
    $property = 'Kunja Homestay';
}

// 4. Load kunjaData.json, append pending review, and save atomically
if (!file_exists(DATA_FILE)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Homestay data file not found.']);
    exit;
}

$data = json_decode(file_get_contents(DATA_FILE), true);
if (!is_array($data)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to parse homestay data.']);
    exit;
}

if (!isset($data['reviews']) || !is_array($data['reviews'])) {
    $data['reviews'] = [];
}

$newReview = [
    'id'         => 'rev-' . time() . '-' . mt_rand(100, 999),
    'guestName'  => $guestName,
    'property'   => $property,
    'hometown'   => $property,
    'rating'     => $rating,
    'quote'      => '',
    'reviewText' => $reviewText,
    'approved'   => false,
    'createdAt'  => date('c'),
    'adminReply' => ''
];

array_unshift($data['reviews'], $newReview);

$jsonString = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if ($jsonString === false || file_put_contents(DATA_FILE, $jsonString, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save your review. Please try again.']);
    exit;
}

// Record rate limit hit
$rates[$ipHash][] = $now;
file_put_contents($rateFile, json_encode($rates), LOCK_EX);

echo json_encode([
    'success' => true,
    'message' => 'Thank you! Your review has been submitted and will appear once approved by our team.'
]);
