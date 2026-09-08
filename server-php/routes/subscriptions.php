<?php
/**
 * CreatorHub PHP Backend - Subscriptions Route
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/controllers/SubscriptionController.php';

use CreatorHub\Controllers\SubscriptionController;
use CreatorHub\Utils\Response;

function handleSubscriptionsRoute(string $action, string $method, array $body) {
    if ($action === 'plans' && $method === 'GET') {
        SubscriptionController::plans();
        return;
    }

    if ($action === 'current' && $method === 'GET') {
        SubscriptionController::current();
        return;
    }

    if ($action === 'create-order' && $method === 'POST') {
        SubscriptionController::createOrder($body);
        return;
    }

    if ($action === 'upgrade' && $method === 'POST') {
        SubscriptionController::upgrade($body);
        return;
    }

    Response::notFound('Subscription action not found: /api/subscriptions/' . $action);
}
