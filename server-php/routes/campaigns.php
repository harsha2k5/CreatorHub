<?php
/**
 * CreatorHub PHP Backend - Campaigns Route
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/controllers/CampaignController.php';

use CreatorHub\Controllers\CampaignController;
use CreatorHub\Utils\Response;

function handleCampaignsRoute(array $segments, string $method, array $body) {
    // GET /api/campaigns
    if (empty($segments) && $method === 'GET') {
        CampaignController::index();
        return;
    }

    // POST /api/campaigns
    if (empty($segments) && $method === 'POST') {
        CampaignController::store($body);
        return;
    }

    $id = $segments[0] ?? null;
    $sub = $segments[1] ?? null;

    // GET /api/campaigns/:id
    if ($id && empty($sub) && $method === 'GET') {
        CampaignController::show($id);
        return;
    }

    // PATCH /api/campaigns/:id/status
    if ($id && $sub === 'status' && ($method === 'PATCH' || $method === 'POST')) {
        CampaignController::updateStatus($id, $body);
        return;
    }

    // GET /api/campaigns/:id/matches
    if ($id && $sub === 'matches' && $method === 'GET') {
        CampaignController::matches($id);
        return;
    }

    Response::notFound('Campaign endpoint not found: /api/campaigns/' . implode('/', $segments));
}
