<?php
/**
 * CreatorHub PHP Backend - AdminController
 */

namespace CreatorHub\Controllers;

use Database;
use AuthMiddleware;
use CreatorHub\Utils\Response;

class AdminController {
    public static function stats(): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($user);

        $creatorsCount = Database::queryOne("SELECT COUNT(*) as count FROM creator_profiles")['count'] ?? 0;
        $brandsCount = Database::queryOne("SELECT COUNT(*) as count FROM brand_profiles")['count'] ?? 0;
        $campaignsCount = Database::queryOne("SELECT COUNT(*) as count FROM campaigns")['count'] ?? 0;
        $activeCollabsCount = Database::queryOne("SELECT COUNT(*) as count FROM collaborations WHERE status IN ('ACTIVE', 'ACCEPTED', 'SUBMITTED')")['count'] ?? 0;
        $totalEscrow = Database::queryOne("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status IN ('HELD_IN_ESCROW', 'RELEASED')")['total'] ?? 0;

        Response::json([
            'success' => true,
            'stats' => [
                'creators_count' => (int) $creatorsCount,
                'brands_count' => (int) $brandsCount,
                'campaigns_count' => (int) $campaignsCount,
                'active_collaborations' => (int) $activeCollabsCount,
                'total_escrow_volume' => (float) $totalEscrow
            ]
        ]);
    }

    public static function users(): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($user);

        $users = Database::query(
            "SELECT u.id, u.email, u.role, u.is_active, u.is_verified, u.created_at,
                    COALESCE(cp.full_name, bp.company_name, 'User') as display_name
             FROM users u
             LEFT JOIN creator_profiles cp ON u.id = cp.user_id
             LEFT JOIN brand_profiles bp ON u.id = bp.user_id
             ORDER BY u.created_at DESC"
        );

        Response::json(['success' => true, 'users' => $users]);
    }

    public static function suspendUser(string $userId): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($user);

        $target = Database::queryOne("SELECT is_active FROM users WHERE id = ?", [$userId]);
        if (!$target) {
            Response::notFound('User not found.');
        }

        $newActive = $target['is_active'] ? 0 : 1;
        Database::execute("UPDATE users SET is_active = ?, updated_at = datetime('now') WHERE id = ?", [$newActive, $userId]);

        Response::json([
            'success' => true,
            'message' => $newActive ? 'User account restored.' : 'User account suspended.',
            'is_active' => $newActive
        ]);
    }

    public static function verifyCreator(string $creatorId): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($user);

        Database::execute("UPDATE creator_profiles SET verified = 1, updated_at = datetime('now') WHERE id = ?", [$creatorId]);
        Response::json(['success' => true, 'message' => 'Creator verified badge granted.']);
    }

    public static function campaigns(): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($user);

        $campaigns = Database::query(
            "SELECT c.*, b.company_name as brand_name, b.business_email
             FROM campaigns c
             LEFT JOIN brand_profiles b ON c.brand_id = b.id
             ORDER BY c.created_at DESC"
        );

        Response::json(['success' => true, 'campaigns' => $campaigns]);
    }

    public static function moderateCampaign(string $id, array $body): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($user);

        $status = strtoupper($body['status'] ?? 'PUBLISHED');
        Database::execute("UPDATE campaigns SET status = ?, updated_at = datetime('now') WHERE id = ?", [$status, $id]);

        Response::json(['success' => true, 'message' => "Campaign status updated to {$status}."]);
    }
}
