<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once dirname(__DIR__) . "/CONFIG/db_config.php";

// Verify owner session
$userRole = $_SESSION['user_type'] ?? $_SESSION['role'] ?? null;
if ($userRole !== 'owner') {
    // Uncomment the lines below once login.php sets $_SESSION['user_type'] = 'owner'
    // http_response_code(401);
    // echo json_encode(['success' => false, 'error' => 'Unauthorized', 'redirect' => 'login.html']);
    // exit();
}

// Handle POST requests (Delete reservation)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $deleteId = isset($input['delete_id']) ? (int) $input['delete_id'] : 0;

    if ($deleteId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid reservation ID.']);
        exit();
    }

    $stmt = $conn->prepare("DELETE FROM reservations WHERE reservation_id = ?");
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $conn->error]);
        exit();
    }

    $stmt->bind_param("i", $deleteId);
    $executed = $stmt->execute();
    $stmt->close();

    if (!$executed) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database delete failed.']);
        exit();
    }

    echo json_encode(['success' => true]);
    exit();
}

// Handle GET requests (Fetch all reservations)
$sql = "SELECT 
            r.reservation_id,
            r.Preffered_date,
            r.preffered_time,
            r.add_Message,
            c.first_name,
            c.last_name,
            c.email,
            c.phone,
            v.make,
            v.brand,
            v.model,
            v.year,
            v.image
        FROM reservations r
        INNER JOIN customers c ON r.customer_id = c.id
        INNER JOIN vehicles v ON r.veh_id = v.veh_id
        ORDER BY r.Preffered_date DESC, r.preffered_time DESC";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $conn->error]);
    exit();
}

$reservations = [];
while ($row = $result->fetch_assoc()) {
    $reservations[] = $row;
}
$result->free();

echo json_encode([
    'success' => true,
    'reservations' => $reservations
]);