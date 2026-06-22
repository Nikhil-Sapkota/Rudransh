<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

switch ($method) {
    // Public: submit contact message
    case 'POST':
        $data    = getRequestBody();
        $name    = trim(htmlspecialchars($data['name']    ?? '', ENT_QUOTES));
        $email   = trim($data['email']   ?? '');
        $subject = trim(htmlspecialchars($data['subject'] ?? '', ENT_QUOTES));
        $message = trim(htmlspecialchars($data['message'] ?? '', ENT_QUOTES));

        if (!$name || !$email || !$message) {
            jsonResponse(['success' => false, 'message' => 'Name, email, and message are required.'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['success' => false, 'message' => 'Invalid email address.'], 400);
        }

        $stmt = $db->prepare('INSERT INTO contact_messages (name, email, subject, message) VALUES (?,?,?,?)');
        $stmt->execute([$name, $email, $subject, $message]);

        jsonResponse(['success' => true, 'message' => 'Message sent successfully. I\'ll get back to you soon!']);

    // Admin: get all messages
    case 'GET':
        requireAdmin();
        $messages = $db->query('SELECT * FROM contact_messages ORDER BY created_at DESC')->fetchAll();
        jsonResponse(['success' => true, 'data' => $messages]);

    // Admin: mark as read
    case 'PUT':
        requireAdmin();
        $data = getRequestBody();
        $id   = (int)($data['id'] ?? 0);
        if (!$id) jsonResponse(['success' => false, 'message' => 'ID required.'], 400);
        $db->prepare('UPDATE contact_messages SET is_read = 1 WHERE id = ?')->execute([$id]);
        jsonResponse(['success' => true, 'message' => 'Marked as read.']);

    // Admin: delete message
    case 'DELETE':
        requireAdmin();
        $data = getRequestBody();
        $id   = (int)($data['id'] ?? $_GET['id'] ?? 0);
        if (!$id) jsonResponse(['success' => false, 'message' => 'ID required.'], 400);
        $db->prepare('DELETE FROM contact_messages WHERE id = ?')->execute([$id]);
        jsonResponse(['success' => true, 'message' => 'Message deleted.']);

    default:
        jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}
