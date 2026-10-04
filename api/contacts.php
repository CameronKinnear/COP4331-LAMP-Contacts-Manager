<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);
session_start();

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/helpers.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

if (!isset($_SESSION['user_id'])) {
    respond(401, ['error' => 'User not authenticated']);
}

$userId = $_SESSION['user_id'];

// 1. GET: Fetch with Search/Filter or Initial Load
if ($method === 'GET') {
    // Search query via SQL LIKE (Satisfies: "Do NOT load all contact records at once")
    if (isset($_GET['search']) && trim($_GET['search']) !== '') {
        $search = clean($_GET['search']);
        $term = '%' . $search . '%';

        $stmt = $db->prepare('
            SELECT * FROM Contacts 
            WHERE UserID = :userId 
              AND (FirstName LIKE :t1 OR LastName LIKE :t2 OR PhoneNumber LIKE :t3 OR Email LIKE :t4 OR Category LIKE :t5)
            ORDER BY IsFavorite DESC, FirstName ASC
        ');
        $stmt->execute([
            ':userId' => $userId,
            ':t1' => $term,
            ':t2' => $term,
            ':t3' => $term,
            ':t4' => $term,
            ':t5' => $term
        ]);
        $contacts = $stmt->fetchAll();
        respond(200, $contacts);
    }

    // Default contact fetch
    if (isset($_GET['contacts'])) {
        $stmt = $db->prepare('SELECT * FROM Contacts WHERE UserID = :id ORDER BY IsFavorite DESC, FirstName ASC');
        $stmt->execute([':id' => $userId]);
        $contacts = $stmt->fetchAll();

        respond(200, $contacts);
    }
}

$body = getRequestBody();

// 2. POST: Insert a new contact entry
if ($method === 'POST') {
    if (isset($body['save'])) {
        $firstName = clean($body['firstName'] ?? $body['firstname'] ?? '');
        $lastName  = clean($body['lastName'] ?? $body['lastname'] ?? '');
        $email     = clean($body['email'] ?? '');
        $phone     = clean($body['phone'] ?? $body['PhoneNumber'] ?? '');
        $category  = contactCategory($body['category'] ?? '');
        $isFavorite = !empty($body['isFavorite']) || !empty($body['is_favorite']) || !empty($body['IsFavorite']) ? 1 : 0;
        
        $stmt = $db->prepare('
            INSERT INTO Contacts (FirstName, LastName, Email, PhoneNumber, Category, UserID, IsFavorite)
            VALUES (:firstName, :lastName, :email, :phone, :category, :userId, :isFavorite)
        ');
        $stmt->execute([
            ':firstName' => $firstName, 
            ':lastName'  => $lastName, 
            ':email'     => $email, 
            ':phone'     => $phone,
            ':category'  => $category,
            ':userId'    => $userId,
            ':isFavorite' => $isFavorite
        ]);

        respond(200, [
            'message' => 'Contact Saved',
            'id' => $db->lastInsertId(),
            'Category' => $category
        ]);
    }
}

// 3. PUT: Update an existing contact entry
if ($method === 'PUT') {
    $contactId = $body['id'] ?? $body['ID'] ?? null;

    if (!$contactId) {
        respond(400, ['error' => 'Missing contact ID for update']);
    }

    $firstName = clean($body['firstName'] ?? $body['firstname'] ?? '');
    $lastName  = clean($body['lastName'] ?? $body['lastname'] ?? '');
    $email     = clean($body['email'] ?? '');
    $phone     = clean($body['phone'] ?? $body['PhoneNumber'] ?? '');
    $category  = contactCategory($body['category'] ?? '');
    $isFavorite = !empty($body['isFavorite']) || !empty($body['is_favorite']) || !empty($body['IsFavorite']) ? 1 : 0;

    $stmt = $db->prepare('
        UPDATE Contacts
        SET FirstName = :firstName, LastName = :lastName, Email = :email, PhoneNumber = :phone, Category = :category, IsFavorite = :isFavorite
        WHERE ID = :contactId AND UserID = :userId
    ');
    $stmt->execute([
        ':firstName' => $firstName,
        ':lastName'  => $lastName,
        ':email'     => $email,
        ':phone'     => $phone,
        ':category'  => $category,
        ':isFavorite' => $isFavorite,
        ':contactId' => $contactId,
        ':userId'    => $userId
    ]);

    respond(200, ['message' => 'Contact Updated', 'Category' => $category]);
}

function contactCategory($value): string {
    $category = clean(is_string($value) ? $value : '');
    if (strlen($category) > 100) {
        respond(400, ['error' => 'Category must be 100 characters or fewer']);
    }
    return $category;
}

if ($method === 'DELETE') {
    if (isset($_GET['contactId'])) {
        // Is deleting a contact

        $id = intval($_GET['contactId']);

        $stmt = $db->prepare('
            DELETE FROM Contacts
            WHERE ID = :id');

        $stmt->execute([':id' => $id]);

        respond(200, [
            'message' => 'Contacts Deleted'
        ]);
    }
}
