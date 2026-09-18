<?php
if ($method === 'POST' && isset($body['register'])) {
	$login = clean($body['login']);
	$password = clean($body['password']);
	$first = clean($body['firstName'] ?? '' );
	$last = clean($body['lastName'] ?? '');

	if(!$login || !$password) {
		respond(400, ['error' => 'Login and password are required.']);
	}

	$check = $db->prepare('SELECT ID FROM Users WHERE Login = :login LIMIT 1');
	$check->execute([':login' => $login]);
	if ($check->fetch()) {
		respond(409, ['error' => 'Username already taken.']);
	}

	$hash = password_hash($password, PASSWORD_DEFAULT);
	$stmt = $db->prepare('INSERT INTO Users (Login, Password, firstName, lastName) VALUES (:login, :pass, :first, :last)');
	$stmt->execute([':login' => $login, ':pass' => $hash, ':first' => $first, ':last' => $last]);

	respond(201, ['message' => 'User registered successfully']);
}		
?>
