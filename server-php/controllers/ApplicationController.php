<?php
/**
 * CreatorHub PHP Backend - ApplicationController
 */

namespace CreatorHub\Controllers;

use Database;
use AuthMiddleware;
use CreatorHub\Utils\Response;

class ApplicationController {
    public static function index(): void {
        $user = AuthMiddleware::authenticate();

        if ($user['role'] === 'creator') {
            $creator = Database::queryOne("SELECT id FROM creator_profiles WHERE user_id = ?", [$user['id']]);
            $creatorId = $creator ? $creator['id'] : '';
            $apps = Database::query(
                "SELECT a.*, c.title as campaign_title, c.reward_per_creator, b.company_name as brand_name,
                        col.id as collaboration_id, col.status as collaboration_status
                 FROM campaign_applications a
                 JOIN campaigns c ON a.campaign_id = c.id
                 JOIN brand_profiles b ON c.brand_id = b.id
                 LEFT JOIN collaborations col ON col.application_id = a.id
                 WHERE a.creator_id = ?
                 ORDER BY a.applied_at DESC",
                [$creatorId]
            );
        } else {
            $brand = Database::queryOne("SELECT id FROM brand_profiles WHERE user_id = ?", [$user['id']]);
            $brandId = $brand ? $brand['id'] : '';
            $apps = Database::query(
                "SELECT a.*, c.title as campaign_title, cr.full_name as creator_name, cr.username as creator_username,
                        cr.avatar_url as creator_avatar, cr.city as creator_city,
                        col.id as collaboration_id, col.status as collaboration_status
                 FROM campaign_applications a
                 JOIN campaigns c ON a.campaign_id = c.id
                 JOIN creator_profiles cr ON a.creator_id = cr.id
                 LEFT JOIN collaborations col ON col.application_id = a.id
                 WHERE c.brand_id = ?
                 ORDER BY a.applied_at DESC",
                [$brandId]
            );
        }

        Response::json(['success' => true, 'applications' => $apps]);
    }

    public static function apply(array $body): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireCreator($user);

        $campaignId = $body['campaign_id'] ?? '';
        $pitch = trim($body['pitch'] ?? '');
        $proposedFee = (float) ($body['proposed_fee'] ?? $body['proposed_budget'] ?? 0);
        $portfolioLinks = $body['portfolio_links'] ?? $body['sample_links'] ?? '[]';
        if (is_array($portfolioLinks)) {
            $portfolioLinks = json_encode($portfolioLinks);
        }

        if (empty($campaignId)) {
            Response::error('campaign_id is required.', 400);
        }

        require_once dirname(__DIR__) . '/services/profileHelper.php';
        $creator = getOrCreateCreatorProfile($user['id'], $user);
        if (!$creator) {
            Response::notFound('Creator profile not found.');
        }

        $existing = Database::queryOne(
            "SELECT id FROM campaign_applications WHERE campaign_id = ? AND creator_id = ?",
            [$campaignId, $creator['id']]
        );
        if ($existing) {
            Response::error('You have already applied to this campaign brief.', 409);
        }

        $campaign = Database::queryOne("SELECT brand_id FROM campaigns WHERE id = ?", [$campaignId]);
        $brandId = $campaign ? $campaign['brand_id'] : null;

        $appId = 'app_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);
        Database::execute(
            "INSERT INTO campaign_applications (
                id, campaign_id, brand_id, creator_id, pitch, proposed_budget, sample_links, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')",
            [$appId, $campaignId, $brandId, $creator['id'], $pitch, $proposedFee, $portfolioLinks]
        );

        $created = Database::queryOne("SELECT * FROM campaign_applications WHERE id = ?", [$appId]);
        Response::json(['success' => true, 'application' => $created], 201);
    }

    public static function updateStatus(string $appId, string $newStatus): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireBrand($user);

        $newStatus = strtoupper(trim($newStatus));
        if (!in_array($newStatus, ['ACCEPTED', 'SHORTLISTED', 'REJECTED'], true)) {
            Response::error('Status must be ACCEPTED, SHORTLISTED, or REJECTED.', 400);
        }

        $app = Database::queryOne(
            "SELECT a.*, c.brand_id, c.title as campaign_title, c.reward_per_creator
             FROM campaign_applications a
             JOIN campaigns c ON a.campaign_id = c.id
             WHERE a.id = ?",
            [$appId]
        );

        if (!$app) {
            Response::notFound('Application not found.');
        }

        $createdCollabId = null;

        Database::transaction(function() use ($appId, $newStatus, $app, &$createdCollabId) {
            Database::execute(
                "UPDATE campaign_applications SET status = ?, updated_at = datetime('now') WHERE id = ?",
                [$newStatus, $appId]
            );

            if ($newStatus === 'ACCEPTED') {
                $createdCollabId = 'collab_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);
                $reward = ($app['proposed_budget'] ?? 0) > 0 ? $app['proposed_budget'] : ($app['reward_per_creator'] ?: 5000);

                Database::execute(
                    "INSERT INTO collaborations (
                        id, campaign_id, brand_id, creator_id, application_id,
                        status, current_step
                    ) VALUES (?, ?, ?, ?, ?, 'ACCEPTED', 1)",
                    [$createdCollabId, $app['campaign_id'], $app['brand_id'], $app['creator_id'], $appId]
                );

                $payId = 'pay_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);
                Database::execute(
                    "INSERT INTO payments (id, collaboration_id, brand_id, creator_id, amount, currency, payment_type, status, is_simulated, transaction_ref)
                     VALUES (?, ?, ?, ?, ?, 'INR', 'Escrow Lock', 'PENDING', 0, ?)",
                    [$payId, $createdCollabId, $app['brand_id'], $app['creator_id'], $reward, 'TXN_PENDING_' . time()]
                );
            }
        });

        Response::json([
            'success' => true,
            'message' => "Application {$newStatus} successfully.",
            'collaboration_id' => $createdCollabId
        ]);
    }
}
