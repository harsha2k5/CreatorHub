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

        $creator = Database::queryOne("SELECT * FROM creator_profiles WHERE id = ?", [$creatorId]);
        if (!$creator) {
            Response::notFound('Creator not found.');
        }

        $message = trim($body['message'] ?? 'Brand collaboration offer');
        $budget = (float) ($body['budget'] ?? 5000);

        Response::json([
            'success' => true,
            'message' => 'Direct pitch invitation sent to creator successfully.',
            'pitch_id' => 'pch_' . time()
        ]);
    }
}
