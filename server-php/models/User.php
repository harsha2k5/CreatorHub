<?php
/**
 * CreatorHub PHP Backend - User Model
 */

namespace CreatorHub\Models;

use Database;

class User {
    public static function findById(string $id): ?array {
        return Database::queryOne("SELECT * FROM users WHERE id = ?", [$id]);
    }

    public static function findByEmail(string $email): ?array {
        return Database::queryOne("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", [trim($email)]);
    }

    public static function create(array $data): array {
        $id = $data['id'] ?? ('usr_' . time() . '_' . bin2hex(random_bytes(3)));
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);
        $role = $data['role'] ?? 'creator';

        Database::execute(
            "INSERT INTO users (id, email, password_hash, role, is_active, created_at, updated_at) 
             VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))",
            [$id, strtolower(trim($data['email'])), $passwordHash, $role]
        );

        return self::findById($id);
    }

    public static function verifyPassword(string $password, string $hash): bool {
        return password_verify($password, $hash);
    }

    public static function updatePassword(string $userId, string $newPassword): bool {
        $hash = password_hash($newPassword, PASSWORD_BCRYPT);
        return Database::execute(
            "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?",
            [$hash, $userId]
        ) > 0;
    }

    public static function updateStatus(string $userId, int $isActive): bool {
        return Database::execute(
            "UPDATE users SET is_active = ?, updated_at = datetime('now') WHERE id = ?",
            [$isActive, $userId]
        ) > 0;
    }

    public static function getAll(): array {
        return Database::query("SELECT id, email, role, is_active, created_at FROM users ORDER BY created_at DESC");
    }
}
