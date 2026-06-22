<?php
require_once __DIR__ . '/config.php';
setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// ---- GET: fetch content (public or admin) ----
if ($method === 'GET') {
    $table = $_GET['table'] ?? 'site_content';
    $allowed = ['site_content', 'experiences', 'education', 'skills', 'leadership'];

    if (!in_array($table, $allowed)) {
        jsonResponse(['success' => false, 'message' => 'Invalid table.'], 400);
    }

    if ($table === 'site_content') {
        $rows  = $db->query('SELECT `key`, `value` FROM site_content')->fetchAll();
        $kv    = [];
        foreach ($rows as $r) $kv[$r['key']] = $r['value'];
        jsonResponse(['success' => true, 'data' => $kv]);
    } else {
        $orderMap = [
            'experiences' => 'sort_order ASC, id ASC',
            'education'   => 'sort_order ASC, id ASC',
            'skills'      => 'sort_order ASC, id ASC',
            'leadership'  => 'sort_order ASC, id ASC',
        ];
        $order = $orderMap[$table] ?? 'id ASC';
        $rows  = $db->query("SELECT * FROM `$table` ORDER BY $order")->fetchAll();
        jsonResponse(['success' => true, 'data' => $rows]);
    }
}

// ---- POST/PUT: update content (admin only) ----
if ($method === 'POST' || $method === 'PUT') {
    requireAdmin();
    $data   = getRequestBody();
    $table  = $data['table'] ?? '';
    $action = $data['action'] ?? 'update';

    // Update site_content key-value
    if ($table === 'site_content') {
        $key   = $data['key']   ?? '';
        $value = $data['value'] ?? '';
        if (!$key) jsonResponse(['success' => false, 'message' => 'Key is required.'], 400);

        $stmt = $db->prepare('INSERT INTO site_content (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)');
        $stmt->execute([$key, $value]);
        jsonResponse(['success' => true, 'message' => 'Content updated.']);
    }

    $allowed = ['experiences', 'education', 'skills', 'leadership'];
    if (!in_array($table, $allowed)) {
        jsonResponse(['success' => false, 'message' => 'Invalid table.'], 400);
    }

    // Insert / update for structured tables
    if ($action === 'create') {
        $cols   = [];
        $vals   = [];
        $params = [];
        $writeable = array_diff(array_keys($data), ['table', 'action', 'id']);
        foreach ($writeable as $col) {
            $cols[]   = "`$col`";
            $vals[]   = '?';
            $params[] = $data[$col];
        }
        $db->prepare("INSERT INTO `$table` (" . implode(',', $cols) . ") VALUES (" . implode(',', $vals) . ")")
           ->execute($params);
        jsonResponse(['success' => true, 'message' => 'Row created.', 'id' => $db->lastInsertId()]);
    }

    if ($action === 'update') {
        $id = (int)($data['id'] ?? 0);
        if (!$id) jsonResponse(['success' => false, 'message' => 'ID required.'], 400);
        $sets   = [];
        $params = [];
        $skip   = ['table', 'action', 'id'];
        foreach ($data as $col => $val) {
            if (in_array($col, $skip)) continue;
            $sets[]   = "`$col` = ?";
            $params[] = $val;
        }
        if (!$sets) jsonResponse(['success' => false, 'message' => 'Nothing to update.'], 400);
        $params[] = $id;
        $db->prepare("UPDATE `$table` SET " . implode(', ', $sets) . " WHERE id = ?")->execute($params);
        jsonResponse(['success' => true, 'message' => 'Row updated.']);
    }

    jsonResponse(['success' => false, 'message' => 'Unknown action.'], 400);
}

// ---- DELETE ----
if ($method === 'DELETE') {
    requireAdmin();
    $data  = getRequestBody();
    $table = $data['table'] ?? '';
    $id    = (int)($data['id'] ?? 0);

    $allowed = ['experiences', 'education', 'skills', 'leadership'];
    if (!in_array($table, $allowed) || !$id) {
        jsonResponse(['success' => false, 'message' => 'Invalid request.'], 400);
    }

    $db->prepare("DELETE FROM `$table` WHERE id = ?")->execute([$id]);
    jsonResponse(['success' => true, 'message' => 'Row deleted.']);
}

jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
