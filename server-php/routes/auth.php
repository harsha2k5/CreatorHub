<?php
/**
 * CreatorHub PHP Backend - Authentication Routes
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/controllers/AuthController.php';

use CreatorHub\Controllers\AuthController;
use CreatorHub\Utils\Response;

function handleAuthRoute(string $action, string $method, array $body) {
    if ($action === 'register' && $method === 'POST') {
        AuthController::register($body);
        return;
    }

    if ($action === 'login' && $method === 'POST') {
        AuthController::login($body);
        return;
    }

    if ($action === 'me' && $method === 'GET') {
        AuthController::me();
        return;
    }

    if ($action === 'logout' && $method === 'POST') {
        AuthController::logout();
        return;
    }

    if ($action === 'change-password' && $method === 'POST') {
        AuthController::changePassword($body);
        return;
    }

    Response::notFound('Auth endpoint not found: /api/auth/' . $action);
}
