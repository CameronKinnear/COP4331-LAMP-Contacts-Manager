<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/helpers.php';

setCORSHeaders();
$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();
$body   = getRequestBody();

if ($method === 'POST') {
    $login    = clean($body['login'] ?? '');
    $password = clean($body['password'] ?? '');

    if (!$login || !$password) {
        respond(400, ['error' => 'Login and password are required']);
    }

    $stmt = $db->prepare('SELECT ID, firstName, lastName, Password FROM Users WHERE Login = :login LIMIT 1');
    $stmt->execute([':login' => $login]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['Password'])) {
        respond(200, [
            'id' => (int) $user['ID'], 'firstName' => $user['firstName'],
            'lastName' => $user['lastName'], 'token' => (string) $user['ID'], 'error' => ''
        ]);
    } else {
        respond(401, ['id' => 0, 'firstName' => '', 'lastName' => '', 'error' => 'No Records Found']);
    }
} else {
    respond(405, ['error' => 'Method not allowed']);
}
