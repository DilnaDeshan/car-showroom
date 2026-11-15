<?php
require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../login.html');
    exit;
}

$email = trim((string) ($_POST['email'] ?? ''));
$password = (string) ($_POST['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
    header('Location: ../login.html?error=invalid');
    exit;
}

$stmt = $conn->prepare(
    'SELECT id, first_name, password_hash, user_type
     FROM customers
     WHERE email = ? AND password_hash IS NOT NULL
     LIMIT 1'
);
$stmt->bind_param('s', $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user || !password_verify($password, $user['password_hash'])) {
    header('Location: ../login.html?error=invalid');
    exit;
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['user_type'] = $user['user_type'];
$_SESSION['first_name'] = $user['first_name'];

header('Location: ../index.html');
exit;
