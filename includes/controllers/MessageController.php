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
        $role = $user['role'];

        try {
            $sql = '';
            $params = [];

            if ($role === 'creator') {
                $creator = Database::queryOne('SELECT id FROM creator_profiles WHERE user_id = ?', [$user['id']]);
                if (!$creator) {
                    Response::notFound('Creator not found.');
                }

                $sql = "
                    SELECT conv.*, 
                           b.company_name as other_name, b.company_name as other_party_name,
                           b.logo_url as other_avatar, b.logo_url as other_party_avatar,
                           b.category as other_subtitle,
                           COALESCE(cmp.title, 'Direct Collaboration Pitch') as campaign_title,
                           COALESCE(cmp.reward_per_creator, 5000) as campaign_reward,
                           col.id as collaboration_id,
                           col.status as collaboration_status,
                           col.current_step as collaboration_step,
                           (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = conv.id AND m.sender_id != ? AND m.read_status = 0) as unread_count
                    FROM conversations conv
                    JOIN brand_profiles b ON conv.brand_id = b.id
                    LEFT JOIN campaigns cmp ON conv.campaign_id = cmp.id
                    LEFT JOIN collaborations col ON (
                        (conv.campaign_id IS NOT NULL AND col.campaign_id = conv.campaign_id AND col.creator_id = conv.creator_id)
                        OR (col.brand_id = conv.brand_id AND col.creator_id = conv.creator_id)
                    )
                    WHERE conv.creator_id = ?
                    ORDER BY conv.updated_at DESC
                ";
                $params = [$user['id'], $creator['id']];
            } elseif ($role === 'brand') {
                $brand = Database::queryOne('SELECT id FROM brand_profiles WHERE user_id = ?', [$user['id']]);
                if (!$brand) {
                    Response::notFound('Brand not found.');
                }

                $sql = "
                    SELECT conv.*, 
                           cr.full_name as other_name, cr.full_name as other_party_name,
                           cr.avatar_url as other_avatar, cr.avatar_url as other_party_avatar,
                           cr.username as other_subtitle,
                           COALESCE(cmp.title, 'Direct Collaboration Pitch') as campaign_title,
                           (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = conv.id AND m.sender_id != ? AND m.read_status = 0) as unread_count
                    FROM conversations conv
                    JOIN creator_profiles cr ON conv.creator_id = cr.id
                    LEFT JOIN campaigns cmp ON conv.campaign_id = cmp.id
                    WHERE conv.brand_id = ?
                    ORDER BY conv.updated_at DESC
                ";
                $params = [$user['id'], $brand['id']];
            } else {
                Response::json(['success' => true, 'count' => 0, 'conversations' => []]);
                return;
            }

            $conversations = Database::query($sql, $params);
            Response::json([
                'success' => true,
                'count' => count($conversations),
                'conversations' => $conversations
            ]);
        } catch (\Throwable $e) {
            Response::serverError('Failed to retrieve conversations: ' . $e->getMessage(), $e);
        }
    }

    public static function messages(string $conversationId): void {
        $user = AuthMiddleware::authenticate();

        $conv = Database::queryOne('SELECT * FROM conversations WHERE id = ?', [$conversationId]);
        if (!$conv) {
            Response::notFound('Conversation not found.');
        }

        // Authorization check
        $isAuthorized = ($user['role'] === 'admin');
        if (!$isAuthorized) {
            if ($user['role'] === 'creator') {
                $creator = Database::queryOne('SELECT id FROM creator_profiles WHERE user_id = ?', [$user['id']]);
                $isAuthorized = $creator && ($creator['id'] === $conv['creator_id']);
            } elseif ($user['role'] === 'brand') {
                $brand = Database::queryOne('SELECT id FROM brand_profiles WHERE user_id = ?', [$user['id']]);
                $isAuthorized = $brand && ($brand['id'] === $conv['brand_id']);
            }
        }

        if (!$isAuthorized) {
            Response::forbidden('You are not authorized to view this conversation.');
        }

        // Mark incoming messages as read
        Database::execute(
            'UPDATE messages SET read_status = 1 WHERE conversation_id = ? AND sender_id != ?',
            [$conversationId, $user['id']]
        );

        $messages = Database::query(
            'SELECT * FROM messages WHERE conversation_id = ? ORDER BY sent_at ASC',
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

        $conv = Database::queryOne('SELECT * FROM conversations WHERE id = ?', [$conversationId]);
        if (!$conv) {
            Response::notFound('Conversation thread not found.');
        }

        // Authorization check
        $isAuthorized = ($user['role'] === 'admin');
        if (!$isAuthorized) {
            if ($user['role'] === 'creator') {
                $creator = Database::queryOne('SELECT id FROM creator_profiles WHERE user_id = ?', [$user['id']]);
                $isAuthorized = $creator && ($creator['id'] === $conv['creator_id']);
            } elseif ($user['role'] === 'brand') {
                $brand = Database::queryOne('SELECT id FROM brand_profiles WHERE user_id = ?', [$user['id']]);
                $isAuthorized = $brand && ($brand['id'] === $conv['brand_id']);
            }
        }

        if (!$isAuthorized) {
            Response::forbidden('You are not authorized to send messages in this thread.');
        }

        $msgId = 'msg_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);

        Database::execute(
            'INSERT INTO messages (id, conversation_id, sender_id, text, attachment_url, read_status) VALUES (?, ?, ?, ?, ?, 0)',
            [$msgId, $conversationId, $user['id'], $text, $attachmentUrl]
        );

        Database::execute(
            'UPDATE conversations SET last_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [$text, $conversationId]
        );

        $newMsg = Database::queryOne('SELECT * FROM messages WHERE id = ?', [$msgId]);
        Response::json(['success' => true, 'message' => $newMsg], 201);
    }
}
