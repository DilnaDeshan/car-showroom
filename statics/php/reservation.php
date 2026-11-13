<?php

$conn = new mysqli("localhost", "root", "Dilna00/", "Showroomdb");




if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    $full_name = $_POST["full_name"];
    $phone_number = $_POST["phone_number"];
    $preferred_date = $_POST["preferred_date"];
    $email = $_POST["email"];
    $vehicle = $_POST["vehicle"];
    $message = $_POST["message"];

    $safe_full_name = htmlspecialchars($full_name);
    $safe_phone_number = htmlspecialchars($phone_number);
    $safe_preferred_date = htmlspecialchars($preferred_date);
    $safe_email = htmlspecialchars($email);
    $safe_vehicle = htmlspecialchars($vehicle);
    $safe_message = htmlspecialchars($message);

    echo "<script>
            alert('Successfully received the 

            full name: $safe_full_name,
            Phone number: $safe_phone_number, 
            Preferred date: $safe_preferred_date, 
            Email: $safe_email, 
            Interested vehicle: $safe_vehicle, 
            Message: $safe_message'
            );
            window.location.href = '../index.html';
          </script>";

} else {
    echo "No data was submitted.";
}
?>