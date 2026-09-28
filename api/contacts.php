<?php

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/helpers.php';

setCORSHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();
$body = getRequestBody();

// Get the users saved contacts
if ($method === 'GET') {
    if (isset($body['contacts'])) {
        $id = clean($body['Id']);

        $stmt = $db->prepare('SELECT * FROM Widgets WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $widgets = $stmt->fetch();

        respond(200, [
            'noteWidget' => (string) $widgets['noteWidget'],
            'birthdayWidget' => $widgets['birthdayWidget']
        ]);
    }
}