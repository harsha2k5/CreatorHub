<?php
/**
 * CreatorHub PHP Backend - CreatorController
 */

namespace CreatorHub\Controllers;

use Database;
use AuthMiddleware;
use CreatorHub\Utils\Response;

class CreatorController {
    public static function index(): void {
        $limit = (int) ($_GET['limit'] ?? 50);
        $city = $_GET['city'] ?? null;
        $category = $_GET['category'] ?? null;
        $search = $_GET['search'] ?? null;

        $query = "SELECT c.*, u.email, ig.username as ig_username, ig.profile_picture_url,
                         COALESCE(im.followers_count, 14200) as followers_count,
                         COALESCE(im.engagement_rate, 3.8) as engagement_rate
                  FROM creator_profiles c 
                  JOIN users u ON c.user_id = u.id 
                  LEFT JOIN instagram_accounts ig ON c.id = ig.creator_id
                  LEFT JOIN instagram_metrics im ON ig.id = im.instagram_account_id
                  WHERE u.is_active = 1";
        $params = [];

        if (!empty($city)) {
            $query .= " AND c.city LIKE ?";
            $params[] = "%{$city}%";
        }

        if (!empty($category)) {
            $query .= " AND c.categories_json LIKE ?";
            $params[] = "%{$category}%";
        }

        if (!empty($search)) {
            $query .= " AND (c.full_name LIKE ? OR c.username LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $query .= " ORDER BY c.created_at DESC LIMIT ?";
        $params[] = $limit;

        $creators = Database::query($query, $params);
        Response::json(['success' => true, 'creators' => $creators]);
    }

    public static function show(string $id): void {
        $creator = Database::queryOne(
            "SELECT c.*, u.email, ig.username as ig_username, ig.profile_picture_url,
                    COALESCE(NULLIF(c.bio, ''), ig.biography, ig.bio, '') as bio,
                    COALESCE(im.followers_count, 14200) as followers_count,
                    COALESCE(im.engagement_rate, 3.8) as engagement_rate
             FROM creator_profiles c 
             JOIN users u ON c.user_id = u.id 
             LEFT JOIN instagram_accounts ig ON c.id = ig.creator_id
             LEFT JOIN instagram_metrics im ON ig.id = im.instagram_account_id
             WHERE c.id = ? OR c.username = ?",
            [$id, $id]
        );

        if (!$creator) {
            Response::notFound('Creator not found.');
        }

        Response::json(['success' => true, 'creator' => $creator]);
    }

    public static function me(): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireCreator($user);

        require_once dirname(__DIR__) . '/services/profileHelper.php';
        $creator = getOrCreateCreatorProfile($user['id'], $user);

        // Auto-heal bio from connected Instagram account if creator bio is empty
        if ($creator && empty(trim($creator['bio'] ?? ''))) {
            $ig = Database::queryOne("SELECT biography, bio FROM instagram_accounts WHERE creator_id = ?", [$creator['id']]);
            if ($ig && (!empty($ig['biography']) || !empty($ig['bio']))) {
                $igBio = !empty($ig['biography']) ? $ig['biography'] : $ig['bio'];
                $creator['bio'] = $igBio;
                Database::execute("UPDATE creator_profiles SET bio = ? WHERE id = ?", [$igBio, $creator['id']]);
            }
        }

        Response::json(['success' => true, 'creator' => $creator]);
    }

    public static function updateProfile(array $body): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireCreator($user);

        $fullName = trim($body['full_name'] ?? '');
        $bio = trim($body['bio'] ?? '');
        $city = trim($body['city'] ?? '');
        $minBudget = (float) ($body['min_budget'] ?? 3000);
        $categories = is_array($body['categories'] ?? null) ? json_encode($body['categories']) : null;

        Database::execute(
            "UPDATE creator_profiles
             SET full_name = COALESCE(NULLIF(?, ''), full_name),
                 bio = COALESCE(NULLIF(?, ''), bio),
                 city = COALESCE(NULLIF(?, ''), city),
                 min_budget = ?,
                 categories_json = COALESCE(?, categories_json),
                 updated_at = datetime('now')
             WHERE user_id = ?",
            [$fullName, $bio, $city, $minBudget, $categories, $user['id']]
        );

