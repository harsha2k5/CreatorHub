<?php
/**
 * CreatorHub PHP Backend - Brands Profile & Analytics Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/controllers/BrandController.php';

use CreatorHub\Controllers\BrandController;
use CreatorHub\Utils\Response;

function handleBrandsRoute(string $action, string $method, array $body) {
    if (empty($action) && $method === 'GET') {
        BrandController::index();
        return;
    }

    if ($action === 'analytics' && $method === 'GET') {
        BrandController::analytics();
        return;
    }

    if ($action === 'profile' && ($method === 'PUT' || $method === 'PATCH' || $method === 'POST')) {
        BrandController::updateProfile($body);
        return;
    }

    if (!empty($action) && $method === 'GET') {
        BrandController::show($action);
        return;
    }

    Response::notFound('Brand endpoint not found: /api/brands/' . $action);
}
