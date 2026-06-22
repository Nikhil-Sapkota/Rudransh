<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

switch ($method) {
    // Public: get published projects
    case 'GET':
        $all = $_GET['all'] ?? null;
        if ($all) {
            requireAdmin();
            $projects = $db->query('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC')->fetchAll();
        } else {
            $projects = $db->query('SELECT * FROM projects ORDER BY featured DESC, sort_order ASC')->fetchAll();
        }
        jsonResponse(['success' => true, 'data' => $projects]);

    // Admin: create project
    case 'POST':
        requireAdmin();
        $data = getRequestBody();

        $name        = trim($data['name']        ?? '');
        $description = trim($data['description'] ?? '');
        $tech_stack  = trim($data['tech_stack']  ?? '');
        $github_url  = trim($data['github_url']  ?? '');
        $live_url    = trim($data['live_url']    ?? '');
        $featured    = (int)($data['featured']   ?? 0);
        $sort_order  = (int)($data['sort_order'] ?? 0);

        if (!$name || !$description) {
            jsonResponse(['success' => false, 'message' => 'Name and description are required.'], 400);
        }

        $stmt = $db->prepare('INSERT INTO projects (name, description, tech_stack, github_url, live_url, featured, sort_order) VALUES (?,?,?,?,?,?,?)');
        $stmt->execute([$name, $description, $tech_stack, $github_url, $live_url, $featured, $sort_order]);

        jsonResponse(['success' => true, 'message' => 'Project created.', 'id' => $db->lastInsertId()]);

    // Admin: update project
    case 'PUT':
        requireAdmin();
        $data = getRequestBody();
        $id   = (int)($data['id'] ?? 0);
        if (!$id) jsonResponse(['success' => false, 'message' => 'ID required.'], 400);

        $fields = [];
        $params = [];
        $allowed = ['name', 'description', 'tech_stack', 'github_url', 'live_url', 'featured', 'sort_order'];

        foreach ($allowed as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "$f = ?";
                $params[] = in_array($f, ['featured', 'sort_order']) ? (int)$data[$f] : $data[$f];
            }
        }

        if (!$fields) jsonResponse(['success' => false, 'message' => 'Nothing to update.'], 400);
        $params[] = $id;
        $db->prepare('UPDATE projects SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);
        jsonResponse(['success' => true, 'message' => 'Project updated.']);

    // Admin: delete project
    case 'DELETE':
        requireAdmin();
        $data = getRequestBody();
        $id   = (int)($data['id'] ?? $_GET['id'] ?? 0);
        if (!$id) jsonResponse(['success' => false, 'message' => 'ID required.'], 400);
        $db->prepare('DELETE FROM projects WHERE id = ?')->execute([$id]);
        jsonResponse(['success' => true, 'message' => 'Project deleted.']);

    default:
        jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}
