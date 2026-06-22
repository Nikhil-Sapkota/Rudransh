<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();
session_start();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = getRequestBody();
        $action = $data['action'] ?? $_POST['action'] ?? '';

        if ($action === 'login') {
            $username = trim($data['username'] ?? '');
            $password = trim($data['password'] ?? '');

            if (!$username || !$password) {
                jsonResponse(['success' => false, 'message' => 'Username and password are required.'], 400);
            }

            $db   = getDB();
            $stmt = $db->prepare('SELECT id, username, password FROM admin_users WHERE username = ? LIMIT 1');
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password'])) {
                $_SESSION['admin_logged_in'] = true;
                $_SESSION['admin_id']        = $user['id'];
                $_SESSION['admin_username']  = $user['username'];
                session_regenerate_id(true);
                jsonResponse(['success' => true, 'message' => 'Login successful.', 'username' => $user['username']]);
            } else {
                jsonResponse(['success' => false, 'message' => 'Invalid credentials.'], 401);
            }
        }

        if ($action === 'logout') {
            $_SESSION = [];
            session_destroy();
            jsonResponse(['success' => true, 'message' => 'Logged out.']);
        }

        if ($action === 'change_password') {
            if (empty($_SESSION['admin_logged_in'])) {
                jsonResponse(['success' => false, 'message' => 'Unauthorized'], 401);
            }
            $currentPass = $data['current_password'] ?? '';
            $newPass     = $data['new_password'] ?? '';

            if (strlen($newPass) < 6) {
                jsonResponse(['success' => false, 'message' => 'New password must be at least 6 characters.'], 400);
            }

            $db   = getDB();
            $stmt = $db->prepare('SELECT password FROM admin_users WHERE id = ?');
            $stmt->execute([$_SESSION['admin_id']]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($currentPass, $user['password'])) {
                jsonResponse(['success' => false, 'message' => 'Current password is incorrect.'], 401);
            }

            $hash = password_hash($newPass, PASSWORD_BCRYPT, ['cost' => 12]);
            $db->prepare('UPDATE admin_users SET password = ? WHERE id = ?')
               ->execute([$hash, $_SESSION['admin_id']]);

            jsonResponse(['success' => true, 'message' => 'Password changed successfully.']);
        }

        jsonResponse(['success' => false, 'message' => 'Unknown action.'], 400);

    case 'GET':
        $status = !empty($_SESSION['admin_logged_in'])
            ? ['logged_in' => true,  'username' => $_SESSION['admin_username']]
            : ['logged_in' => false, 'username' => null];
        jsonResponse(['success' => true, 'data' => $status]);

    default:
        jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}
