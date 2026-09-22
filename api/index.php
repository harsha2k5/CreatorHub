<?php
/**
 * CreatorHub - Master REST API Front Controller & Router
 * Dispatches all /api/* endpoint requests.
 */

declare(strict_types=1);

$baseDir = dirname(__DIR__);

// 1. Load Core Configuration & Database
require_once $baseDir . '/config/config.php';
require_once $baseDir . '/config/database.php';
require_once $baseDir . '/includes/Response.php';
require_once $baseDir . '/includes/CorsMiddleware.php';
require_once $baseDir . '/includes/auth.php';

use CreatorHub\Middleware\CorsMiddleware;
use CreatorHub\Utils\Response;

// 2. Apply Strict CORS Headers
CorsMiddleware::handle();

// 3. Global Exception Handler
set_exception_handler(function (\Throwable $e) {
    Response::serverError('Internal Server Error: ' . $e->getMessage(), $e);
});

// 4. Parse Request
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$rawInput = file_get_contents('php://input') ?: '';
$body = json_decode($rawInput, true) ?? [];
$GLOBALS['RAW_REQUEST_BODY'] = $rawInput;

// 5. Normalize Path
$path = trim($uri, '/');

// Robustly extract path relative to /api/
if (($apiPos = stripos($uri, '/api/')) !== false) {
    $path = substr($uri, $apiPos + 5);
} elseif (preg_match('#/api/?$#i', $uri)) {
    $path = '';
} else {
    while (stripos($path, 'creatorhub/') === 0) {
        $path = substr($path, 11);
    }
    if (stripos($path, 'api/') === 0) {
        $path = substr($path, 4);
    } elseif ($path === 'api') {
        $path = '';
    }
}

$parts = array_values(array_filter(explode('/', $path)));
$module = array_shift($parts) ?? '';
$action = $parts[0] ?? '';

// 6. Health Check Endpoint
if ($module === 'health' || $module === '') {
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
}

// 7. Route Dispatcher
try {
    switch ($module) {
        case 'auth':
            require_once __DIR__ . '/auth.php';
            handleAuthRoute($action, $method, $body);
            break;

        case 'subscriptions':
            require_once __DIR__ . '/subscriptions.php';
            handleSubscriptionsRoute($action, $method, $body);
            break;

        case 'payments':
            require_once __DIR__ . '/payments.php';
            handlePaymentsRoute($action, $method, $body);
            break;

        case 'collaborations':
            require_once __DIR__ . '/collaborations.php';
            handleCollaborationsRoute($parts, $method, $body);
            break;

        case 'applications':
            require_once __DIR__ . '/applications.php';
            handleApplicationsRoute($parts, $method, $body);
            break;

        case 'campaigns':
            require_once __DIR__ . '/campaigns.php';
            handleCampaignsRoute($parts, $method, $body);
            break;

        case 'creators':
            require_once __DIR__ . '/creators.php';
            handleCreatorsRoute($parts, $method, $body);
            break;

        case 'brands':
            require_once __DIR__ . '/brands.php';
            handleBrandsRoute($action, $method, $body);
            break;

        case 'instagram':
            require_once __DIR__ . '/instagram.php';
            handleInstagramRoute($action, $method, $body);
            break;

        case 'messages':
            require_once __DIR__ . '/messages.php';
            handleMessagesRoute($parts, $method, $body);
            break;

        case 'reviews':
            require_once __DIR__ . '/reviews.php';
            handleReviewsRoute($parts, $method, $body);
            break;

        case 'notifications':
            require_once __DIR__ . '/notifications.php';
            handleNotificationsRoute($parts, $method, $body);
            break;

        case 'ai':
            require_once __DIR__ . '/ai.php';
            handleAiRoute($parts, $method, $body);
            break;

        case 'admin':
            require_once __DIR__ . '/admin.php';
            handleAdminRoute($parts, $method, $body);
            break;

        case 'reports':
            require_once __DIR__ . '/reports.php';
            handleReportsRoute($parts, $method, $body);
            break;

        default:
            Response::notFound("Endpoint not found: /api/{$path}");
            break;
    }
} catch (\Throwable $e) {
    Response::serverError('API Dispatch Error: ' . $e->getMessage(), $e);
}
