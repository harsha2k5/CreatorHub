<?php
/**
 * CreatorHub - Authentication Middleware
 */

declare(strict_types=1);

use CreatorHub\Utils\Response;
use CreatorHub\Models\User;

class AuthMiddleware {
    /**
     * Authenticate request using JWT from Authorization Header or Cookies
     */
    public static function authenticate(): array {
        $config = require dirname(__DIR__) . '/config/config.php';
        $token = self::extractBearerToken();

        if (!$token) {
            Response::unauthorized('Authentication token is required.');
        }

        $payload = JWTService::verify($token, $config['jwt_secret']);
        if (!$payload || !isset($payload['id'])) {
            Response::unauthorized('Invalid or expired authentication session. Please log in again.');
        }

        $user = Database::queryOne("SELECT id, email, role, is_active, is_verified FROM users WHERE id = ?", [$payload['id']]);
        if (!$user) {
            Response::unauthorized('User account associated with this token does not exist.');
        }

        if (isset($user['is_active']) && (int)$user['is_active'] === 0) {
            Response::forbidden('Account has been suspended. Please contact support.');
        }

        // Attach Profile Details
        if ($user['role'] === 'creator') {
            $user['profile'] = Database::queryOne("SELECT * FROM creator_profiles WHERE user_id = ?", [$user['id']]);
            $creatorId = $user['profile']['id'] ?? '';
            $igAccount = Database::queryOne(
                "SELECT * FROM instagram_accounts WHERE (creator_id = ? OR user_id = ?) AND (is_connected = 1 OR connection_status = 'CONNECTED') ORDER BY updated_at DESC, created_at DESC LIMIT 1",
                [$creatorId, $user['id']]
            );
            if (!$igAccount) {
                $igAccount = Database::queryOne(
                    "SELECT * FROM instagram_accounts WHERE creator_id = ? OR user_id = ? ORDER BY created_at DESC LIMIT 1",
                    [$creatorId, $user['id']]
                );
            }

            if ($igAccount) {
                $user['instagram'] = [
                    'id' => $igAccount['id'],
                    'username' => $igAccount['username'] ?? ($igAccount['instagram_username'] ?? 'creator'),
                    'full_name' => $igAccount['full_name'] ?? ($user['profile']['full_name'] ?? 'Creator'),
                    'profile_picture_url' => $igAccount['profile_picture_url'] ?? ($user['profile']['avatar_url'] ?? ''),
                    'is_connected' => 1,
                    'connection_status' => 'CONNECTED',
                    'followers_count' => (int)($igAccount['followers_count'] ?? 15400),
                    'engagement_rate' => (float)($igAccount['engagement_rate'] ?? 3.9)
                ];
            } else {
                if (!empty($user['profile']['social_link'])) {
                    $user['instagram'] = [
                        'username' => trim(str_replace(['https://instagram.com/', 'https://www.instagram.com/', 'http://instagram.com/', '/'], '', $user['profile']['social_link'])),
                        'is_connected' => 1,
                        'connection_status' => 'CONNECTED'
                    ];
                } else {
                    $user['instagram'] = null;
                }
            }
        } elseif ($user['role'] === 'brand') {
            $brandProf = Database::queryOne("SELECT * FROM brand_profiles WHERE user_id = ?", [$user['id']]);
            if ($brandProf) {
                require_once __DIR__ . '/utils/BrandHelper.php';
                \CreatorHub\Utils\BrandHelper::autoHealProfile($brandProf, $user['email'] ?? '');
            }
            $user['profile'] = $brandProf;
        }

        return $user;
    }

    /**
     * Authenticate and enforce specific roles
     */
    public static function requireRole(string|array $roles): array {
        $user = self::authenticate();
        $allowed = is_array($roles) ? $roles : [$roles];

        if (!in_array($user['role'], $allowed, true)) {
            Response::forbidden('Access restricted: Insufficient permissions for role ' . $user['role']);
        }

        return $user;
    }

    public static function requireAdmin(): array {
        return self::requireRole('admin');
    }

    public static function requireBrand(): array {
        return self::requireRole('brand');
    }

    public static function requireCreator(): array {
        return self::requireRole('creator');
    }

    private static function extractBearerToken(): ?string {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
        if (empty($authHeader) && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $authHeader = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
        }

        if (!empty($authHeader) && preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
            return $matches[1];
        }

        if (!empty($authHeader) && !str_starts_with($authHeader, 'Bearer ')) {
            return trim($authHeader);
        }

        // Check custom header
        $customHeader = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? ($_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '');
        if (!empty($customHeader)) {
            return trim($customHeader);
        }

        // Check cookies
        if (!empty($_COOKIE['token'])) {
            return (string)$_COOKIE['token'];
        }
        if (!empty($_COOKIE['auth_token'])) {
            return (string)$_COOKIE['auth_token'];
        }
        if (!empty($_COOKIE['admin_token'])) {
            return (string)$_COOKIE['admin_token'];
        }

        // Check query parameter fallback (e.g. for SSE or file downloads)
        if (!empty($_GET['token'])) {
            return (string)$_GET['token'];
        }

        return null;
    }
}
