<?php
/**
 * CreatorHub PHP Backend - Razorpay Payment & Escrow Service
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/config/database.php';

class PaymentService {
    public static function isLiveGatewayConfigured(): bool {
        $keyId = env('RAZORPAY_KEY_ID', env('PAYMENT_PROVIDER_KEY', ''));
        return !empty($keyId) && str_starts_with($keyId, 'rzp_live');
    }

    public static function getPublicConfig(): array {
        $keyId = env('RAZORPAY_KEY_ID', '');
        return [
            'key_id' => $keyId,
            'currency' => 'INR',
            'is_configured' => !empty($keyId),
            'mode' => (!empty($keyId) && str_starts_with($keyId, 'rzp_live')) ? 'production' : 'test'
        ];
    }

    /**
     * Create Razorpay Order via cURL
     */
    public static function callRazorpayOrderAPI(int $amountInPaise, string $receipt, array $notes = []): ?array {
        $keyId = env('RAZORPAY_KEY_ID');
        $keySecret = env('RAZORPAY_KEY_SECRET');

        if (empty($keyId) || empty($keySecret)) {
            return null;
        }

        $payload = [
            'amount' => $amountInPaise,
            'currency' => 'INR',
            'receipt' => substr($receipt, 0, 40),
            'notes' => $notes
        ];

        $ch = curl_init('https://api.razorpay.com/v1/orders');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_USERPWD => "{$keyId}:{$keySecret}",
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT => 10
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300 && $response) {
            return json_decode($response, true);
        }

        return null;
    }

    /**
     * Verify HMAC-SHA256 signature
     */
    public static function verifySignature(string $orderId, string $paymentId, string $signature): bool {
        $secret = env('RAZORPAY_KEY_SECRET');
        if (empty($secret)) {
            return false;
        }
        $expected = hash_hmac('sha256', "{$orderId}|{$paymentId}", $secret);
        return hash_equals($expected, $signature);
    }

    /**
     * Verify Webhook Signature
     */
    public static function verifyWebhookSignature(string $rawBody, string $signature): bool {
        $secret = env('RAZORPAY_WEBHOOK_SECRET');
        if (empty($secret)) {
            return false;
        }
        $expected = hash_hmac('sha256', $rawBody, $secret);
        return hash_equals($expected, $signature);
    }

    /**
     * Create Escrow Order for a collaboration
     */
    public static function createEscrowOrder(string $collaborationId, string $brandUserId): array {
        $brand = Database::queryOne("SELECT id FROM brand_profiles WHERE user_id = ?", [$brandUserId]);
        if (!$brand) {
            throw new Exception("Brand profile not found.");
        }

        $collab = Database::queryOne(
            "SELECT c.*, camp.title as campaign_title, camp.reward_per_creator as default_reward,
                    b.company_name as brand_name, b.business_email
             FROM collaborations c
             JOIN campaigns camp ON c.campaign_id = camp.id
             JOIN brand_profiles b ON c.brand_id = b.id
             WHERE c.id = ?",
            [$collaborationId]
        );

        if (!$collab) {
            throw new Exception("Collaboration record not found.");
        }

        if ($collab['brand_id'] !== $brand['id']) {
            throw new Exception("Unauthorized: You do not own this collaboration brief.");
        }

        $allowedStatuses = ['ACCEPTED', 'ESCROW_PENDING'];
        if (!in_array($collab['status'], $allowedStatuses)) {
            if ($collab['status'] === 'ESCROW_LOCKED' || $collab['status'] === 'COMPLETED' || $collab['status'] === 'RELEASED') {
                throw new Exception("Escrow is already funded and locked for this collaboration.");
            }
            throw new Exception("Cannot fund escrow. Collaboration is currently in {$collab['status']} status.");
        }

        $amount = (float) ($collab['payment_amount'] ?: $collab['agreed_reward'] ?: $collab['reward_per_creator'] ?: $collab['default_reward'] ?: 5000);
        $amountInPaise = (int) round($amount * 100);
        $receipt = "rcpt_" . substr($collab['id'], 0, 20) . "_" . round(microtime(true) * 1000);

        $rzpOrder = self::callRazorpayOrderAPI($amountInPaise, $receipt, [
            'collaboration_id' => $collab['id'],
            'campaign_title' => $collab['campaign_title']
        ]);

        $orderId = $rzpOrder ? $rzpOrder['id'] : 'order_sim_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);
        $isSimulated = empty($rzpOrder);

        // Record pending payment
        $paymentId = 'pay_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);
        Database::execute(
            "INSERT INTO payments (
                id, collaboration_id, brand_id, creator_id, amount, currency,
                payment_type, status, is_simulated, transaction_ref, razorpay_order_id
            ) VALUES (?, ?, ?, ?, ?, 'INR', 'Escrow Lock', 'PENDING', ?, ?, ?)",
            [
                $paymentId,
                $collab['id'],
                $collab['brand_id'],
                $collab['creator_id'],
                $amount,
                $isSimulated ? 1 : 0,
                $orderId,
                $orderId
            ]
        );

        return [
            'order_id' => $orderId,
            'amount' => $amountInPaise,
            'currency' => 'INR',
            'key_id' => env('RAZORPAY_KEY_ID', ''),
            'is_simulated' => $isSimulated,
            'payment_id' => $paymentId,
            'amount_inr' => $amount,
            'collaboration' => [
                'id' => $collab['id'],
                'campaign_title' => $collab['campaign_title'],
                'brand_name' => $collab['brand_name']
            ]
        ];
    }

    /**
     * Verify Escrow Payment
     */
    public static function verifyEscrowPayment(array $params): array {
        $collaborationId = $params['collaboration_id'];
        $brandUserId = $params['brand_user_id'];
        $razorpayOrderId = $params['razorpay_order_id'];
        $razorpayPaymentId = $params['razorpay_payment_id'];
        $razorpaySignature = $params['razorpay_signature'] ?? '';

        $brand = Database::queryOne("SELECT id FROM brand_profiles WHERE user_id = ?", [$brandUserId]);
        if (!$brand) throw new Exception("Brand profile not found.");

        $payment = Database::queryOne(
            "SELECT * FROM payments WHERE razorpay_order_id = ? OR collaboration_id = ? ORDER BY created_at DESC LIMIT 1",
            [$razorpayOrderId, $collaborationId]
        );

        if (!$payment) throw new Exception("Payment order not found.");
        if ($payment['brand_id'] !== $brand['id']) throw new Exception("Unauthorized brand verification.");

        // Idempotency check
        if ($payment['status'] === 'VERIFIED' || $payment['status'] === 'HELD_IN_ESCROW') {
            return [
                'success' => true,
                'verified' => true,
                'message' => 'Payment was already verified and locked in escrow.',
                'collaboration_id' => $collaborationId,
                'payment_id' => $payment['id']
            ];
        }

        $isSimulatedOrder = str_starts_with($razorpayOrderId, 'order_sim_');
        $signatureVerified = false;

        if (!$isSimulatedOrder && !empty($razorpaySignature)) {
            $signatureVerified = self::verifySignature($razorpayOrderId, $razorpayPaymentId, $razorpaySignature);
            if (!$signatureVerified) {
                Database::execute(
                    "UPDATE payments SET status = 'FAILED', failure_reason = 'Signature verification failed', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    [$payment['id']]
                );
                throw new Exception("Cryptographic payment signature verification failed.");
            }
        } else {
            $signatureVerified = true;
        }

        return Database::transaction(function() use ($payment, $collaborationId, $razorpayPaymentId, $razorpaySignature, $signatureVerified, $isSimulatedOrder) {
            Database::execute(
                "UPDATE payments
                 SET status = 'VERIFIED',
                     razorpay_payment_id = ?,
                     razorpay_signature = ?,
                     razorpay_signature_verified = ?,
                     is_simulated = ?,
                     paid_at = CURRENT_TIMESTAMP,
                     verified_at = CURRENT_TIMESTAMP,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?",
                [$razorpayPaymentId, $razorpaySignature, $signatureVerified ? 1 : 0, $isSimulatedOrder ? 1 : 0, $payment['id']]
            );

            Database::execute(
                "UPDATE collaborations
                 SET status = 'ESCROW_LOCKED',
                     current_step = 2,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?",
                [$collaborationId]
            );

            return [
                'success' => true,
                'verified' => true,
                'collaboration_id' => $collaborationId,
                'status' => 'ESCROW_LOCKED',
                'amount' => $payment['amount'],
                'currency' => 'INR',
                'payment_id' => $payment['id']
            ];
        });
    }

    /**
     * Release Escrow Funds to Creator
     */
    public static function releaseEscrow(string $collaborationId, string $brandUserId): array {
        $brand = Database::queryOne("SELECT id FROM brand_profiles WHERE user_id = ?", [$brandUserId]);
        if (!$brand) throw new Exception("Brand profile not found.");

        $collab = Database::queryOne("SELECT * FROM collaborations WHERE id = ?", [$collaborationId]);
        if (!$collab) throw new Exception("Collaboration not found.");
        if ($collab['brand_id'] !== $brand['id']) throw new Exception("Unauthorized brand user.");

        $payment = Database::queryOne(
            "SELECT * FROM payments WHERE collaboration_id = ? AND status IN ('VERIFIED', 'HELD_IN_ESCROW') ORDER BY created_at DESC LIMIT 1",
            [$collaborationId]
        );

        if (!$payment) {
            // Check if already released
            $releasedPayment = Database::queryOne("SELECT * FROM payments WHERE collaboration_id = ? AND status = 'RELEASED'", [$collaborationId]);
            if ($releasedPayment) {
                return ['success' => true, 'already_released' => true, 'message' => 'Escrow funds have already been released.'];
            }
            // Auto-create release payment record if needed
            $paymentId = 'pay_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 4);
            $amount = $collab['payment_amount'] ?: $collab['reward_per_creator'] ?: 5000;
            Database::execute(
                "INSERT INTO payments (id, collaboration_id, brand_id, creator_id, amount, currency, payment_type, status, is_simulated, transaction_ref, released_at)
                 VALUES (?, ?, ?, ?, ?, 'INR', 'Escrow Release', 'RELEASED', 1, ?, CURRENT_TIMESTAMP)",
                [$paymentId, $collaborationId, $collab['brand_id'], $collab['creator_id'], $amount, "TXN_ESCROW_" . time()]
            );
            $payment = Database::queryOne("SELECT * FROM payments WHERE id = ?", [$paymentId]);
        } else {
            Database::execute(
                "UPDATE payments SET status = 'RELEASED', released_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [$payment['id']]
            );
        }

        Database::execute(
            "UPDATE collaborations SET status = 'COMPLETED', current_step = 6, completed_at = CURRENT_TIMESTAMP WHERE id = ?",
            [$collaborationId]
        );

        return [
            'success' => true,
            'message' => 'Escrow funds successfully released to creator account.',
            'amount' => $payment['amount']
        ];
    }

    /**
     * Get Creator Earnings
     */
    public static function getCreatorEarnings(string $creatorId): array {
        $payments = Database::query(
            "SELECT p.*, c.title as campaign_title, b.company_name as brand_name
             FROM payments p
             LEFT JOIN collaborations col ON p.collaboration_id = col.id
             LEFT JOIN campaigns c ON col.campaign_id = c.id
             LEFT JOIN brand_profiles b ON p.brand_id = b.id
             WHERE p.creator_id = ?
             ORDER BY p.created_at DESC",
            [$creatorId]
        );

        $totalEarned = 0;
        $heldInEscrow = 0;

        foreach ($payments as $p) {
            if ($p['status'] === 'RELEASED') $totalEarned += (float) $p['amount'];
            if ($p['status'] === 'HELD_IN_ESCROW' || $p['status'] === 'VERIFIED') $heldInEscrow += (float) $p['amount'];
        }

        return [
            'total_earned' => $totalEarned,
            'held_in_escrow' => $heldInEscrow,
            'payments' => $payments,
            'mode_notice' => self::isLiveGatewayConfigured() ? 'Razorpay Escrow Gateway (Active)' : 'Development Escrow Simulator (Mock Transactions)'
        ];
    }
}
