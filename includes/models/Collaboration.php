<?php
/**
 * CreatorHub PHP Backend - Collaboration Model
 */

namespace CreatorHub\Models;

use Database;

class Collaboration {
    public static function findById(string $id): ?array {
        return Database::queryOne(
            "SELECT col.*, COALESCE(c.title, 'Direct Collaboration') as campaign_title,
                    COALESCE(c.reward_per_creator, p.amount, 5000) as reward_per_creator,
                    b.company_name as brand_name, b.logo_url as brand_logo,
                    cr.full_name as creator_name, cr.username as creator_username,
                    p.id as payment_id, p.status as payment_status, p.amount as payment_amount,
                    p.razorpay_order_id, p.razorpay_payment_id, p.razorpay_signature_verified
             FROM collaborations col
             LEFT JOIN campaigns c ON col.campaign_id = c.id
             LEFT JOIN brand_profiles b ON col.brand_id = b.id
             LEFT JOIN creator_profiles cr ON col.creator_id = cr.id
             LEFT JOIN payments p ON col.id = p.collaboration_id
             WHERE col.id = ?",
            [$id]
        );
    }

    public static function findByCreatorId(string $creatorId): array {
        return Database::query(
            "SELECT col.*, COALESCE(c.title, 'Direct Collaboration Offer') as campaign_title,
                    COALESCE(c.reward_per_creator, p.amount, 5000) as reward_per_creator,
                    c.image_url as campaign_image,
                    b.company_name as brand_name, b.logo_url as brand_logo,
                    p.id as payment_id, p.status as payment_status, p.amount as payment_amount
             FROM collaborations col
             LEFT JOIN campaigns c ON col.campaign_id = c.id
             LEFT JOIN brand_profiles b ON col.brand_id = b.id
             LEFT JOIN payments p ON col.id = p.collaboration_id
             WHERE col.creator_id = ?
             ORDER BY col.started_at DESC",
            [$creatorId]
        );
    }

    public static function findByBrandId(string $brandId): array {
        return Database::query(
            "SELECT col.*, COALESCE(c.title, 'Direct Collaboration Offer') as campaign_title,
                    COALESCE(c.reward_per_creator, p.amount, 5000) as reward_per_creator,
                    cr.full_name as creator_name, cr.username as creator_username, cr.avatar_url as creator_avatar,
                    p.id as payment_id, p.status as payment_status, p.amount as payment_amount
             FROM collaborations col
             LEFT JOIN campaigns c ON col.campaign_id = c.id
             LEFT JOIN creator_profiles cr ON col.creator_id = cr.id
             LEFT JOIN payments p ON col.id = p.collaboration_id
             WHERE col.brand_id = ?
             ORDER BY col.started_at DESC",
            [$brandId]
        );
    }

    public static function updateStatus(string $id, string $status, int $currentStep): bool {
        return Database::execute(
            "UPDATE collaborations SET status = ?, current_step = ? WHERE id = ?",
            [$status, $currentStep, $id]
        ) > 0;
    }
}