        $updated = Database::queryOne("SELECT * FROM creator_profiles WHERE user_id = ?", [$user['id']]);
        Response::json(['success' => true, 'profile' => $updated]);
    }

    public static function pitch(string $creatorId, array $body): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireBrand($user);

        $brand = Database::queryOne("SELECT * FROM brand_profiles WHERE user_id = ?", [$user['id']]);
        if (!$brand) {
            Response::forbidden('Brand profile not found.');
        }

        $creator = Database::queryOne("SELECT * FROM creator_profiles WHERE id = ? OR user_id = ?", [$creatorId, $creatorId]);
        if (!$creator) {
            Response::notFound('Creator not found.');
        }

        $pitchText = trim($body['pitch_text'] ?? $body['message'] ?? 'Brand collaboration offer');
        $proposedBudget = (float) ($body['proposed_budget'] ?? $body['budget'] ?? 5000);
        $deliverables = trim($body['deliverables'] ?? '1 Reel + 1 Story');
        $customTitle = trim($body['custom_title'] ?? $body['title'] ?? 'Custom Direct Collaboration');
        $campaignId = $body['campaign_id'] ?? null;

        // 1. Resolve or create campaign record
        $campaign = null;
        if ($campaignId) {
            $campaign = Database::queryOne('SELECT * FROM campaigns WHERE id = ?', [$campaignId]);
        }

        if (!$campaign) {
            $newCampId = 'cmp_pitch_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 4);
            Database::execute(
                "INSERT INTO campaigns (
                    id, brand_id, title, description, category, location_name,
                    city, deliverables_json, budget_total, reward_per_creator,
                    creators_required, creators_hired, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 'PUBLISHED')",
                [
                    $newCampId,
                    $brand['id'],
                    $customTitle,
                    $pitchText,
                    $brand['category'] ?: 'General',
                    $brand['location_name'] ?: ($brand['city'] ?: 'Direct Collaboration'),
                    $brand['city'] ?: 'Bengaluru',
                    json_encode([$deliverables]),
                    $proposedBudget,
                    $proposedBudget
                ]
            );
            $campaign = Database::queryOne('SELECT * FROM campaigns WHERE id = ?', [$newCampId]);
        }

        // 2. Record in campaign_applications as ACCEPTED
        $existingApp = Database::queryOne(
            'SELECT id, status FROM campaign_applications WHERE campaign_id = ? AND creator_id = ?',
            [$campaign['id'], $creator['id']]
        );
        $appId = $existingApp ? $existingApp['id'] : ('app_pitch_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 4));

        if (!$existingApp) {
            Database::execute(
                "INSERT INTO campaign_applications (
                    id, campaign_id, creator_id, brand_id, pitch,
                    proposed_budget, proposed_deliverables, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACCEPTED')",
                [
                    $appId,
                    $campaign['id'],
                    $creator['id'],
                    $brand['id'],
                    "Direct Brand Pitch: {$pitchText}",
                    $proposedBudget,
                    $deliverables
                ]
            );
        } else {
            Database::execute("UPDATE campaign_applications SET status = 'ACCEPTED' WHERE id = ?", [$appId]);
        }

        // 3. Initialize collaboration
        $existingCollab = Database::queryOne(
            'SELECT id FROM collaborations WHERE application_id = ? OR (campaign_id = ? AND creator_id = ?)',
            [$appId, $campaign['id'], $creator['id']]
        );
        $collabId = $existingCollab ? $existingCollab['id'] : ('collab_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 4));

        if (!$existingCollab) {
            Database::execute(
                "INSERT INTO collaborations (id, campaign_id, application_id, brand_id, creator_id, status, current_step)
                 VALUES (?, ?, ?, ?, ?, 'ACTIVE', 1)",
                [$collabId, $campaign['id'], $appId, $brand['id'], $creator['id']]
            );

            Database::execute(
                "INSERT INTO payments (id, collaboration_id, brand_id, creator_id, amount, status, is_simulated, transaction_ref)
                 VALUES (?, ?, ?, ?, ?, 'PENDING', 0, ?)",
                ['pay_' . round(microtime(true) * 1000) . '_' . bin2hex(random_bytes(2)), $collabId, $brand['id'], $creator['id'], $proposedBudget, 'TXN_ESCROW_' . time()]
            );
        }

        // 4. Create or update conversation
        $conv = Database::queryOne('SELECT id FROM conversations WHERE brand_id = ? AND creator_id = ?', [$brand['id'], $creator['id']]);
        $convId = $conv ? $conv['id'] : ('conv_' . round(microtime(true) * 1000));
        $snippet = strlen($pitchText) > 80 ? substr($pitchText, 0, 77) . '...' : $pitchText;

        if (!$conv) {
            Database::execute(
                'INSERT INTO conversations (id, brand_id, creator_id, campaign_id, last_message) VALUES (?, ?, ?, ?, ?)',
                [$convId, $brand['id'], $creator['id'], $campaign['id'], "Direct Pitch: {$snippet}"]
            );
        } else {
            Database::execute(
                'UPDATE conversations SET last_message = ?, campaign_id = COALESCE(?, campaign_id), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                ["Direct Pitch: {$snippet}", $campaign['id'], $convId]
            );
        }

        $msgText = "🎯 DIRECT COLLABORATION PITCH\nBrand: {$brand['company_name']}\nProject: {$customTitle}\nOffer: ₹" . number_format($proposedBudget) . "\nDeliverables: {$deliverables}\n\nNote: {$pitchText}";
        Database::execute(
            'INSERT INTO messages (id, conversation_id, sender_id, text) VALUES (?, ?, ?, ?)',
            ['msg_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(2)), 0, 4), $convId, $user['id'], $msgText]
        );

        // 5. Notify creator
        Database::execute(
            'INSERT INTO notifications (id, user_id, title, message, link) VALUES (?, ?, ?, ?, ?)',
            [
                'notif_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(2)), 0, 4),
                $creator['user_id'],
                "🎯 Direct Collaboration Offer from {$brand['company_name']}!",
                "Offer: ₹" . number_format($proposedBudget) . " for \"{$customTitle}\" ({$deliverables}). Review in Applications!",
                "/creator/dashboard?tab=applications"
            ]
        );

        Response::json([
            'success' => true,
            'message' => 'Direct pitch invitation sent to creator successfully.',
            'pitch_id' => $appId,
            'collaboration_id' => $collabId,
            'campaign_id' => $campaign['id']
        ]);
    }
}
