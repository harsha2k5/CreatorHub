<?php
/**
 * CreatorHub PHP Backend - Admin Moderation Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/controllers/AdminController.php';

use CreatorHub\Controllers\AdminController;
use CreatorHub\Utils\Response;

function handleAdminRoute(array $segments, string $method, array $body) {
    $first = $segments[0] ?? null;
    $second = $segments[1] ?? null;
    $third = $segments[2] ?? null;

    if ($first === 'stats' && $method === 'GET') {
        AdminController::stats();
        return;
    }

    if ($first === 'users' && empty($second) && $method === 'GET') {
        AdminController::users();
        return;
    }

    if ($first === 'users' && $second && $third === 'suspend' && ($method === 'PUT' || $method === 'POST')) {
        AdminController::suspendUser($second);
        return;
    }

    if ($first === 'creators' && $second && $third === 'verify' && ($method === 'PUT' || $method === 'POST')) {
        AdminController::verifyCreator($second);
        return;
    }

    if ($first === 'campaigns' && empty($second) && $method === 'GET') {
        AdminController::campaigns();
        return;
    }

    if ($first === 'campaigns' && $second && $third === 'moderate' && ($method === 'PATCH' || $method === 'POST')) {
        AdminController::moderateCampaign($second, $body);
        return;
    }

    Response::notFound('Admin endpoint not found: /api/admin/' . implode('/', $segments));
}
