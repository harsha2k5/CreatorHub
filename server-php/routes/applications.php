<?php
/**
 * CreatorHub PHP Backend - Applications Route
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/controllers/ApplicationController.php';

use CreatorHub\Controllers\ApplicationController;
use CreatorHub\Utils\Response;

function handleApplicationsRoute(array $segments, string $method, array $body) {
    // GET /api/applications
    if (empty($segments) && $method === 'GET') {
        ApplicationController::index();
        return;
    }

    // POST /api/applications/apply or POST /api/applications
    if ((empty($segments) || ($segments[0] ?? '') === 'apply') && $method === 'POST') {
        ApplicationController::apply($body);
        return;
    }

    $appId = $segments[0] ?? null;
    $action = $segments[1] ?? null;

    // PATCH /api/applications/:id/status
    if ($appId && $action === 'status' && ($method === 'PATCH' || $method === 'POST')) {
        ApplicationController::updateStatus($appId, $body['status'] ?? '');
        return;
    }

    // POST /api/applications/:id/accept
    if ($appId && $action === 'accept' && $method === 'POST') {
        ApplicationController::updateStatus($appId, 'ACCEPTED');
        return;
    }

    // POST /api/applications/:id/decline
    if ($appId && $action === 'decline' && $method === 'POST') {
        ApplicationController::updateStatus($appId, 'REJECTED');
        return;
    }

    Response::notFound('Application endpoint not found: /api/applications/' . implode('/', $segments));
}
