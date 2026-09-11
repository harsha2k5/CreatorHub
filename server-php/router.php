<?php
/**
 * CreatorHub PHP Backend - Master CLI Server Router & Front Controller
 * Runs on: php -S 0.0.0.0:5000 server-php/router.php
 */

declare(strict_types=1);

// Handle PHP built-in server static files
if (php_sapi_name() === 'cli-server') {
    $filePath = __DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (is_file($filePath)) {
        return false;
    }
}

// Autoloader if vendor exists
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/middleware/CorsMiddleware.php';
require_once __DIR__ . '/middleware/auth.php';

use CreatorHub\Middleware\CorsMiddleware;
use CreatorHub\Utils\Response;

// Global CORS Headers
CorsMiddleware::handle();

// Parse Request
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$rawInput = file_get_contents('php://input') ?: '';
$body = json_decode($rawInput, true) ?? [];
$GLOBALS['RAW_REQUEST_BODY'] = $rawInput;

// Normalize API Path
$path = trim($uri, '/');
if (str_starts_with($path, 'api/')) {
    $path = substr($path, 4);
}
$parts = explode('/', $path);
$module = array_shift($parts) ?? '';
$action = $parts[0] ?? '';

// Health check endpoint: /api/health or /health
if ($module === 'health' || $module === '') {
    Response::json([
        'success' => true,
        'backend' => 'php',
        'version' => '1.0.0',
        'status' => 'UP',
        'engine' => 'PHP ' . PHP_VERSION,
        'message' => 'CreatorHub Core API Server Running (PHP)',
        'timestamp' => date('c'),
        'database' => 'connected'
    ]);
}

// Route Dispatcher
try {
    switch ($module) {
        case 'auth':
            require_once __DIR__ . '/routes/auth.php';
            handleAuthRoute($action, $method, $body);
            break;

        case 'subscriptions':
            require_once __DIR__ . '/routes/subscriptions.php';
            handleSubscriptionsRoute($action, $method, $body);
            break;

        case 'payments':
            require_once __DIR__ . '/routes/payments.php';
            handlePaymentsRoute($action, $method, $body);
            break;

        case 'collaborations':
            require_once __DIR__ . '/routes/collaborations.php';
            handleCollaborationsRoute($parts, $method, $body);
            break;

        case 'applications':
            require_once __DIR__ . '/routes/applications.php';
            handleApplicationsRoute($parts, $method, $body);
            break;

        case 'campaigns':
            require_once __DIR__ . '/routes/campaigns.php';
            handleCampaignsRoute($parts, $method, $body);
            break;

        case 'creators':
            require_once __DIR__ . '/routes/creators.php';
            handleCreatorsRoute($parts, $method, $body);
            break;

        case 'brands':
            require_once __DIR__ . '/routes/brands.php';
            handleBrandsRoute($action, $method, $body);
            break;

        case 'instagram':
            require_once __DIR__ . '/routes/instagram.php';
            handleInstagramRoute($action, $method, $body);
            break;

        case 'messages':
            require_once __DIR__ . '/routes/messages.php';
            handleMessagesRoute($parts, $method, $body);
            break;

        case 'reviews':
            require_once __DIR__ . '/routes/reviews.php';
            handleReviewsRoute($parts, $method, $body);
            break;

        case 'notifications':
            require_once __DIR__ . '/routes/notifications.php';
            handleNotificationsRoute($parts, $method, $body);
            break;

        case 'ai':
            require_once __DIR__ . '/routes/ai.php';
            handleAiRoute($parts, $method, $body);
            break;

        case 'admin':
            require_once __DIR__ . '/routes/admin.php';
            handleAdminRoute($parts, $method, $body);
            break;

        case 'reports':
            require_once __DIR__ . '/routes/reports.php';
            handleReportsRoute($parts, $method, $body);
            break;

        default:
            Response::notFound("Endpoint not found: /api/{$path}");
            break;
    }
} catch (\Throwable $e) {
    Response::serverError('API Dispatch Error: ' . $e->getMessage(), $e);
}
