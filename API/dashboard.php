<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/../config/auth.php';

function normalizeVehicleImage($image): string
{
    $value = trim((string) ($image ?? ''));
    if ($value === '') {
        return 'statics/image/backgroundimage-car.jpg';
    }

    if (preg_match('#^(?:https?:)?//#i', $value) || preg_match('#^(?:data:|blob:)#i', $value)) {
        return $value;
    }

    $value = preg_replace('#^\./+#', '', $value);
    $value = preg_replace('#^[\\/]+#', '', $value);

    if (preg_match('#^(?:api/|statics/|images?/|uploads/)#i', $value)) {
        return $value;
    }

    return 'statics/image/backgroundimage-car.jpg';
}

$user = getCurrentUser($conn);
if (!$user || $user['user_type'] !== 'owner') {
    http_response_code(401);
    echo json_encode(['error' => 'Owner access is required.']);
    exit;
}

$result = $conn->query(
    'SELECT veh_id, make, model, year, price, engine, image, status
     FROM vehicles
     ORDER BY veh_id DESC'
);

$vehicles = [];
while ($row = $result->fetch_assoc()) {
    $vehicles[] = [
        'veh_id' => (int) $row['veh_id'],
        'make' => $row['make'],
        'model' => $row['model'],
        'year' => (int) $row['year'],
        'price' => (float) $row['price'],
        'engine' => $row['engine'],
        'image' => normalizeVehicleImage($row['image']),
        'status' => $row['status'],
    ];
}

echo json_encode(['vehicles' => $vehicles], JSON_UNESCAPED_UNICODE);
$result->free();
