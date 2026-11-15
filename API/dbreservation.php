<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

require_once dirname(__DIR__) . '/CONFIG/db_config.php';
require_once dirname(__DIR__) . '/CONFIG/auth.php';

function respond(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

$user = getCurrentUser($conn);
if (!$user || $user['user_type'] !== 'owner') {
    respond(['success' => false, 'error' => 'Owner access is required.'], 401);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        respond(['success' => false, 'error' => 'Invalid reservation request.'], 400);
    }

    $deleteId = filter_var($input['delete_id'] ?? null, FILTER_VALIDATE_INT);

    if (($input['action'] ?? '') !== 'delete' || $deleteId === false || $deleteId < 1) {
        respond(['success' => false, 'error' => 'Invalid reservation request.'], 400);
    }

    try {
        $stmt = $conn->prepare('DELETE FROM reservations WHERE reservation_id = ?');
        $stmt->bind_param('i', $deleteId);
        $stmt->execute();
        $deleted = $stmt->affected_rows;
        $stmt->close();

        if ($deleted === 0) {
            respond(['success' => false, 'error' => 'Reservation not found.'], 404);
        }
        respond(['success' => true]);
    } catch (mysqli_sql_exception $error) {
        error_log('Reservation delete failed: ' . $error->getMessage());
        respond(['success' => false, 'error' => 'The reservation could not be removed.'], 500);
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET, POST');
    respond(['success' => false, 'error' => 'Method not allowed.'], 405);
}

try {
    $result = $conn->query(
        'SELECT
            r.reservation_id,
            r.Preffered_date,
            r.preffered_time,
            r.add_Message,
            c.first_name,
            c.last_name,
            c.email,
            c.phone,
            v.make,
            v.model,
            v.year,
            v.image
         FROM reservations r
         INNER JOIN customers c ON r.customer_id = c.id
         INNER JOIN vehicles v ON r.veh_id = v.veh_id
         ORDER BY r.Preffered_date ASC, r.preffered_time ASC'
    );

    $reservations = [];
    while ($row = $result->fetch_assoc()) {
        $row['reservation_id'] = (int) $row['reservation_id'];
        $row['year'] = (int) $row['year'];
        $image = trim((string) ($row['image'] ?? ''));
        if (preg_match('#^api/uploads/#i', $image)) {
            $image = 'API/' . substr($image, 4);
        }
        $row['image'] = $image !== '' ? $image : 'statics/image/backgroundimage-car.jpg';
        $reservations[] = $row;
    }
    $result->free();

    respond(['success' => true, 'reservations' => $reservations]);
} catch (mysqli_sql_exception $error) {
    error_log('Reservation fetch failed: ' . $error->getMessage());
    respond(['success' => false, 'error' => 'Reservations could not be loaded.'], 500);
}
