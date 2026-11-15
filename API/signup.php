<?php
require_once __DIR__ . '/../config/db_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../signup.html');
    exit;
}

$firstName = trim((string) ($_POST['first_name'] ?? ''));
$lastName = trim((string) ($_POST['last_name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$phone = trim((string) ($_POST['phone'] ?? ''));
$password = (string) ($_POST['password'] ?? '');

if (
    $firstName === '' ||
    strlen($firstName) > 50 ||
    $lastName === '' ||
    strlen($lastName) > 50 ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    strlen($email) > 100 ||
    strlen($phone) > 15 ||
    strlen($password) < 8
) {
    header('Location: ../signup.html?error=invalid');
    exit;
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $conn->prepare(
        'INSERT INTO customers (first_name, last_name, email, phone, password_hash)
         VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('sssss', $firstName, $lastName, $email, $phone, $passwordHash);
    $stmt->execute();
    $stmt->close();
} catch (mysqli_sql_exception $error) {
    if ($error->getCode() === 1062) {
        header('Location: ../signup.html?error=email_exists');
        exit;
    }

    error_log('Unable to create customer account: ' . $error->getMessage());
    header('Location: ../signup.html?error=failed');
    exit;
}

header('Location: ../login.html?registered=1');
exit;
