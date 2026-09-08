<?php
/**
 * CreatorHub PHP Backend - Creators Directory & Profile Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/controllers/CreatorController.php';

use CreatorHub\Controllers\CreatorController;
use CreatorHub\Utils\Response;

function handleCreatorsRoute(array $segments, string $method, array $body) {
    if (empty($segments) && $method === 'GET') {
        CreatorController::index();
        return;
    }

    $id = $segments[0] ?? null;
    $sub = $segments[1] ?? null;

    if ($id === 'me' && $method === 'GET') {
        CreatorController::me();
        return;
    }

    if ($id === 'profile' && ($method === 'PUT' || $method === 'PATCH' || $method === 'POST')) {
        CreatorController::updateProfile($body);
        return;
    }

    if ($id && $sub === 'pitch' && $method === 'POST') {
        CreatorController::pitch($id, $body);
        return;
    }

    if ($id && empty($sub) && $method === 'GET') {
        CreatorController::show($id);
        return;
    }

    Response::notFound('Creator endpoint not found: /api/creators/' . implode('/', $segments));
}
