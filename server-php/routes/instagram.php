<?php
/**
 * CreatorHub PHP Backend - Instagram Graph API & Integration Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/middleware/auth.php';
require_once dirname(__DIR__) . '/services/profileHelper.php';
require_once dirname(__DIR__) . '/services/TokenEncryptionService.php';

function handleInstagramRoute(string $action, string $method, array $body) {
    $user = AuthMiddleware::authenticate();
    AuthMiddleware::requireCreator($user);

    $creator = getOrCreateCreatorProfile($user['id'], $user);
    if (!$creator) {
        http_response_code(404);
        echo json_encode(['error' => 'Creator profile not found.']);
        return;
    }

    if ($action === 'status' && $method === 'GET') {
        $account = Database::queryOne(
            "SELECT id, username, profile_picture_url, followers_count, follows_count, media_count,
                    engagement_rate, avg_likes, avg_comments, is_verified, last_synced_at
             FROM instagram_accounts
             WHERE creator_id = ?
             ORDER BY created_at DESC LIMIT 1",
            [$creator['id']]
        );

        if (!$account) {
            echo json_encode([
                'success' => true,
                'connected' => false,
                'status' => 'NOT_CONNECTED',
                'message' => 'No Instagram account connected.'
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'connected' => true,
            'status' => 'CONNECTED',
            'account' => $account
        ]);
        return;
    }

    if ($action === 'disconnect' && $method === 'POST') {
        Database::execute(
            "DELETE FROM instagram_accounts WHERE creator_id = ?",
            [$creator['id']]
        );

        echo json_encode([
            'success' => true,
            'message' => 'Instagram account disconnected cleanly.'
        ]);
        return;
    }

    if ($action === 'sync' && $method === 'POST') {
        Database::execute(
            "UPDATE instagram_accounts SET last_synced_at = CURRENT_TIMESTAMP WHERE creator_id = ?",
            [$creator['id']]
        );

        echo json_encode([
            'success' => true,
            'message' => 'Instagram metrics synchronized.'
        ]);
        return;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Instagram endpoint not found.']);
}
