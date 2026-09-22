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

        $creatorsCount = (int)(Database::queryOne("SELECT COUNT(*) as count FROM creator_profiles")['count'] ?? 0);
        $brandsCount = (int)(Database::queryOne("SELECT COUNT(*) as count FROM brand_profiles")['count'] ?? 0);
        $totalUsers = (int)(Database::queryOne("SELECT COUNT(*) as count FROM users")['count'] ?? 0);
        $activeUsers = (int)(Database::queryOne("SELECT COUNT(*) as count FROM users WHERE is_active = 1")['count'] ?? 0);
        $campaignsCount = (int)(Database::queryOne("SELECT COUNT(*) as count FROM campaigns")['count'] ?? 0);
        $publishedCampaigns = (int)(Database::queryOne("SELECT COUNT(*) as count FROM campaigns WHERE status = 'PUBLISHED'")['count'] ?? 0);
        $activeCollabsCount = (int)(Database::queryOne("SELECT COUNT(*) as count FROM collaborations WHERE status IN ('ACTIVE', 'ACCEPTED', 'SUBMITTED', 'ESCROW_LOCKED')")['count'] ?? 0);
        $applicationsCount = (int)(Database::queryOne("SELECT COUNT(*) as count FROM campaign_applications")['count'] ?? 0);

        $totalReleased = (float)(Database::queryOne("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'RELEASED'")['total'] ?? 0);
        $totalEscrow = (float)(Database::queryOne("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status IN ('HELD_IN_ESCROW', 'ESCROW_LOCKED', 'PENDING')")['total'] ?? 0);

        // Fallback: If no payments in payments table, check collaborations proposed budget
        if ($totalEscrow <= 0) {
            $collabEscrow = (float)(Database::queryOne("SELECT COALESCE(SUM(proposed_budget), 0) as total FROM collaborations WHERE status IN ('ACTIVE', 'ESCROW_LOCKED', 'SUBMITTED')")['total'] ?? 0);
            $totalEscrow = $collabEscrow;
        }

        Response::json([
            'success' => true,
            'stats' => [
                'creators_count' => $creatorsCount,
                'brands_count' => $brandsCount,
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'campaigns_count' => $campaignsCount,
                'published_campaigns' => $publishedCampaigns,
                'active_collaborations' => $activeCollabsCount,
                'applications_count' => $applicationsCount,
                'total_creator_earned' => $totalReleased,
                'total_escrow_volume' => $totalEscrow,
                'total_platform_commission' => round($totalReleased * 0.05, 2)
            ]
        ]);
    }

    public static function users(): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($user);

        $users = Database::query(
            "SELECT u.id, u.email, u.role, u.is_active, u.is_verified, u.created_at,
                    COALESCE(NULLIF(cp.full_name, ''), NULLIF(bp.company_name, ''), NULLIF(cp.username, ''), CASE WHEN u.role = 'admin' THEN 'Platform Admin' ELSE u.email END) as display_name,
                    cp.username as creator_username,
                    cp.full_name as creator_name,
                    cp.avatar_url as creator_avatar,
                    cp.avatar_url,
                    bp.company_name as brand_name,
                    bp.logo_url as brand_logo,
                    bp.logo_url,
                    cp.id as creator_id,
                    bp.id as brand_id,
                    cp.city as creator_city,
                    bp.city as brand_city,
                    cp.subscription_tier,
                    COALESCE(cp.verified, 0) as creator_verified,
                    COALESCE(bp.verified, 1) as brand_verified,
                    (SELECT COALESCE(SUM(p.amount), 0) FROM payments p WHERE p.creator_id = cp.id AND p.status = 'RELEASED') as creator_earned,
                    (SELECT COALESCE(SUM(p.amount), 0) FROM payments p WHERE p.creator_id = cp.id AND p.status IN ('HELD_IN_ESCROW', 'ESCROW_LOCKED', 'PENDING')) as creator_escrow,
                    (SELECT COALESCE(SUM(p.amount), 0) FROM payments p WHERE p.brand_id = bp.id AND p.status = 'RELEASED') as brand_spent,
                    (SELECT COALESCE(SUM(p.amount), 0) FROM payments p WHERE p.brand_id = bp.id AND p.status IN ('HELD_IN_ESCROW', 'ESCROW_LOCKED', 'PENDING')) as brand_escrow,
                    (SELECT COUNT(*) FROM collaborations col WHERE col.creator_id = cp.id) as completed_deals,
                    (SELECT COUNT(*) FROM campaigns c WHERE c.brand_id = bp.id) as brand_campaigns
             FROM users u
             LEFT JOIN creator_profiles cp ON u.id = cp.user_id
             LEFT JOIN brand_profiles bp ON u.id = bp.user_id
             ORDER BY u.created_at DESC"
        );

        // Smart logo fallback for brands
        foreach ($users as &$u) {
            $u['creator_earned'] = (float)($u['creator_earned'] ?? 0);
            $u['creator_escrow'] = (float)($u['creator_escrow'] ?? 0);
            $u['brand_spent'] = (float)($u['brand_spent'] ?? 0);
            $u['brand_escrow'] = (float)($u['brand_escrow'] ?? 0);
            $u['completed_deals'] = (int)($u['completed_deals'] ?? 0);
            $u['brand_campaigns'] = (int)($u['brand_campaigns'] ?? 0);

            if ($u['role'] === 'brand') {
                require_once dirname(__DIR__) . '/utils/BrandHelper.php';
                $u['brand_logo'] = \CreatorHub\Utils\BrandHelper::resolveLogo($u['brand_name'] ?? '', $u['category'] ?? '', $u['email'] ?? '', $u['brand_logo'] ?? '');
            }
        }

        Response::json(['success' => true, 'users' => $users]);
    }

    public static function suspendUser(string $userId): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($user);

        $target = Database::queryOne("SELECT id, role, is_active FROM users WHERE id = ?", [$userId]);
        if (!$target) {
            Response::notFound('User not found.');
        }

        if ($target['id'] === $user['id']) {
            Response::error('You cannot suspend your own admin account.', 400);
        }

        $rawInput = json_decode(file_get_contents('php://input'), true) ?? [];
        if (isset($rawInput['is_active'])) {
            $newActive = (int)$rawInput['is_active'];
        } else {
            $newActive = (int)$target['is_active'] === 1 ? 0 : 1;
        }

        Database::execute("UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [$newActive, $userId]);

        try {
            $actionId = 'act_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 4);
            Database::execute(
                "INSERT INTO admin_actions (id, admin_user_id, action_type, target_type, target_id, details_json) VALUES (?, ?, ?, 'user', ?, ?)",
                [$actionId, $user['id'], $newActive ? 'ACTIVATE_USER' : 'SUSPEND_USER', $userId, json_encode(['is_active' => $newActive])]
            );
        } catch (\Throwable $e) {
            // non-fatal
        }

        Response::json([
            'success' => true,
            'message' => $newActive ? 'User account activated successfully.' : 'User account suspended successfully.',
            'is_active' => $newActive
        ]);
    }

    public static function verifyCreator(string $creatorId): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($user);

        Database::execute("UPDATE creator_profiles SET verified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [$creatorId]);
        Response::json(['success' => true, 'message' => 'Creator verified badge granted.']);
    }

    public static function campaigns(): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($user);

        $campaigns = Database::query(
            "SELECT c.*, b.company_name as brand_name, b.business_email, b.logo_url as brand_logo
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
        if (!in_array($status, ['DRAFT', 'PUBLISHED', 'PAUSED', 'COMPLETED', 'ARCHIVED'], true)) {
            Response::error('Invalid campaign status.', 400);
        }

        Database::execute("UPDATE campaigns SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [$status, $id]);

        try {
            $actionId = 'act_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 4);
            Database::execute(
                "INSERT INTO admin_actions (id, admin_user_id, action_type, target_type, target_id, details_json) VALUES (?, ?, ?, 'campaign', ?, ?)",
                [$actionId, $user['id'], $status === 'PAUSED' ? 'PAUSE_CAMPAIGN' : 'UPDATE_CAMPAIGN_STATUS', $id, json_encode(['status' => $status])]
            );
        } catch (\Throwable $e) {
            // non-fatal
        }

        Response::json(['success' => true, 'message' => "Campaign status updated to {$status}."]);
    }

    public static function payments(): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($user);

        $payments = Database::query(
            "SELECT p.*,
                    COALESCE(bp.company_name, 'Brand Partner') as brand_name,
                    COALESCE(cp.full_name, cp.username, 'Creator') as creator_name,
                    cp.username as creator_username,
                    c.title as campaign_title
             FROM payments p
             LEFT JOIN brand_profiles bp ON p.brand_id = bp.id
             LEFT JOIN creator_profiles cp ON p.creator_id = cp.id
             LEFT JOIN collaborations col ON p.collaboration_id = col.id
             LEFT JOIN campaigns c ON col.campaign_id = c.id
             ORDER BY p.created_at DESC"
        );

        Response::json(['success' => true, 'payments' => $payments]);
    }

    public static function applications(): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($user);

        $applications = Database::query(
            "SELECT a.*,
                    c.title as campaign_title,
                    c.category as campaign_category,
                    c.reward_per_creator,
                    bp.company_name as brand_name,
                    cp.full_name as creator_name,
                    cp.username as creator_username,
                    cp.avatar_url as creator_avatar,
                    cp.city as creator_city
             FROM campaign_applications a
             LEFT JOIN campaigns c ON a.campaign_id = c.id
             LEFT JOIN brand_profiles bp ON a.brand_id = bp.id OR c.brand_id = bp.id
             LEFT JOIN creator_profiles cp ON a.creator_id = cp.id
             ORDER BY a.applied_at DESC"
        );

        Response::json(['success' => true, 'applications' => $applications]);
    }
}
