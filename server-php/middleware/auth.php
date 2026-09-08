<?php
/**
 * CreatorHub PHP Backend - Authentication & Role Authorization Middleware
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/services/JWTService.php';

class AuthMiddleware {
    public static function getBearerToken(): ?string {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        
        if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        }

        if (!$authHeader) {
            return null;
        }

        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }

        return null;
    }

    public static function authenticate(): ?array {
        $token = self::getBearerToken();
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication token required.']);
            exit;
        }

        $config = require dirname(__DIR__) . '/config/config.php';
        $payload = JWTService::verify($token, $config['jwt_secret']);

        if (!$payload || empty($payload['id'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Invalid or expired authentication token.']);
            exit;
        }

        $user = Database::queryOne(
            "SELECT id, email, role, is_active, is_verified FROM users WHERE id = ?",
            [$payload['id']]
        );

        if (!$user) {
            http_response_code(403);
            echo json_encode(['error' => 'User account not found.']);
            exit;
        }

        if (empty($user['is_active'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Account has been deactivated. Contact support.']);
            exit;
        }

        // Attach profile if available
        if ($user['role'] === 'creator') {
            $user['profile'] = Database::queryOne("SELECT * FROM creator_profiles WHERE user_id = ?", [$user['id']]);
        } elseif ($user['role'] === 'brand') {
            $user['profile'] = Database::queryOne("SELECT * FROM brand_profiles WHERE user_id = ?", [$user['id']]);
        }

        return $user;
    }

    public static function requireRole(array $user, string $role): void {
        if ($user['role'] !== $role && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => "Access denied. {$role} role required."]);
            exit;
        }
    }

    public static function requireCreator(array $user): void {
        self::requireRole($user, 'creator');
    }

    public static function requireBrand(array $user): void {
        self::requireRole($user, 'brand');
    }

    public static function requireAdmin(array $user): void {
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Admin authorization required.']);
            exit;
        }
    }
}
