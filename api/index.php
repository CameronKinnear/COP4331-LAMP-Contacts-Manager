<?php
/*
  api/index.php — Authentication API
  GET  index.php?ping=1     health check (touches no database)
  POST index.php            login
       body: {"login","password"}
  POST index.php            register (when "register" is true)
       body: {"register":true,"login","password","firstName","lastName"}
  POST index.php?logout=1   destroy the session

  Contacts live in contacts.php, admin actions in admin.php.
*/

require_once __DIR__ . '/config/helpers.php';
require_once __DIR__ . '/config/db.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];

// Ping answers before getDB(): if ping works but login 500s, the problem is the database.
if ($method === 'GET' && (isset($_GET['ping']) || ($_GET['action'] ?? '') === 'ping')) {
    respond(200, ['status' => 'OK', 'timestamp' => time()]);
}

if ($method !== 'POST') {
    respond(405, ['error' => 'Method not allowed']);
}

$db   = getDB();
$body = getRequestBody();

if (isset($_GET['logout'])) {
    logout();
} elseif (!empty($body['register'])) {
    register($db, $body);
} else {
    login($db, $body);
}

// ------------------------------------------------------------
//  Session
// ------------------------------------------------------------
function startSession(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'httponly' => true,
            'samesite' => 'Lax',
            'secure'   => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        ]);
        session_start();
    }
}

function logout(): void {
    startSession();
    $_SESSION = [];
    $p = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    session_destroy();
    respond(200, ['message' => 'Logged out', 'error' => '']);
}

// login functionality, password are only hashed and verified instead of using clean().
function login(PDO $db, array $body): void {
    $login    = clean($body['login'] ?? $body['Login'] ?? '');
    $password = $body['password'] ?? $body['Password'] ?? '';

    if ($login === '' || !is_string($password) || $password === '') {
        respond(400, ['error' => 'Login and password are required']);
    }

    $stmt = $db->prepare(
        'SELECT ID, FirstName, LastName, Password, Role, IsActive
         FROM Users WHERE Login = :login LIMIT 1'
    );
    $stmt->execute([':login' => $login]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['Password'])) {
        respond(401, ['id' => 0, 'firstName' => '', 'lastName' => '', 'error' => 'No Records Found']);
    }

    // Checked only after the password is proven, so strangers can't probe which accounts are disabled.
    if (!(int) $user['IsActive']) {
        respond(403, ['id' => 0, 'firstName' => '', 'lastName' => '', 'error' => 'Account disabled']);
    }

    startSession();
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $user['ID'];

    respond(200, [
        'id'        => (int) $user['ID'],
        'firstName' => $user['FirstName'],
        'lastName'  => $user['LastName'],
        'role'      => $user['Role'],
        'error'     => ''
    ]);
}
// Register: creates a regular user. Admins are made through admin.php.
function register(PDO $db, array $body): void {
    $login     = clean($body['login'] ?? $body['Login'] ?? '');
    $password  = $body['password'] ?? $body['Password'] ?? '';
    $firstName = clean($body['firstName'] ?? $body['FirstName'] ?? '');
    $lastName  = clean($body['lastName'] ?? $body['LastName'] ?? '');

    if ($login === '' || !is_string($password) || trim($password) === '') {
        respond(400, ['error' => 'Username and password are required.']);
    }
    if (mb_strlen($login) > 50 || mb_strlen($firstName) > 50 || mb_strlen($lastName) > 50) {
        respond(400, ['error' => 'Username and names must be 50 characters or fewer.']);
    }

    $check = $db->prepare('SELECT ID FROM Users WHERE Login = :login LIMIT 1');
    $check->execute([':login' => $login]);
    if ($check->fetch()) {
        respond(409, ['error' => 'Username already taken.']);
    }

    try {
        $stmt = $db->prepare(
            'INSERT INTO Users (Login, Password, FirstName, LastName)
             VALUES (:login, :pass, :first, :last)'
        );
        $stmt->execute([
            ':login' => $login,
            ':pass'  => password_hash($password, PASSWORD_DEFAULT),
            ':first' => $firstName,
            ':last'  => $lastName,
        ]);
    } catch (PDOException $e) {
        // 1062 = duplicate key: two signups raced past the check above (needs a UNIQUE index on Login).
        if (($e->errorInfo[1] ?? 0) === 1062) {
            respond(409, ['error' => 'Username already taken.']);
        }
        error_log('register: ' . $e->getMessage());
        respond(500, ['error' => 'Server error']);
    }

    respond(201, ['message' => 'User registered successfully', 'error' => '']);
}
