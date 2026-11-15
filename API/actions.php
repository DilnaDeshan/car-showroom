<?php
require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/../config/auth.php';
requireOwner($conn, '../login.html?error=owner_only');

function redirectToInventory(?string $error = null): void
{
    $location = '../dbInventory.html';
    if ($error !== null) {
        $location .= '?error=' . rawurlencode($error);
    }

    header('Location: ' . $location);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_vehicle'])) {
    $vehicleId = filter_var($_POST['veh_id'] ?? '', FILTER_VALIDATE_INT);
    $makeModel = trim((string) ($_POST['make_model'] ?? ''));
    $year = filter_var($_POST['year'] ?? '', FILTER_VALIDATE_INT);
    $priceInput = str_replace([',', '$', ' '], '', (string) ($_POST['price'] ?? ''));
    $price = filter_var($priceInput, FILTER_VALIDATE_FLOAT);
    $engine = trim((string) ($_POST['engine'] ?? ''));

    if (
        $makeModel === '' ||
        strlen($makeModel) > 100 ||
        $year === false ||
        $year < 1886 ||
        $price === false ||
        $price <= 0 ||
        $price > 99999999.99 ||
        $engine === '' ||
        strlen($engine) > 50 ||
        isset($_POST['veh_id']) && $_POST['veh_id'] !== '' && ($vehicleId === false || $vehicleId < 1)
    ) {
        redirectToInventory('invalid_vehicle');
    }

    $parts = preg_split('/\s+/', $makeModel, 2);
    $make = $parts[0];
    $brand = $make;
    $model = $parts[1] ?? $makeModel;
    if (strlen($make) > 50 || strlen($model) > 50) {
        redirectToInventory('invalid_vehicle');
    }

    $color = 'Unspecified';
    $vehicleType = 'Luxury';
    $imagePath = trim((string) ($_POST['existing_image'] ?? ''));
    if ($imagePath === '') {
        $imagePath = 'statics/image/backgroundimage-car.jpg';
    }

    $upload = $_FILES['image'] ?? null;
    if ($upload !== null && $upload['error'] !== UPLOAD_ERR_NO_FILE) {
        if ($upload['error'] !== UPLOAD_ERR_OK || $upload['size'] > 5 * 1024 * 1024) {
            redirectToInventory('upload_invalid');
        }

        $fileInfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $fileInfo->file($upload['tmp_name']);
        $allowedTypes = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ];
        if (!isset($allowedTypes[$mimeType])) {
            redirectToInventory('upload_invalid');
        }

        $uploadDirectory = __DIR__ . '/uploads';
        if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0755, true) && !is_dir($uploadDirectory)) {
            redirectToInventory('upload_failed');
        }

        $fileName = bin2hex(random_bytes(16)) . '.' . $allowedTypes[$mimeType];
        if (!move_uploaded_file($upload['tmp_name'], $uploadDirectory . '/' . $fileName)) {
            redirectToInventory('upload_failed');
        }
        $imagePath = 'api/uploads/' . $fileName;
    }

    $status = isset($_POST['status']) ? 'In Stock' : 'Sold';
    if ($vehicleId !== false && $vehicleId > 0) {
        $stmt = $conn->prepare(
            'UPDATE vehicles
             SET make = ?, brand = ?, model = ?, year = ?, price = ?, engine = ?, image = ?, status = ?
             WHERE veh_id = ?'
        );
        $stmt->bind_param(
            'sssidsssi',
            $make,
            $brand,
            $model,
            $year,
            $price,
            $engine,
            $imagePath,
            $status,
            $vehicleId
        );
    } else {
        $stmt = $conn->prepare(
            'INSERT INTO vehicles (make, brand, model, year, price, color, veh_type, engine, image, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->bind_param(
            'sssidsssss',
            $make,
            $brand,
            $model,
            $year,
            $price,
            $color,
            $vehicleType,
            $engine,
            $imagePath,
            $status
        );
    }

    $stmt->execute();
    $stmt->close();
    redirectToInventory();
}

if (isset($_GET['delete_id'])) {
    $id = filter_var($_GET['delete_id'], FILTER_VALIDATE_INT);
    if ($id === false || $id < 1) {
        redirectToInventory('invalid_vehicle');
    }

    $stmt = $conn->prepare('DELETE FROM reservations WHERE veh_id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();

    $stmt = $conn->prepare('DELETE FROM vehicles WHERE veh_id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();
    redirectToInventory();
}

if (isset($_GET['toggle_status'], $_GET['id'])) {
    $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
    if ($id === false || $id < 1) {
        redirectToInventory('invalid_vehicle');
    }

    $stmt = $conn->prepare(
        "UPDATE vehicles
         SET status = CASE WHEN status = 'In Stock' THEN 'Sold' ELSE 'In Stock' END
         WHERE veh_id = ?"
    );
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();
    redirectToInventory();
}

redirectToInventory();
