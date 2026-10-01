<?php
api/admin.php — Admin-only user management

Every request must come from a logged-in, active admin.
Identity comes from the server-side session only.

GET  admin.php?resource=users                  list users (?q= search, ?limit= ?offset=)
GET  admin.php?resource=users&id=N             one user
POST admin.php?resource=users                  create an admin account
     body: {"login","password","firstName","lastName"}
PUT  admin.php?resource=users&id=N             change password and/or active status
     body: {"password": "..."} and/or {"active": true|false}

GET  admin.php?resource=contacts&userId=N      one user's contacts (?q= filters)
GET  admin.php?resource=contacts&q=term        search everyone's contacts
     (at least one of userId / q is required; results are paged)

require_once __DIR__ . '/config/helpers.php';
require_once __DIR__ . '/config/db.php';

setCORSHeaders();

$db      = getDB();
$adminId = requireAdmin($db);

$method   = $_SERVER['REQUEST_METHOD'];
$resource = $_GET['resource'] ?? '';
$id       = isset($_GET['id']) ? (int) $_GET['id'] : 0;

try {
    switch ($resource . ' ' . $method) {
        case 'users GET':
            $id > 0 ? getUser($db, $id) : listUsers($db);
            break;
        case 'users POST':
            createAdmin($db);
            break;
        case 'users PUT':
            updateUser($db, $id, $adminId);
            break;
        case 'contacts GET':
            listContacts($db);
            break;
        default:
            respond(404, ['error' => 'Unknown resource or method']);
    }
} catch (PDOException $e) {
    error_log('admin.php: ' . $e->getMessage());
    respond(500, ['error' => 'Server error']);
}

// auth function: session names users, database located, 
// role and status are re-read with every request - disabling an admin lock them out immediately 

function requireAdmin(PDO $db): int {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $userId = (int) ($_SESSION['user_id'] ?? 0);
    if ($userId <= 0) {
        respond(401, ['error' => 'User not authenticated']);
    }

    $stmt = $db->prepare('SELECT Role, IsActive FROM Users WHERE ID = :id LIMIT 1');
    $stmt->execute([':id' => $userId]);
    $row = $stmt->fetch();

    if (!$row || !(int) $row['IsActive']) {
        respond(401, ['error' => 'User not authenticated']);
    }
    if ($row['Role'] !== 'admin') {
        respond(403, ['error' => 'Admin access required']);
    }

    return $userId;
}

const USER_COLUMNS = 'ID, FirstName, LastName, Login, Role, IsActive';

function publicUser(array $row): array {
    return [
        'id'        => (int) $row['ID'],
        'firstName' => $row['FirstName'],
        'lastName'  => $row['LastName'],
        'login'     => $row['Login'],
        'role'      => $row['Role'],
        'active'    => (bool) $row['IsActive'],
    ];
}
// fix special character collision.
function likeTerm(string $s): string {
    return '%' . addcslashes($s, '%_\\') . '%';
}

function pageParams(): array {
    $limit  = isset($_GET['limit'])  ? (int) $_GET['limit']  : 50;
    $offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;
    return [max(1, min($limit, 100)), max(0, $offset)];
}

