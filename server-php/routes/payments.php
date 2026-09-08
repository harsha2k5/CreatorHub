<?php
/**
 * CreatorHub PHP Backend - Payments & Escrow Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/controllers/PaymentController.php';

use CreatorHub\Controllers\PaymentController;
use CreatorHub\Utils\Response;

function handlePaymentsRoute(string $action, string $method, array $body) {
    if ($action === 'config' && $method === 'GET') {
        PaymentController::config();
        return;
    }

    if ($action === 'earnings' && $method === 'GET') {
        PaymentController::earnings();
        return;
    }

    if ($action === 'create-order' && $method === 'POST') {
        PaymentController::createOrder($body);
        return;
    }

    if ($action === 'verify' && $method === 'POST') {
        PaymentController::verify($body);
        return;
    }

    if ($action === 'webhook' && $method === 'POST') {
        PaymentController::webhook();
        return;
    }

    if (!empty($action) && $method === 'GET') {
        PaymentController::show($action);
        return;
    }

    Response::notFound('Payment endpoint not found: /api/payments/' . $action);
}
