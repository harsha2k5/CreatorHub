<?php
/**
 * CreatorHub PHP Backend - Applications Route
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/middleware/auth.php';
require_once dirname(__DIR__) . '/services/profileHelper.php';

function handleApplicationsRoute(array $segments, string $method, array $body) {
    $user = AuthMiddleware::authenticate();

    // GET /api/applications
    if (empty($segments) && $method === 'GET') {
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

        echo json_encode(['success' => true, 'applications' => $apps]);
        return;
    }

    // POST /api/applications/apply
    if ((empty($segments) || $segments[0] === 'apply') && $method === 'POST') {
        AuthMiddleware::requireCreator($user);

        $campaignId = $body['campaign_id'] ?? '';
        $pitch = trim($body['pitch'] ?? '');
        $proposedFee = (float) ($body['proposed_fee'] ?? 0);
        $portfolioLinks = $body['portfolio_links'] ?? '[]';
        if (is_array($portfolioLinks)) $portfolioLinks = json_encode($portfolioLinks);

        if (empty($campaignId)) {
            http_response_code(400);
            echo json_encode(['error' => 'campaign_id is required.']);
            return;
        }

        $creator = getOrCreateCreatorProfile($user['id'], $user);
        if (!$creator) {
            http_response_code(404);
            echo json_encode(['error' => 'Creator profile not found.']);
            return;
        }

        // Check duplicate application
        $existing = Database::queryOne(
            "SELECT id FROM campaign_applications WHERE campaign_id = ? AND creator_id = ?",
            [$campaignId, $creator['id']]
        );
        if ($existing) {
            http_response_code(409);
            echo json_encode(['error' => 'You have already applied to this campaign brief.']);
            return;
        }

        $appId = 'app_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);
        Database::execute(
            "INSERT INTO campaign_applications (id, campaign_id, creator_id, pitch, proposed_fee, portfolio_links, status)
             VALUES (?, ?, ?, ?, ?, ?, 'APPLIED')",
            [$appId, $campaignId, $creator['id'], $pitch, $proposedFee, $portfolioLinks]
        );

        $created = Database::queryOne("SELECT * FROM campaign_applications WHERE id = ?", [$appId]);
        http_response_code(201);
        echo json_encode(['success' => true, 'application' => $created]);
        return;
    }

    // PATCH /api/applications/:id/status
    $appId = $segments[0] ?? null;
    $subAction = $segments[1] ?? null;

    if ($appId && $subAction === 'status' && ($method === 'PATCH' || $method === 'POST')) {
        AuthMiddleware::requireBrand($user);

        $newStatus = strtoupper(trim($body['status'] ?? ''));
        if (!in_array($newStatus, ['ACCEPTED', 'REJECTED'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Status must be ACCEPTED or REJECTED.']);
            return;
        }

        $app = Database::queryOne(
            "SELECT a.*, c.brand_id, c.title as campaign_title, c.reward_per_creator
             FROM campaign_applications a
             JOIN campaigns c ON a.campaign_id = c.id
             WHERE a.id = ?",
            [$appId]
        );

        if (!$app) {
            http_response_code(404);
            echo json_encode(['error' => 'Application not found.']);
            return;
        }

        Database::transaction(function() use ($appId, $newStatus, $app) {
            Database::execute(
                "UPDATE campaign_applications SET status = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?",
                [$newStatus, $appId]
            );

            if ($newStatus === 'ACCEPTED') {
                $collabId = 'collab_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);
                $reward = $app['proposed_fee'] > 0 ? $app['proposed_fee'] : ($app['reward_per_creator'] ?: 5000);

                Database::execute(
                    "INSERT INTO collaborations (
                        id, campaign_id, brand_id, creator_id, application_id,
                        status, current_step, payment_amount, agreed_reward
                    ) VALUES (?, ?, ?, ?, ?, 'ACCEPTED', 1, ?, ?)",
                    [$collabId, $app['campaign_id'], $app['brand_id'], $app['creator_id'], $appId, $reward, $reward]
                );
            }
        });

        echo json_encode(['success' => true, 'message' => "Application {$newStatus} successfully."]);
        return;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Application endpoint not found.']);
}