//  Users listing.
function listUsers(PDO $db): void {
    [$limit, $offset] = pageParams();
    $q = trim($_GET['q'] ?? '');

    $sql = 'SELECT ' . USER_COLUMNS . ' FROM Users';
    if ($q !== '') {
        $sql .= " WHERE CONCAT_WS(' ', FirstName, LastName, Login) LIKE :q";
    }
    $sql .= ' ORDER BY ID LIMIT :limit OFFSET :offset';

    $stmt = $db->prepare($sql);
    if ($q !== '') {
        $stmt->bindValue(':q', likeTerm($q));
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    respond(200, ['users' => array_map('publicUser', $stmt->fetchAll()), 'error' => '']);
}

// retrieves user.
function getUser(PDO $db, int $id): void {
    $stmt = $db->prepare('SELECT ' . USER_COLUMNS . ' FROM Users WHERE ID = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!$row) {
        respond(404, ['error' => 'User not found']);
    }
    respond(200, ['user' => publicUser($row), 'error' => '']);
}

// creates admin account.
function createAdmin(PDO $db): void {
    $body      = getRequestBody();
    $login     = clean($body['login'] ?? '');
    $firstName = clean($body['firstName'] ?? '');
    $lastName  = clean($body['lastName'] ?? '');
    $password  = $body['password'] ?? '';   // raw: passwords are hashed, never cleaned

    if ($login === '' || !is_string($password) || trim($password) === '') {
        respond(400, ['error' => 'Login and password are required']);
    }
    if (mb_strlen($login) > 50 || mb_strlen($firstName) > 50 || mb_strlen($lastName) > 50) {
        respond(400, ['error' => 'Login and names must be 50 characters or fewer']);
    }

    $check = $db->prepare('SELECT ID FROM Users WHERE Login = :login LIMIT 1');
    $check->execute([':login' => $login]);
    if ($check->fetch()) {
        respond(409, ['error' => 'Username already taken']);
    }

    $stmt = $db->prepare(
        "INSERT INTO Users (Login, Password, FirstName, LastName, Role, IsActive)
         VALUES (:login, :pass, :first, :last, 'admin', 1)"
    );
    $stmt->execute([
        ':login' => $login,
        ':pass'  => password_hash($password, PASSWORD_DEFAULT),
        ':first' => $firstName,
        ':last'  => $lastName,
    ]);

    respond(201, ['message' => 'Admin created', 'id' => (int) $db->lastInsertId(), 'error' => '']);
}

// logic for updating user information.
function updateUser(PDO $db, int $id, int $adminId): void {
    if ($id <= 0) {
        respond(400, ['error' => 'User ID is required — use ?id=']);
    }

    $body = getRequestBody();
    $sets = [];
    $args = [':id' => $id];

    if (array_key_exists('password', $body)) {
        if (!is_string($body['password']) || trim($body['password']) === '') {
            respond(400, ['error' => 'Password cannot be empty']);
        }
        $sets[]         = 'Password = :pass';
        $args[':pass']  = password_hash($body['password'], PASSWORD_DEFAULT);
    }

    if (array_key_exists('active', $body)) {
        if (!is_bool($body['active'])) {
            respond(400, ['error' => 'active must be true or false']);
        }
        if (!$body['active'] && $id === $adminId) {
            respond(400, ['error' => 'You cannot disable your own account']);
        }
        $sets[]           = 'IsActive = :active';
        $args[':active']  = $body['active'] ? 1 : 0;
    }

    if (!$sets) {
        respond(400, ['error' => 'Provide a password and/or active status']);
    }

    $exists = $db->prepare('SELECT ID FROM Users WHERE ID = :id LIMIT 1');
    $exists->execute([':id' => $id]);
    if (!$exists->fetch()) {
        respond(404, ['error' => 'User not found']);
    }

    $stmt = $db->prepare('UPDATE Users SET ' . implode(', ', $sets) . ' WHERE ID = :id');
    $stmt->execute($args);

    getUser($db, $id);   // respond with the updated record
}

function listContacts(PDO $db): void {
    [$limit, $offset] = pageParams();
    $userId = isset($_GET['userId']) ? (int) $_GET['userId'] : 0;
    $q      = trim($_GET['q'] ?? '');

    // Never dump the whole table.
    if ($userId <= 0 && $q === '') {
        respond(400, ['error' => 'Provide userId and/or q']);
    }

    $where = [];
    if ($userId > 0) {
        $where[] = 'c.UserID = :uid';
    }
    if ($q !== '') {
        $where[] = "CONCAT_WS(' ', c.FirstName, c.LastName, c.Email, c.PhoneNumber) LIKE :q";
    }

    $sql = 'SELECT c.ID, c.FirstName, c.LastName, c.Email, c.PhoneNumber, c.UserID, u.Login AS OwnerLogin
            FROM Contacts c
            JOIN Users u ON u.ID = c.UserID
            WHERE ' . implode(' AND ', $where) . '
            ORDER BY c.FirstName, c.ID
            LIMIT :limit OFFSET :offset';

    $stmt = $db->prepare($sql);
    if ($userId > 0) {
        $stmt->bindValue(':uid', $userId, PDO::PARAM_INT);
    }
    if ($q !== '') {
        $stmt->bindValue(':q', likeTerm($q));
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    respond(200, ['contacts' => $stmt->fetchAll(), 'error' => '']);
}
