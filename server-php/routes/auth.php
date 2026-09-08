<?php
/**
 * CreatorHub PHP Backend - Authentication Routes
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/services/JWTService.php';
require_once dirname(__DIR__) . '/services/profileHelper.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

function handleAuthRoute(string $action, string $method, array $body) {
    $config = require dirname(__DIR__) . '/config/config.php';

    if ($action === 'register' && $method === 'POST') {
        $email = strtolower(trim($body['email'] ?? ''));
        $password = $body['password'] ?? '';
        $role = strtolower(trim($body['role'] ?? 'creator'));
        $name = trim($body['name'] ?? '');

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required.']);
            return;
        }

        if (!in_array($role, ['creator', 'brand'])) {
            $role = 'creator';
        }

        $existing = Database::queryOne("SELECT id FROM users WHERE email = ?", [$email]);
        if ($existing) {
            http_response_code(409);
            echo json_encode(['error' => 'An account with this email address already exists.']);
            return;
        }

        $userId = 'usr_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        Database::execute(
            "INSERT INTO users (id, email, password_hash, role, is_verified, is_active) VALUES (?, ?, ?, ?, 1, 1)",
            [$userId, $email, $passwordHash, $role]
        );

        if ($role === 'creator') {
            $creatorId = 'crt_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);
            $username = preg_replace('/[^a-zA-Z0-9_]/', '', strtolower(explode('@', $email)[0])) ?: 'creator';
            Database::execute(
                "INSERT INTO creator_profiles (id, user_id, full_name, username, city, bio) VALUES (?, ?, ?, ?, 'Bengaluru', 'New Creator on CreatorHub')",
                [$creatorId, $userId, $name ?: $username, $username]
            );
        } else {
            $brandId = 'brd_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);
            Database::execute(
                "INSERT INTO brand_profiles (id, user_id, company_name, business_email) VALUES (?, ?, ?, ?)",
                [$brandId, $userId, $name ?: 'Brand Partner', $email]
            );
        }

        $user = Database::queryOne("SELECT id, email, role, is_active, is_verified FROM users WHERE id = ?", [$userId]);
        $token = JWTService::sign(['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role']], $config['jwt_secret']);

        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => $user
        ]);
        return;
    }

    if ($action === 'login' && $method === 'POST') {
        $email = strtolower(trim($body['email'] ?? ''));
        $password = $body['password'] ?? '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required.']);
            return;
        }

        $user = Database::queryOne("SELECT * FROM users WHERE email = ?", [$email]);
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password.']);
            return;
        }

        // Support bcrypt password verification
        if (!password_verify($password, $user['password_hash'])) {
            // Also check plain fallback for dev seed
            if ($user['password_hash'] !== $password) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid email or password.']);
                return;
            }
        }

        $token = JWTService::sign(['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role']], $config['jwt_secret']);
        unset($user['password_hash']);

        if ($user['role'] === 'creator') {
            $user['profile'] = Database::queryOne("SELECT * FROM creator_profiles WHERE user_id = ?", [$user['id']]);
        } elseif ($user['role'] === 'brand') {
            $user['profile'] = Database::queryOne("SELECT * FROM brand_profiles WHERE user_id = ?", [$user['id']]);
        }

        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => $user
        ]);
        return;
    }

    if ($action === 'me' && $method === 'GET') {
        $user = AuthMiddleware::authenticate();
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
        return;
    }

    if ($action === 'logout' && $method === 'POST') {
        echo json_encode(['success' => true, 'message' => 'Logged out successfully.']);
        return;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Auth endpoint not found.']);
}
