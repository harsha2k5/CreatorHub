<?php
/**
 * CreatorHub PHP Backend - Public Entry Point (Webroot Front Controller)
 * Compatible with Apache mod_php / FastCGI, Nginx + PHP-FPM, and PHP CLI Server.
 */

declare(strict_types=1);

// Report all errors in dev, suppress in prod
$env = getenv('APP_ENV') ?: (getenv('NODE_ENV') ?: 'development');
if ($env === 'development') {
    ini_set('display_errors', '0'); // Return JSON errors instead of raw HTML output
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    error_reporting(0);
}

// 1. Bootstrap Autoloader / Dependencies
$baseDir = dirname(__DIR__);
if (file_exists($baseDir . '/vendor/autoload.php')) {
    require_once $baseDir . '/vendor/autoload.php';
}

// 2. Load Core Configuration & Database
require_once $baseDir . '/config/config.php';
require_once $baseDir . '/config/database.php';
require_once $baseDir . '/utils/Response.php';
require_once $baseDir . '/middleware/CorsMiddleware.php';
require_once $baseDir . '/middleware/auth.php';

use CreatorHub\Middleware\CorsMiddleware;
use CreatorHub\Utils\Response;

// 3. Apply Strict Credentials-Aware CORS
CorsMiddleware::handle();

// 4. Global Exception & Error Handler
set_exception_handler(function (\Throwable $e) {
    Response::serverError('Internal Server Error: ' . $e->getMessage(), $e);
});

set_error_handler(function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return false;
    }
    throw new \ErrorException($message, 0, $severity, $file, $line);
});

// 5. Parse Request
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$rawInput = file_get_contents('php://input') ?: '';
$body = json_decode($rawInput, true) ?? [];

// Store raw body globally for cryptographic signature checks (e.g. Razorpay webhooks)
$GLOBALS['RAW_REQUEST_BODY'] = $rawInput;

// 6. Normalize Path
$path = trim($uri, '/');
if (str_starts_with($path, 'api/')) {
    $path = substr($path, 4);
}
$parts = explode('/', $path);
$module = array_shift($parts) ?? '';
$action = $parts[0] ?? '';

// 7. Health Check: /health or /api/health
if ($module === 'health' || $module === '') {
    Response::json([
        'status' => 'UP',
        'engine' => 'PHP ' . PHP_VERSION,
        'message' => 'CreatorHub Core API Server Running (PHP)',
        'timestamp' => date('c'),
        'database' => 'connected'
    ]);
}

// 8. Modular Route Dispatcher
try {
    switch ($module) {
        case 'auth':
            require_once $baseDir . '/routes/auth.php';
            handleAuthRoute($action, $method, $body);
            break;

        case 'subscriptions':
            require_once $baseDir . '/routes/subscriptions.php';
            handleSubscriptionsRoute($action, $method, $body);
            break;

        case 'payments':
            require_once $baseDir . '/routes/payments.php';
            handlePaymentsRoute($action, $method, $body);
            break;

        case 'collaborations':
            require_once $baseDir . '/routes/collaborations.php';
            handleCollaborationsRoute($parts, $method, $body);
            break;

        case 'applications':
            require_once $baseDir . '/routes/applications.php';
            handleApplicationsRoute($parts, $method, $body);
            break;

        case 'campaigns':
            require_once $baseDir . '/routes/campaigns.php';
            handleCampaignsRoute($parts, $method, $body);
            break;

        case 'creators':
            require_once $baseDir . '/routes/creators.php';
            handleCreatorsRoute($parts, $method, $body);
            break;

        case 'brands':
            require_once $baseDir . '/routes/brands.php';
            handleBrandsRoute($action, $method, $body);
            break;

        case 'instagram':
            require_once $baseDir . '/routes/instagram.php';
            handleInstagramRoute($action, $method, $body);
            break;

        case 'messages':
            require_once $baseDir . '/routes/messages.php';
            handleMessagesRoute($parts, $method, $body);
            break;

        case 'reviews':
            require_once $baseDir . '/routes/reviews.php';
            handleReviewsRoute($parts, $method, $body);
            break;

        case 'notifications':
            require_once $baseDir . '/routes/notifications.php';
            handleNotificationsRoute($parts, $method, $body);
            break;

        case 'ai':
            require_once $baseDir . '/routes/ai.php';
            handleAiRoute($parts, $method, $body);
            break;

        case 'admin':
            require_once $baseDir . '/routes/admin.php';
            handleAdminRoute($parts, $method, $body);
            break;

        case 'reports':
            require_once $baseDir . '/routes/reports.php';
            handleReportsRoute($parts, $method, $body);
            break;

        default:
            Response::notFound("Endpoint not found: /api/{$path}");
            break;
    }
} catch (\Throwable $e) {
    Response::serverError('API Dispatch Error: ' . $e->getMessage(), $e);
}
