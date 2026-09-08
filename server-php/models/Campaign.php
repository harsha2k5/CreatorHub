<?php
/**
 * CreatorHub PHP Backend - Campaign Model
 */

namespace CreatorHub\Models;

use Database;

class Campaign {
    public static function findById(string $id): ?array {
        return Database::queryOne(
            "SELECT c.*, b.company_name, b.logo_url, b.verified as verified_badge 
             FROM campaigns c 
             LEFT JOIN brand_profiles b ON c.brand_id = b.id 
             WHERE c.id = ?",
            [$id]
        );
    }

    public static function findAll(array $filters = []): array {
        $sql = "SELECT c.*, b.company_name, b.logo_url, b.verified as verified_badge 
                FROM campaigns c 
                LEFT JOIN brand_profiles b ON c.brand_id = b.id 
                WHERE 1=1";
        $params = [];

        if (!empty($filters['status'])) {
            $sql .= " AND c.status = ?";
            $params[] = $filters['status'];
        } else {
            $sql .= " AND c.status != 'ARCHIVED'";
        }

        if (!empty($filters['brand_id'])) {
            $sql .= " AND c.brand_id = ?";
            $params[] = $filters['brand_id'];
        }

        if (!empty($filters['category'])) {
            $sql .= " AND c.category LIKE ?";
            $params[] = '%' . $filters['category'] . '%';
        }

        if (!empty($filters['search'])) {
            $sql .= " AND (c.title LIKE ? OR c.description LIKE ?)";
            $params[] = '%' . $filters['search'] . '%';
            $params[] = '%' . $filters['search'] . '%';
        }

        $sql .= " ORDER BY c.created_at DESC";

        if (!empty($filters['limit'])) {
            $sql .= " LIMIT " . (int)$filters['limit'];
        }

        return Database::query($sql, $params);
    }

    public static function create(array $data): ?array {
        $id = $data['id'] ?? ('cmp_' . time() . '_' . bin2hex(random_bytes(3)));
        Database::execute(
            "INSERT INTO campaigns (
                id, brand_id, title, description, category, target_followers_min,
                budget_total, reward_per_creator, max_creators, location_target,
                status, image_url, deliverables_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
            [
                $id,
                $data['brand_id'],
                $data['title'],
                $data['description'] ?? '',
                $data['category'] ?? 'General',
                $data['target_followers_min'] ?? 0,
                $data['budget_total'] ?? 0,
                $data['reward_per_creator'] ?? 0,
                $data['max_creators'] ?? 1,
                $data['location_target'] ?? 'All India',
                $data['status'] ?? 'ACTIVE',
                $data['image_url'] ?? '',
                is_array($data['deliverables'] ?? null) ? json_encode($data['deliverables']) : ($data['deliverables_json'] ?? '[]')
            ]
        );
        return self::findById($id);
    }

    public static function updateStatus(string $id, string $status): bool {
        return Database::execute(
            "UPDATE campaigns SET status = ?, updated_at = datetime('now') WHERE id = ?",
            [$status, $id]
        ) > 0;
    }
}
