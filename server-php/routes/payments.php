<?php
/**
 * CreatorHub PHP Backend - Payments & Escrow Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/middleware/auth.php';
require_once dirname(__DIR__) . '/services/profileHelper.php';
require_once dirname(__DIR__) . '/services/PaymentService.php';

function handlePaymentsRoute(string $action, string $method, array $body) {
    if ($action === 'config' && $method === 'GET') {
        echo json_encode([
            'success' => true,
            'config' => PaymentService::getPublicConfig()
        ]);
        return;
    }

    if ($action === 'earnings' && $method === 'GET') {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireCreator($user);

        $creator = getOrCreateCreatorProfile($user['id'], $user);
        if (!$creator) {
            http_response_code(404);
            echo json_encode(['error' => 'Creator profile not found.']);
            return;
        }

        $data = PaymentService::getCreatorEarnings($creator['id']);
        echo json_encode(array_merge(['success' => true], $data));
        return;
    }

    if ($action === 'create-order' && $method === 'POST') {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireBrand($user);

        $collaborationId = $body['collaboration_id'] ?? '';
        if (empty($collaborationId)) {
            http_response_code(400);
            echo json_encode(['error' => 'collaboration_id is required.']);
            return;
        }

        try {
            $order = PaymentService::createEscrowOrder($collaborationId, $user['id']);
            echo json_encode(array_merge(['success' => true], $order));
        } catch (\Throwable $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        return;
    }

    if ($action === 'verify' && $method === 'POST') {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireBrand($user);

        $collaborationId = $body['collaboration_id'] ?? '';
        $orderId = $body['razorpay_order_id'] ?? '';
        $paymentId = $body['razorpay_payment_id'] ?? '';
        $signature = $body['razorpay_signature'] ?? '';

        if (empty($collaborationId) || empty($orderId) || empty($paymentId)) {
            http_response_code(400);
            echo json_encode(['error' => 'collaboration_id, razorpay_order_id, and razorpay_payment_id are required.']);
            return;
        }

        try {
            $res = PaymentService::verifyEscrowPayment([
                'collaboration_id' => $collaborationId,
                'brand_user_id' => $user['id'],
                'razorpay_order_id' => $orderId,
                'razorpay_payment_id' => $paymentId,
                'razorpay_signature' => $signature
            ]);
            echo json_encode($res);
        } catch (\Throwable $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        return;
    }

    if ($action === 'webhook' && $method === 'POST') {
        $signature = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '';
        $rawBody = file_get_contents('php://input');

        if (!PaymentService::verifyWebhookSignature($rawBody, $signature)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid webhook signature']);
            return;
        }

        echo json_encode(['success' => true, 'received' => true]);
        return;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Payment endpoint not found.']);
}
