<?php

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();
$body = getRequestBody();

// Get the users saved contacts
if ($method === 'POST') {
    if (isset($body['contacts'])) {
        echo "USer: " + $_SESSION['userId'];
    }
}