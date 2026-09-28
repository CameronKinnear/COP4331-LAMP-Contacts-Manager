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
        $contacts = $stmt->fetch();

        respond(200, [
            'contactId' => $contacts['ID']
        ]);
    }
}