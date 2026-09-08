<?php
/**
 * CreatorHub PHP Backend - Messages & Chat Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/controllers/MessageController.php';

use CreatorHub\Controllers\MessageController;
use CreatorHub\Utils\Response;

function handleMessagesRoute(array $segments, string $method, array $body) {
    $action = $segments[0] ?? null;

    if ($action === 'conversations' && $method === 'GET') {
        MessageController::conversations();
        return;
    }

    if ($action && $method === 'GET') {
        MessageController::messages($action);
        return;
    }

    if ($action && $method === 'POST') {
        MessageController::sendMessage($action, $body);
        return;
    }

    Response::notFound('Messages endpoint not found: /api/messages/' . implode('/', $segments));
}
