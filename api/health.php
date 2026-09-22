<?php
/**
 * CreatorHub - Direct API Health Endpoint
 */

declare(strict_types=1);

$baseDir = dirname(__DIR__);
require_once $baseDir . '/config/config.php';
require_once $baseDir . '/config/database.php';
require_once $baseDir . '/includes/Response.php';
require_once $baseDir . '/includes/CorsMiddleware.php';

use CreatorHub\Middleware\CorsMiddleware;
use CreatorHub\Utils\Response;

CorsMiddleware::handle();

Response::json([
    'success' => true,
    'backend' => 'php',
    'version' => '2.0.0',
    'status' => 'UP',
    'engine' => 'PHP ' . PHP_VERSION,
    'database_driver' => Database::getDriver(),
    'message' => 'CreatorHub Core API Server Running (PHP)',
    'timestamp' => date('c')
]);
