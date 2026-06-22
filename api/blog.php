<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

switch ($method) {
    // Public: get all published blogs (or single by slug)
    case 'GET':
        $slug = $_GET['slug'] ?? null;
        $all  = $_GET['all']  ?? null; // admin: get all including drafts

        if ($slug) {
            $stmt = $db->prepare('SELECT * FROM blogs WHERE slug = ? AND published = 1 LIMIT 1');
            $stmt->execute([$slug]);
            $blog = $stmt->fetch();
            if (!$blog) jsonResponse(['success' => false, 'message' => 'Not found.'], 404);
            jsonResponse(['success' => true, 'data' => $blog]);
        }

        if ($all) {
            requireAdmin();
            $blogs = $db->query('SELECT * FROM blogs ORDER BY created_at DESC')->fetchAll();
        } else {
            $blogs = $db->query('SELECT id, title, slug, excerpt, published, created_at FROM blogs WHERE published = 1 ORDER BY created_at DESC')->fetchAll();
        }

        jsonResponse(['success' => true, 'data' => $blogs]);

    // Admin: create new blog post
    case 'POST':
        requireAdmin();
        $data = getRequestBody();

        $title     = trim($data['title']     ?? '');
        $body      = trim($data['body']      ?? '');
        $excerpt   = trim($data['excerpt']   ?? '');
        $published = (int)($data['published'] ?? 0);
        $slug      = trim($data['slug']      ?? '');

        if (!$title || !$body) {
            jsonResponse(['success' => false, 'message' => 'Title and body are required.'], 400);
        }

        if (!$slug) {
            $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title));
            $slug = trim($slug, '-');
        }

        // Ensure unique slug
        $base = $slug;
        $i = 1;
        while (true) {
            $chk = $db->prepare('SELECT id FROM blogs WHERE slug = ?');
            $chk->execute([$slug]);
            if (!$chk->fetch()) break;
            $slug = $base . '-' . $i++;
        }

        $stmt = $db->prepare('INSERT INTO blogs (title, slug, excerpt, body, published) VALUES (?,?,?,?,?)');
        $stmt->execute([$title, $slug, $excerpt, $body, $published]);

        jsonResponse(['success' => true, 'message' => 'Blog post created.', 'id' => $db->lastInsertId(), 'slug' => $slug]);

    // Admin: update blog post
    case 'PUT':
        requireAdmin();
        $data = getRequestBody();
        $id   = (int)($data['id'] ?? 0);

        if (!$id) jsonResponse(['success' => false, 'message' => 'ID is required.'], 400);

        $fields = [];
        $params = [];

        if (isset($data['title']))     { $fields[] = 'title = ?';     $params[] = $data['title']; }
        if (isset($data['body']))      { $fields[] = 'body = ?';       $params[] = $data['body']; }
        if (isset($data['excerpt']))   { $fields[] = 'excerpt = ?';    $params[] = $data['excerpt']; }
        if (isset($data['published'])) { $fields[] = 'published = ?';  $params[] = (int)$data['published']; }
        if (isset($data['slug']))      { $fields[] = 'slug = ?';       $params[] = $data['slug']; }

        if (!$fields) jsonResponse(['success' => false, 'message' => 'Nothing to update.'], 400);

        $params[] = $id;
        $db->prepare('UPDATE blogs SET ' . implode(', ', $fields) . ' WHERE id = ?')
           ->execute($params);

        jsonResponse(['success' => true, 'message' => 'Blog post updated.']);

    // Admin: delete blog post
    case 'DELETE':
        requireAdmin();
        $data = getRequestBody();
        $id   = (int)($data['id'] ?? $_GET['id'] ?? 0);

        if (!$id) jsonResponse(['success' => false, 'message' => 'ID is required.'], 400);

        $db->prepare('DELETE FROM blogs WHERE id = ?')->execute([$id]);
        jsonResponse(['success' => true, 'message' => 'Blog post deleted.']);

    default:
        jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}
