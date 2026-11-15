<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/../config/auth.php';

$user = getCurrentUser($conn);
echo json_encode([
    'authenticated' => $user !== null,
    'userType' => $user['user_type'] ?? null,
]);
