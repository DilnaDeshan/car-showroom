<?php
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    ]);
    session_start();
}

function getCurrentUser(mysqli $conn): ?array
{
    $userId = filter_var($_SESSION['user_id'] ?? null, FILTER_VALIDATE_INT);
    if ($userId === false || $userId === null || $userId < 1) {
        return null;
    }

    $stmt = $conn->prepare('SELECT id, first_name, user_type FROM customers WHERE id = ? LIMIT 1');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$user) {
        $_SESSION = [];
        session_destroy();
        return null;
    }

    $_SESSION['user_id'] = (int) $user['id'];
    $_SESSION['user_type'] = $user['user_type'];
    $_SESSION['first_name'] = $user['first_name'];

    return $user;
}

function requireOwner(mysqli $conn, string $loginLocation): void
{
    $user = getCurrentUser($conn);
    if (!$user || $user['user_type'] !== 'owner') {
        header('Location: ' . $loginLocation);
        exit;
    }
}
