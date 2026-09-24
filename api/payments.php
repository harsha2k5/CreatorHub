<?php
/**
 * CreatorHub PHP Backend - Payments & Escrow Routes
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/includes/controllers/PaymentController.php';

use CreatorHub\Controllers\PaymentController;
use CreatorHub\Utils\Response;

function handlePaymentsRoute(string $action, string $method, array $body): void {
    if ($action === 'config' && $method === 'GET') {
        PaymentController::config();
        return;
    }

    if ($action === 'earnings' && $method === 'GET') {
        PaymentController::earnings();
        return;
    }

    if (($action === 'create-order' || $action === 'create-escrow-order') && $method === 'POST') {
        PaymentController::createOrder($body);
        return;
    }

    if (($action === 'verify' || $action === 'verify-escrow') && $method === 'POST') {
        PaymentController::verify($body);
        return;
    }

    if (($action === 'release' || $action === 'release-escrow') && $method === 'POST') {
        $collabId = $body['collaboration_id'] ?? ($body['id'] ?? '');
        PaymentController::release($collabId);
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
