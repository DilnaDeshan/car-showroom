<?php
require_once '../config/db_config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 1. Collect form data
    $full_name = trim($_POST["full_name"] ?? "");
    $phone_number = trim($_POST["phone_number"] ?? "");
    $preferred_date = $_POST["preferred_date"] ?? "";
    $preferred_time = !empty($_POST["preferred_time"]) ? $_POST["preferred_time"] : "09:00:00";
    $email = trim($_POST["email"] ?? "");
    $vehicle_input = trim($_POST["vehicle"] ?? "");
    $message = trim($_POST["message"] ?? "");

    // 2. Split full_name into first_name and last_name
    $name_parts = explode(" ", $full_name, 2);
    $first_name = $name_parts[0];
    $last_name = $name_parts[1] ?? "N/A";

    try {
        $conn->begin_transaction();

        // 3. Check if customer already exists by email
        $stmt = $conn->prepare("SELECT id FROM customers WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            $customer_id = $row['id'];
            $update_stmt = $conn->prepare("UPDATE customers SET first_name = ?, last_name = ?, phone = ? WHERE id = ?");
            $update_stmt->bind_param("sssi", $first_name, $last_name, $phone_number, $customer_id);
            $update_stmt->execute();
            $update_stmt->close();
        } else {
            $insert_cust = $conn->prepare("INSERT INTO customers (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)");
            $insert_cust->bind_param("ssss", $first_name, $last_name, $email, $phone_number);
            $insert_cust->execute();
            $customer_id = $conn->insert_id;
            $insert_cust->close();
        }
        $stmt->close();

        // 4. Resolve veh_id
        if (is_numeric($vehicle_input)) {
            $veh_id = (int)$vehicle_input;
        } else {
            $veh_stmt = $conn->prepare("SELECT veh_id FROM vehicles WHERE model LIKE ? OR CONCAT(brand, ' ', model) LIKE ? LIMIT 1");
            $search_term = "%" . $vehicle_input . "%";
            $veh_stmt->bind_param("ss", $search_term, $search_term);
            $veh_stmt->execute();
            $veh_res = $veh_stmt->get_result();
            if ($veh_row = $veh_res->fetch_assoc()) {
                $veh_id = $veh_row['veh_id'];
            } else {
                throw new Exception("Selected vehicle was not found in the database.");
            }
            $veh_stmt->close();
        }

        // 5. Insert into reservations table
        $insert_res = $conn->prepare("INSERT INTO reservations (customer_id, veh_id, Preffered_date, preffered_time, add_Message) VALUES (?, ?, ?, ?, ?)");
        $insert_res->bind_param("iisss", $customer_id, $veh_id, $preferred_date, $preferred_time, $message);
        $insert_res->execute();
        $insert_res->close();

        $conn->commit();

        // 6. Safely format alert message for JavaScript
        $alert_text = "Successfully saved reservation!\n"
                    . "Full name: $full_name\n"
                    . "Phone number: $phone_number\n"
                    . "Preferred date: $preferred_date\n"
                    . "Preferred time: $preferred_time\n"
                    . "Email: $email\n"
                    . "Interested vehicle: $vehicle_input\n"
                    . "Message: $message";

        echo "<script>
                alert(" . json_encode($alert_text) . ");
                window.location.href = '../index.html';
              </script>";

    } catch (Exception $e) {
        $conn->rollback();
        echo "<script>
                alert(" . json_encode("Error saving reservation: " . $e->getMessage()) . ");
                window.history.back();
              </script>";
    }
} else {
    echo "No data was submitted.";
}

$conn->close();
?>