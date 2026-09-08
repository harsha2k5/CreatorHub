<?php
/**
 * CreatorHub PHP Backend - BrandController
 */

namespace CreatorHub\Controllers;

use Database;
use AuthMiddleware;
use CreatorHub\Utils\Response;

class BrandController {
    public static function index(): void {
        $brands = Database::query(
            "SELECT b.*, u.email 
             FROM brand_profiles b 
             JOIN users u ON b.user_id = u.id 
             WHERE u.is_active = 1 
             ORDER BY b.created_at DESC"
        );
        Response::json(['success' => true, 'brands' => $brands]);
    }

    public static function show(string $id): void {
        $brand = Database::queryOne(
            "SELECT b.*, u.email 
             FROM brand_profiles b 
             JOIN users u ON b.user_id = u.id 
             WHERE b.id = ?",
            [$id]
        );

        if (!$brand) {
            Response::notFound('Brand not found.');
        }

        Response::json(['success' => true, 'brand' => $brand]);
    }

    public static function analytics(): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireBrand($user);

        $brand = Database::queryOne("SELECT * FROM brand_profiles WHERE user_id = ?", [$user['id']]);
        if (!$brand) {
            Response::notFound('Brand profile not found.');
        }

        $campaignCount = Database::queryOne("SELECT COUNT(*) as count FROM campaigns WHERE brand_id = ?", [$brand['id']]);
        $activeCollabs = Database::queryOne(
            "SELECT COUNT(*) as count FROM collaborations WHERE brand_id = ? AND status IN ('ACCEPTED', 'ESCROW_LOCKED', 'SUBMITTED', 'APPROVED')",
            [$brand['id']]
        );
        $totalSpent = Database::queryOne(
            "SELECT SUM(amount) as total FROM payments WHERE brand_id = ? AND status IN ('VERIFIED', 'HELD_IN_ESCROW', 'RELEASED')",
            [$brand['id']]
        );

        Response::json([
            'success' => true,
            'analytics' => [
                'total_campaigns' => (int) ($campaignCount['count'] ?? 0),
                'active_collaborations' => (int) ($activeCollabs['count'] ?? 0),
                'total_escrow_funded' => (float) ($totalSpent['total'] ?? 0)
            ]
        ]);
    }

    public static function updateProfile(array $body): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireBrand($user);

        $brand = Database::queryOne("SELECT * FROM brand_profiles WHERE user_id = ?", [$user['id']]);
        if (!$brand) {
            Response::notFound('Brand profile not found.');
        }

        $companyName = trim($body['company_name'] ?? '');
        $website = trim($body['website'] ?? '');
        $bio = trim($body['bio'] ?? $body['description'] ?? '');
        $logoUrl = trim($body['logo_url'] ?? '');

        Database::execute(
            "UPDATE brand_profiles
             SET company_name = COALESCE(NULLIF(?, ''), company_name),
                 website = COALESCE(NULLIF(?, ''), website),
                 description = COALESCE(NULLIF(?, ''), description),
                 logo_url = COALESCE(NULLIF(?, ''), logo_url),
                 updated_at = datetime('now')
             WHERE id = ?",
            [$companyName, $website, $bio, $logoUrl, $brand['id']]
        );

        $updated = Database::queryOne("SELECT * FROM brand_profiles WHERE id = ?", [$brand['id']]);
        Response::json(['success' => true, 'profile' => $updated]);
    }
}
