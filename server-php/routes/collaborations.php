<?php
/**
 * CreatorHub PHP Backend - Collaborations Route
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/controllers/CollaborationController.php';

use CreatorHub\Controllers\CollaborationController;
use CreatorHub\Utils\Response;

function handleCollaborationsRoute(array $segments, string $method, array $body) {
    // GET /api/collaborations
    if (empty($segments) && $method === 'GET') {
        CollaborationController::index();
        return;
    }

    $id = $segments[0] ?? null;
    $action = $segments[1] ?? null;

    // GET /api/collaborations/:id
    if ($id && empty($action) && $method === 'GET') {
        CollaborationController::show($id);
        return;
    }

    // POST /api/collaborations/:id/submit
    if ($id && $action === 'submit' && $method === 'POST') {
        CollaborationController::submitDeliverable($id, $body);
        return;
    }

    // POST /api/collaborations/:id/review
    if ($id && $action === 'review' && $method === 'POST') {
        CollaborationController::reviewDeliverable($id, $body);
        return;
    }

    // POST /api/collaborations/:id/release
    if ($id && $action === 'release' && $method === 'POST') {
        CollaborationController::release($id);
        return;
    }

    Response::notFound('Collaboration action not found: /api/collaborations/' . implode('/', $segments));
}
