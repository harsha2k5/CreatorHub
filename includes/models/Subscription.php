<?php
/**
 * CreatorHub - Subscription Model
 */

declare(strict_types=1);

namespace CreatorHub\Models;

use Database;

class Subscription {
    public static function getActive(string $creatorId): ?array {
        return Database::queryOne(
            "SELECT * FROM creator_subscriptions 
             WHERE creator_id = ? AND status = 'active' 
             ORDER BY created_at DESC LIMIT 1",
            [$creatorId]
        );
    }

    public static function createOrder(string $creatorId, string $tier, string $cycle, float $amount, ?string $orderId = null): array {
        $id = 'sub_' . time() . '_' . bin2hex(random_bytes(3));
        Database::execute(
            "INSERT INTO creator_subscriptions (
                id, creator_id, tier, price, billing_cycle,
                status, transaction_ref, created_at
            ) VALUES (?, ?, ?, ?, ?, 'active', ?, CURRENT_TIMESTAMP)",
            [$id, $creatorId, strtolower($tier), $amount, $cycle, $orderId ?: ('TXN_SUB_' . time())]
        );
        return Database::queryOne("SELECT * FROM creator_subscriptions WHERE id = ?", [$id]) ?? [];
    }

    public static function activate(string $id, string $paymentId, ?string $signature = null): bool {
        $sub = Database::queryOne("SELECT * FROM creator_subscriptions WHERE id = ?", [$id]);
        if (!$sub) return false;

        $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));
        if (($sub['billing_cycle'] ?? '') === 'yearly') {
            $expiresAt = date('Y-m-d H:i:s', strtotime('+365 days'));
        }

        Database::transaction(function() use ($sub, $paymentId, $signature, $expiresAt, $id) {
            Database::execute(
                "UPDATE creator_subscriptions 
                 SET status = 'active',
                     transaction_ref = ?,
                     expires_at = ?
                 WHERE id = ?",
                [$paymentId, $expiresAt, $id]
            );

            Database::execute(
                "UPDATE creator_profiles 
                 SET subscription_tier = ?,
                     subscription_expires_at = ?,
                     subscription_updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?",
                [strtolower($sub['tier']), $expiresAt, $sub['creator_id']]
            );
        });

        return true;
    }
}
