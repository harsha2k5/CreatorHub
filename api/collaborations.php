<?php
/**
 * CreatorHub PHP Backend - Collaborations Route
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/includes/controllers/CollaborationController.php';
require_once dirname(__DIR__) . '/includes/models/Deliverable.php';

use CreatorHub\Controllers\CollaborationController;
use CreatorHub\Models\Deliverable;
use CreatorHub\Utils\Response;

function handleCollaborationsRoute(array $segments, string $method, array $body): void {
    // GET /api/collaborations
    if (empty($segments) && $method === 'GET') {
        CollaborationController::index();
        return;
    }

    $id = $segments[0] ?? null;
    $action = strtolower(trim($segments[1] ?? ''));

    // GET /api/collaborations/:id
    if ($id && empty($action) && $method === 'GET') {
        CollaborationController::show($id);
        return;
    }

    // POST /api/collaborations/:id/deliverables OR POST /api/collaborations/:id/submit
    if ($id && ($action === 'deliverables' || $action === 'submit') && $method === 'POST') {
        CollaborationController::submitDeliverable($id, $body);
        return;
    }

    // GET /api/collaborations/:id/deliverables
    if ($id && $action === 'deliverables' && $method === 'GET') {
        $deliverables = Deliverable::findByCollabId($id);
        Response::json([
            'success' => true,
            'deliverables' => $deliverables,
            'count' => count($deliverables)
        ]);
        return;
    }

    // POST /api/collaborations/:id/approve
    if ($id && $action === 'approve' && $method === 'POST') {
        CollaborationController::reviewDeliverable($id, array_merge($body, ['action' => 'APPROVE']));
        return;
    }

    // POST /api/collaborations/:id/reject
    if ($id && $action === 'reject' && $method === 'POST') {
        $reason = $body['reason'] ?? ($body['feedback'] ?? 'Please revise deliverables according to brand guidelines.');
        CollaborationController::reviewDeliverable($id, array_merge($body, ['action' => 'REVISION', 'feedback' => $reason]));
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
