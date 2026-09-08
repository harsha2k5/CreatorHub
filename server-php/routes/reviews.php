<?php
/**
 * CreatorHub PHP Backend - Reviews Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/controllers/ReviewController.php';

use CreatorHub\Controllers\ReviewController;
use CreatorHub\Utils\Response;

function handleReviewsRoute(array $segments, string $method, array $body) {
    $first = $segments[0] ?? null;
    $second = $segments[1] ?? null;

    if ($first === 'creator' && $second && $method === 'GET') {
        ReviewController::forCreator($second);
        return;
    }

    if ($first === 'collaboration' && $second && $method === 'GET') {
        ReviewController::forCollaboration($second);
        return;
    }

    if ($first && empty($second) && $method === 'GET') {
        ReviewController::forCreator($first);
        return;
    }

    if (empty($segments) && $method === 'POST') {
        ReviewController::store($body);
        return;
    }

    Response::notFound('Review endpoint not found: /api/reviews/' . implode('/', $segments));
}
