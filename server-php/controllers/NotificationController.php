<?php
/**
 * CreatorHub PHP Backend - NotificationController
 */

namespace CreatorHub\Controllers;

use Database;
use AuthMiddleware;
use CreatorHub\Utils\Response;

class NotificationController {
    public static function index(): void {
        $user = AuthMiddleware::authenticate();

        $notifications = Database::query(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
            [$user['id']]
        );

        Response::json(['success' => true, 'notifications' => $notifications]);
    }

    public static function markAllRead(): void {
        $user = AuthMiddleware::authenticate();

        Database::execute(
            "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
            [$user['id']]
        );

        Response::json(['success' => true, 'message' => 'All notifications marked as read.']);
    }

    public static function markRead(string $id): void {
        $user = AuthMiddleware::authenticate();

        Database::execute(
            "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
            [$id, $user['id']]
        );

        Response::json(['success' => true, 'message' => 'Notification marked as read.']);
    }
}
