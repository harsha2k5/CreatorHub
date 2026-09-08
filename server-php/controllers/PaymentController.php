<?php
/**
 * CreatorHub PHP Backend - PaymentController
 */

namespace CreatorHub\Controllers;

use Database;
use AuthMiddleware;
use PaymentService;
use CreatorHub\Utils\Response;
use CreatorHub\Models\Payment;

class PaymentController {
    public static function config(): void {
        Response::json([
            'success' => true,
            'config' => PaymentService::getPublicConfig()
        ]);
    }

    public static function earnings(): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireCreator($user);

        require_once dirname(__DIR__) . '/services/profileHelper.php';
        $creator = getOrCreateCreatorProfile($user['id'], $user);
        if (!$creator) {
            Response::notFound('Creator profile not found.');
        }

        $data = PaymentService::getCreatorEarnings($creator['id']);
        Response::json(array_merge(['success' => true], $data));
    }

    public static function createOrder(array $body): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireBrand($user);

        $collaborationId = $body['collaboration_id'] ?? '';
        if (empty($collaborationId)) {
            Response::error('collaboration_id is required.', 400);
        }

        try {
            $order = PaymentService::createEscrowOrder($collaborationId, $user['id']);
            Response::json(array_merge(['success' => true], $order));
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public static function verify(array $body): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireBrand($user);

        $collaborationId = $body['collaboration_id'] ?? '';
        $orderId = $body['razorpay_order_id'] ?? '';
        $paymentId = $body['razorpay_payment_id'] ?? '';
        $signature = $body['razorpay_signature'] ?? '';

        if (empty($collaborationId) || empty($orderId) || empty($paymentId)) {
            Response::error('collaboration_id, razorpay_order_id, and razorpay_payment_id are required.', 400);
        }

        try {
            $res = PaymentService::verifyEscrowPayment([
                'collaboration_id' => $collaborationId,
                'brand_user_id' => $user['id'],
                'razorpay_order_id' => $orderId,
                'razorpay_payment_id' => $paymentId,
                'razorpay_signature' => $signature
            ]);
            Response::json($res);
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public static function release(string $id): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireBrand($user);

        try {
            $res = PaymentService::releaseEscrow($id, $user['id']);
            Response::json($res);
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public static function webhook(): void {
        $signature = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '';
        $rawBody = $GLOBALS['RAW_REQUEST_BODY'] ?? file_get_contents('php://input');

        if (!PaymentService::verifyWebhookSignature($rawBody, $signature)) {
            Response::error('Invalid webhook signature', 400);
        }

        Response::json(['success' => true, 'received' => true]);
    }

    public static function show(string $id): void {
        $user = AuthMiddleware::authenticate();
        $payment = Payment::findById($id);
        if (!$payment) {
            Response::notFound('Payment record not found.');
        }

        Response::json(['success' => true, 'payment' => $payment]);
    }
}
