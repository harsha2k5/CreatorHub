<?php
/**
 * CreatorHub PHP Backend - Instagram Graph API & Integration Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/controllers/InstagramController.php';

use CreatorHub\Controllers\InstagramController;
use CreatorHub\Utils\Response;

function handleInstagramRoute(string $action, string $method, array $body) {
    if (($action === 'connect' || $action === 'connect-url') && $method === 'GET') {
        InstagramController::connectUrl();
        return;
    }

    if ($action === 'callback' && $method === 'POST') {
        InstagramController::callback($body);
        return;
    }

    if ($action === 'status' && $method === 'GET') {
        InstagramController::status();
        return;
    }

    if ($action === 'sync' && $method === 'POST') {
        InstagramController::sync();
        return;
    }

    if ($action === 'metrics' && $method === 'GET') {
        InstagramController::metrics();
        return;
    }

    if ($action === 'media' && $method === 'GET') {
        InstagramController::media();
        return;
    }

    if ($action === 'disconnect' && $method === 'POST') {
        InstagramController::disconnect();
        return;
    }

    if ($action === 'verify-link' && $method === 'POST') {
        InstagramController::verifyLink($body);
        return;
    }

    if ($action === 'connect-by-link' && $method === 'POST') {
        InstagramController::connectByLink($body);
        return;
    }

    Response::notFound('Instagram endpoint not found: /api/instagram/' . $action);
}
