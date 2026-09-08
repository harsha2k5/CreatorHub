<?php
/**
 * CreatorHub PHP Backend - MessageController
 */

namespace CreatorHub\Controllers;

use Database;
use AuthMiddleware;
use CreatorHub\Utils\Response;

class MessageController {
    public static function conversations(): void {
        $user = AuthMiddleware::authenticate();

        $convs = Database::query(
            "SELECT c.*,
                    u1.email as sender_email, u2.email as receiver_email
             FROM conversations c
             JOIN users u1 ON c.participant_one = u1.id
             JOIN users u2 ON c.participant_two = u2.id
             WHERE c.participant_one = ? OR c.participant_two = ?
             ORDER BY c.updated_at DESC",
            [$user['id'], $user['id']]
        );

        Response::json(['success' => true, 'conversations' => $convs]);
    }

    public static function messages(string $conversationId): void {
        $user = AuthMiddleware::authenticate();

        $messages = Database::query(
            "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
            [$conversationId]
        );

        Response::json(['success' => true, 'messages' => $messages]);
    }

    public static function sendMessage(string $conversationId, array $body): void {
        $user = AuthMiddleware::authenticate();
        $text = trim($body['text'] ?? $body['message'] ?? $body['content'] ?? '');
        $attachmentUrl = $body['attachment_url'] ?? null;

        if (empty($text)) {
            Response::error('Message text cannot be empty.', 400);
        }

        $conv = Database::queryOne("SELECT * FROM conversations WHERE id = ?", [$conversationId]);
        if (!$conv) {
            Response::notFound('Conversation thread not found.');
        }

        $receiverId = ($conv['participant_one'] === $user['id']) ? $conv['participant_two'] : $conv['participant_one'];

        $msgId = 'msg_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);
        Database::execute(
            "INSERT INTO messages (id, conversation_id, sender_id, receiver_id, content, attachment_url, created_at)
             VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
            [$msgId, $conversationId, $user['id'], $receiverId, $text, $attachmentUrl]
        );

        Database::execute(
            "UPDATE conversations SET last_message = ?, updated_at = datetime('now') WHERE id = ?",
            [$text, $conversationId]
        );

        $created = Database::queryOne("SELECT * FROM messages WHERE id = ?", [$msgId]);
        Response::json(['success' => true, 'message' => $created], 201);
    }
}
