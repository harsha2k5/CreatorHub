<?php
/**
 * CreatorHub PHP Backend - ReviewController
 */

namespace CreatorHub\Controllers;

use Database;
use AuthMiddleware;
use CreatorHub\Utils\Response;

class ReviewController {
    public static function forCreator(string $creatorId): void {
        $reviews = Database::query(
            "SELECT r.*, b.company_name as brand_name, b.logo_url as brand_logo
             FROM reviews r
             JOIN brand_profiles b ON r.brand_id = b.id
             WHERE r.creator_id = ?
             ORDER BY r.created_at DESC",
            [$creatorId]
        );

        Response::json(['success' => true, 'reviews' => $reviews]);
    }

    public static function forCollaboration(string $collabId): void {
        $reviews = Database::query(
            "SELECT r.*, b.company_name as brand_name, cr.full_name as creator_name
             FROM reviews r
             LEFT JOIN brand_profiles b ON r.brand_id = b.id
             LEFT JOIN creator_profiles cr ON r.creator_id = cr.id
             WHERE r.collaboration_id = ?",
            [$collabId]
        );

        Response::json(['success' => true, 'reviews' => $reviews]);
    }

    public static function store(array $body): void {
        $user = AuthMiddleware::authenticate();

        $brandId = null;
        $creatorId = $body['creator_id'] ?? null;
        $collabId = $body['collaboration_id'] ?? null;
        $rating = (float) ($body['rating'] ?? 5);
        $comment = trim($body['comment'] ?? $body['feedback'] ?? '');

        if ($user['role'] === 'brand') {
            $brand = Database::queryOne("SELECT id FROM brand_profiles WHERE user_id = ?", [$user['id']]);
            $brandId = $brand ? $brand['id'] : null;
        }

        $revId = 'rev_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);
        Database::execute(
            "INSERT INTO reviews (id, brand_id, creator_id, collaboration_id, rating, comment, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
            [$revId, $brandId, $creatorId, $collabId, $rating, $comment]
        );

        Response::json(['success' => true, 'message' => 'Review submitted successfully.', 'review_id' => $revId], 201);
    }
}
