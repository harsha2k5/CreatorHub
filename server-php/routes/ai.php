<?php
/**
 * CreatorHub PHP Backend - AI Creator Analysis Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

function handleAiRoute(array $segments, string $method, array $body) {
    // Expected: /api/ai/creator-analysis/:creatorId
    $sub = $segments[0] ?? null;
    $creatorId = $segments[1] ?? null;

    if ($sub === 'creator-analysis' && !empty($creatorId) && $method === 'GET') {
        $analysis = Database::queryOne(
            "SELECT * FROM ai_creator_analyses WHERE creator_id = ? ORDER BY created_at DESC LIMIT 1",
            [$creatorId]
        );

        if (!$analysis) {
            http_response_code(404);
            echo json_encode(['error' => 'AI analysis not found. Connect your official Instagram account to generate analysis.']);
            return;
        }

        echo json_encode(['success' => true, 'analysis' => $analysis]);
        return;
    }

    http_response_code(404);
    echo json_encode(['error' => 'AI endpoint not found.']);
}
