<?php
/**
 * CreatorHub PHP Backend - AuthController
 */

namespace CreatorHub\Controllers;

use Database;
use JWTService;
use CreatorHub\Utils\Response;
use CreatorHub\Models\User;
use AuthMiddleware;

class AuthController {
    public static function register(array $body): void {
        $config = require dirname(__DIR__) . '/config/config.php';
        $email = strtolower(trim($body['email'] ?? ''));
        $password = $body['password'] ?? '';
        $role = strtolower(trim($body['role'] ?? 'creator'));
        $name = trim($body['name'] ?? '');

        if (empty($email) || empty($password)) {
            Response::error('Email and password are required.', 400);
        }

        if (!in_array($role, ['creator', 'brand'], true)) {
            $role = 'creator';
        }

        $existing = User::findByEmail($email);
        if ($existing) {
            Response::error('An account with this email address already exists.', 409);
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
            $companyName = $name ?: 'Brand Partner';
            $category = $body['category'] ?? 'Lifestyle';
            $city = $body['city'] ?? 'Bengaluru';
            $phone = $body['phone'] ?? '';
            $website = $body['website'] ?? '';
            $locationName = $body['location_name'] ?? ($body['area'] ?? '');
            $address = $body['address'] ?? '';
            $lat = (float)($body['lat'] ?? 12.9716);
            $lng = (float)($body['lng'] ?? 77.5946);
            $logoUrl = $body['logo_url'] ?? 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200';
            $description = $body['description'] ?? '';

            Database::execute(
                "INSERT INTO brand_profiles (
                    id, user_id, company_name, business_email, phone, category,
                    website, location_name, address, city, lat, lng, logo_url, description
                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $brandId, $userId, $companyName, $email, $phone, $category,
                    $website, $locationName, $address, $city, $lat, $lng, $logoUrl, $description
                ]
            );
        }

        $user = Database::queryOne("SELECT id, email, role, is_active, is_verified FROM users WHERE id = ?", [$userId]);
        $token = JWTService::sign(['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role']], $config['jwt_secret']);

        Response::json([
            'success' => true,
            'token' => $token,
            'user' => $user
        ], 201);
    }

    public static function login(array $body): void {
        $config = require dirname(__DIR__) . '/config/config.php';
        $email = strtolower(trim($body['email'] ?? ''));
        $password = $body['password'] ?? '';

        if (empty($email) || empty($password)) {
            Response::error('Email and password are required.', 400);
        }

        $user = Database::queryOne("SELECT * FROM users WHERE email = ?", [$email]);
        if (!$user) {
            Response::unauthorized('Invalid email or password.');
        }

        if (!password_verify($password, $user['password_hash']) && $user['password_hash'] !== $password) {
            Response::unauthorized('Invalid email or password.');
        }

        if (isset($user['is_active']) && (int)$user['is_active'] === 0) {
            Response::forbidden('Account has been suspended. Please contact support.');
        }

        $token = JWTService::sign(['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role']], $config['jwt_secret']);
        unset($user['password_hash']);

        if ($user['role'] === 'creator') {
            $user['profile'] = Database::queryOne("SELECT * FROM creator_profiles WHERE user_id = ?", [$user['id']]);
        } elseif ($user['role'] === 'brand') {
            $user['profile'] = Database::queryOne("SELECT * FROM brand_profiles WHERE user_id = ?", [$user['id']]);
        }

        Response::json([
            'success' => true,
            'token' => $token,
            'user' => $user
        ]);
    }

    public static function me(): void {
        $user = AuthMiddleware::authenticate();
        Response::json([
            'success' => true,
            'user' => $user
        ]);
    }

    public static function logout(): void {
        Response::json([
            'success' => true,
            'message' => 'Logged out successfully.'
        ]);
    }

    public static function changePassword(array $body): void {
        $user = AuthMiddleware::authenticate();
        $currentPassword = $body['current_password'] ?? '';
        $newPassword = $body['new_password'] ?? '';

        if (empty($currentPassword) || empty($newPassword)) {
            Response::error('Current password and new password are required.', 400);
        }

        $dbUser = Database::queryOne("SELECT password_hash FROM users WHERE id = ?", [$user['id']]);
        if (!$dbUser || !password_verify($currentPassword, $dbUser['password_hash'])) {
            Response::error('Current password is incorrect.', 400);
        }

        User::updatePassword($user['id'], $newPassword);
        Response::json([
            'success' => true,
            'message' => 'Password updated successfully.'
        ]);
    }
}
