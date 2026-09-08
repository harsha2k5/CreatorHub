<?php
/**
 * CreatorHub PHP Backend - Profile Helper Service
 */

require_once dirname(__DIR__) . '/config/database.php';

function getOrCreateCreatorProfile(?string $userId, ?array $fallbackUser = null): ?array {
    if (!$userId) return null;

    $creator = Database::queryOne('SELECT * FROM creator_profiles WHERE user_id = ?', [$userId]);
    if ($creator) return $creator;

    $user = Database::queryOne('SELECT id, email, role FROM users WHERE id = ?', [$userId]);
    if (!$user && $fallbackUser && isset($fallbackUser['id']) && $fallbackUser['id'] === $userId) {
        try {
            $fallbackEmail = $fallbackUser['email'] ?? "user_" . substr($userId, 0, 8) . "@creatorhub.local";
            $fallbackRole = $fallbackUser['role'] ?? 'creator';
            Database::execute(
                "INSERT OR IGNORE INTO users (id, email, password_hash, role, is_verified, is_active)
                 VALUES (?, ?, 'oauth_or_session_hash', ?, 1, 1)",
                [$userId, $fallbackEmail, $fallbackRole]
            );
            $user = Database::queryOne('SELECT id, email, role FROM users WHERE id = ?', [$userId]);
        } catch (\Throwable $e) {
            error_log('[AutoHeal] Could not insert fallback user: ' . $e->getMessage());
        }
    }

    if (!$user) {
        try {
            $fallbackEmail = "creator_" . substr($userId, 0, 8) . "@creatorhub.local";
            Database::execute(
                "INSERT OR IGNORE INTO users (id, email, password_hash, role, is_verified, is_active)
                 VALUES (?, ?, 'placeholder_hash', 'creator', 1, 1)",
                [$userId, $fallbackEmail]
            );
            $user = Database::queryOne('SELECT id, email, role FROM users WHERE id = ?', [$userId]);
        } catch (\Throwable $e) {
            error_log('[AutoHeal] Last resort user insertion error: ' . $e->getMessage());
        }
    }

    if (!$user) return null;

    $creatorId = 'crt_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(4)), 0, 5);
    $parts = explode('@', $user['email']);
    $emailPrefix = preg_replace('/[^a-zA-Z0-9_.]/', '_', strtolower($parts[0] ?: 'creator'));
    $finalUsername = $emailPrefix;
    $counter = 1;

    while (Database::queryOne('SELECT id FROM creator_profiles WHERE username = ?', [$finalUsername])) {
        $finalUsername = "{$emailPrefix}_{$counter}";
        $counter++;
    }

    try {
        Database::execute(
            "INSERT INTO creator_profiles (
                id, user_id, full_name, username, phone, city, area,
                lat, lng, bio, avatar_url, categories_json, languages_json,
                min_budget, radius_km
            ) VALUES (?, ?, ?, ?, '', 'Bengaluru', 'Central', 12.9716, 77.5946, 'Content creator on CreatorHub', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300', '[\"Lifestyle\"]', '[\"English\"]', 3000, 15.0)",
            [$creatorId, $user['id'], $parts[0], $finalUsername]
        );

        return Database::queryOne('SELECT * FROM creator_profiles WHERE id = ?', [$creatorId]);
    } catch (\Throwable $e) {
        error_log('[AutoHeal] Error auto-creating creator profile: ' . $e->getMessage());
        return Database::queryOne('SELECT * FROM creator_profiles WHERE user_id = ?', [$userId]);
    }
}
