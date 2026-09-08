<?php
/**
 * CreatorHub PHP Backend - AI Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/controllers/AIController.php';

use CreatorHub\Controllers\AIController;
use CreatorHub\Utils\Response;

function handleAiRoute(array $segments, string $method, array $body) {
    $first = $segments[0] ?? null;
    $second = $segments[1] ?? null;

    if ($first === 'match-score' && $method === 'POST') {
        AIController::matchScore($body);
        return;
    }

    if ($first === 'creator-analysis' && $second && $method === 'GET') {
        AIController::creatorAnalysis($second);
        return;
    }

    if ($first === 'analyze-creator' && $method === 'POST') {
        AIController::analyzeCreator();
        return;
    }

    if ($first === 'generate-campaign-brief' && $method === 'POST') {
        AIController::generateCampaignBrief($body);
        return;
    }

    if ($first === 'pitch-helper' && $method === 'POST') {
        AIController::pitchHelper($body);
        return;
    }

    Response::notFound('AI endpoint not found: /api/ai/' . implode('/', $segments));
}
