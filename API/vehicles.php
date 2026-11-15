<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");

require_once __DIR__ . "/../config/db_config.php";

try {
    $result = $conn->query(
        "SELECT veh_id, make, brand, model, year, price, color, veh_type, engine
         FROM vehicles
         ORDER BY veh_id"
    );

    $vehicles = [];
    while ($row = $result->fetch_assoc()) {
        $vehicles[] = [
            "id" => (int) $row["veh_id"],
            "make" => $row["make"],
            "brand" => $row["brand"],
            "model" => $row["model"],
            "year" => (int) $row["year"],
            "price" => (float) $row["price"],
            "color" => $row["color"],
            "type" => $row["veh_type"],
            "engine" => $row["engine"]
        ];
    }

    echo json_encode(["vehicles" => $vehicles], JSON_UNESCAPED_UNICODE);
    $result->free();
} catch (Throwable $error) {
    error_log("Unable to load vehicle inventory: " . $error->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Unable to retrieve vehicle inventory."]);
}

$conn->close();
