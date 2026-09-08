<?php
/**
 * CreatorHub PHP Backend - Subscription Model
 */

namespace CreatorHub\Models;

use Database;

class Subscription {
    public static function getActive(string $creatorId): ?array {
        return Database::queryOne(
            "SELECT * FROM creator_subscriptions 
             WHERE creator_id = ? AND status = 'ACTIVE' 
             ORDER BY created_at DESC LIMIT 1",
            [$creatorId]
        );
    }

    public static function createOrder(string $creatorId, string $tier, string $cycle, float $amount, ?string $orderId = null): array {
        $id = 'sub_' . time() . '_' . bin2hex(random_bytes(3));
        Database::execute(
            "INSERT INTO creator_subscriptions (
                id, creator_id, tier, billing_cycle, price_paid, 
                status, razorpay_order_id, created_at
            ) VALUES (?, ?, ?, ?, ?, 'PENDING', ?, datetime('now'))",
            [$id, $creatorId, strtoupper($tier), $cycle, $amount, $orderId]
        );
        return Database::queryOne("SELECT * FROM creator_subscriptions WHERE id = ?", [$id]);
    }

    public static function activate(string $id, string $paymentId, ?string $signature = null): bool {
        $sub = Database::queryOne("SELECT * FROM creator_subscriptions WHERE id = ?", [$id]);
        if (!$sub) return false;

        $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
        if ($sub['billing_cycle'] === 'yearly') {
            $expiresAt = date('Y-m-d H:i:s', strtotime('+365 days'));
        }

        Database::transaction(function() use ($sub, $paymentId, $signature, $expiresAt, $id) {
            Database::execute(
                "UPDATE creator_subscriptions 
                 SET status = 'ACTIVE',
                     razorpay_payment_id = ?,
                     razorpay_signature = ?,
                     activated_at = datetime('now'),
                     expires_at = ?
                 WHERE id = ?",
                [$paymentId, $signature, $expiresAt, $id]
            );

            Database::execute(
                "UPDATE creator_profiles 
                 SET subscription_tier = ?,
                     badge_tier = ?
                 WHERE id = ?",
                [$sub['tier'], $sub['tier'], $sub['creator_id']]
            );
        });

        return true;
    }
}
