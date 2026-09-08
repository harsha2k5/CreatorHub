<?php
/**
 * CreatorHub PHP Backend - Messages & Chat Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

function handleMessagesRoute(array $segments, string $method, array $body) {
    $user = AuthMiddleware::authenticate();

    $action = $segments[0] ?? null;
    $targetId = $segments[1] ?? null;

    if ($action === 'conversations' && empty($targetId) && $method === 'GET') {
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

        echo json_encode(['success' => true, 'conversations' => $convs]);
        return;
    }

    if ($action === 'conversations' && !empty($targetId) && $method === 'GET') {
        $messages = Database::query(
            "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
            [$targetId]
        );

        echo json_encode(['success' => true, 'messages' => $messages]);
        return;
    }

    if ($action === 'send' && $method === 'POST') {
        $receiverId = $body['receiver_id'] ?? '';
        $messageText = trim($body['message'] ?? $body['content'] ?? '');

        if (empty($receiverId) || empty($messageText)) {
            http_response_code(400);
            echo json_encode(['error' => 'receiver_id and message are required.']);
            return;
        }

        // Find or create conversation
        $conv = Database::queryOne(
            "SELECT id FROM conversations
             WHERE (participant_one = ? AND participant_two = ?)
                OR (participant_one = ? AND participant_two = ?)",
            [$user['id'], $receiverId, $receiverId, $user['id']]
        );

        $convId = $conv ? $conv['id'] : null;
        if (!$convId) {
            $convId = 'conv_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);
            Database::execute(
                "INSERT INTO conversations (id, participant_one, participant_two, last_message, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
                [$convId, $user['id'], $receiverId, $messageText]
            );
        } else {
            Database::execute(
                "UPDATE conversations SET last_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [$messageText, $convId]
            );
        }

        $msgId = 'msg_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);
        Database::execute(
            "INSERT INTO messages (id, conversation_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?, ?)",
            [$msgId, $convId, $user['id'], $receiverId, $messageText]
        );

        $createdMsg = Database::queryOne("SELECT * FROM messages WHERE id = ?", [$msgId]);
        echo json_encode(['success' => true, 'message' => $createdMsg]);
        return;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Messages endpoint not found.']);
}
