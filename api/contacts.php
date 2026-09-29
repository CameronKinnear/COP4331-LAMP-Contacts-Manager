<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);
session_start();

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/helpers.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();
$body = getRequestBody();

// Get the users saved contacts
if ($method === 'GET') {
    if (isset($_GET['contacts'])) {

        $stmt = $db->prepare('SELECT * FROM Contacts WHERE UserID = :id');
        $stmt->execute([':id' => $_SESSION['user_id']]);
        $contacts = $stmt->fetchAll();

        respond(200, $contacts);
    }
}

if ($method === 'POST') {
    if (isset($body['save'])) {
        $firstName = clean($body['firstName']);
        $lastName = clean($body['lastName']);
        $email = cleans($body['email']);
        $phone = clean($body['phone'])

        $stmt = $db->prepare('  INSERT INTO Contacts (FirstName, LastName, Email, PhoneNumber, UserID)
                                VALUES (:firstName, :lastName, :email, :phone, :userId)');
		$stmt->execute([':firstName' => $firstName, ':lastName' => $lastName, ':email' => $email, 'phone' => $phone], 'userId' => $_SESSION['user_id']);
		$contact = $stmt->fetch();

        respond(200, [
            'message' => 'Contact Saved'
        ]);
    }
}

