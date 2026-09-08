<?php
/**
 * CreatorHub PHP Backend - Payment & Escrow Model
 */

namespace CreatorHub\Models;

use Database;

class Payment {
    public static function findById(string $id): ?array {
        return Database::queryOne("SELECT * FROM payments WHERE id = ?", [$id]);
    }

    public static function findByCollabId(string $collabId): ?array {
        return Database::queryOne("SELECT * FROM payments WHERE collaboration_id = ?", [$collabId]);
    }

    public static function findByRazorpayOrderId(string $orderId): ?array {
        return Database::queryOne("SELECT * FROM payments WHERE razorpay_order_id = ?", [$orderId]);
    }

    public static function createEscrow(array $data): array {
        $id = $data['id'] ?? ('pay_' . time() . '_' . bin2hex(random_bytes(3)));
        Database::execute(
            "INSERT INTO payments (
                id, collaboration_id, brand_id, creator_id, amount, currency,
                status, is_simulated, transaction_ref, razorpay_order_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))",
            [
                $id,
                $data['collaboration_id'],
                $data['brand_id'],
                $data['creator_id'],
                $data['amount'],
                $data['currency'] ?? 'INR',
                $data['status'] ?? 'PENDING',
                $data['is_simulated'] ?? 0,
                $data['transaction_ref'] ?? ('TXN_' . time()),
                $data['razorpay_order_id'] ?? null
            ]
        );
        return self::findById($id);
    }

    public static function markVerified(string $collabId, string $orderId, string $paymentId): bool {
        return Database::execute(
            "UPDATE payments 
             SET status = 'HELD_IN_ESCROW',
                 razorpay_order_id = ?,
                 razorpay_payment_id = ?,
                 razorpay_signature_verified = 1,
                 paid_at = datetime('now'),
                 verified_at = datetime('now')
             WHERE collaboration_id = ?",
            [$orderId, $paymentId, $collabId]
        ) > 0;
    }

    public static function markReleased(string $collabId): bool {
        return Database::execute(
            "UPDATE payments 
             SET status = 'RELEASED',
                 released_at = datetime('now')
             WHERE collaboration_id = ?",
            [$collabId]
        ) > 0;
    }

    public static function getCreatorEarnings(string $creatorId): array {
        $stats = Database::queryOne(
            "SELECT 
                COALESCE(SUM(CASE WHEN status = 'RELEASED' THEN amount ELSE 0 END), 0) as total_earned,
                COALESCE(SUM(CASE WHEN status = 'HELD_IN_ESCROW' THEN amount ELSE 0 END), 0) as in_escrow,
                COUNT(id) as total_transactions
             FROM payments 
             WHERE creator_id = ?",
            [$creatorId]
        );

        $transactions = Database::query(
            "SELECT p.*, COALESCE(c.title, 'Brand Campaign') as campaign_title, b.company_name as brand_name
             FROM payments p
             LEFT JOIN collaborations col ON p.collaboration_id = col.id
             LEFT JOIN campaigns c ON col.campaign_id = c.id
             LEFT JOIN brand_profiles b ON p.brand_id = b.id
             WHERE p.creator_id = ?
             ORDER BY p.created_at DESC",
            [$creatorId]
        );

        return [
            'summary' => $stats,
            'transactions' => $transactions
        ];
    }
}
