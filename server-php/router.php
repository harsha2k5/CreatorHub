<?php
/**
 * CreatorHub PHP Backend - Master Router & Front Controller
 * Runs directly on: php -S localhost:5000 -t server-php server-php/router.php
 * Also compatible with Apache / Nginx.
 */

// Handle PHP built-in server static files
if (php_sapi_name() === 'cli-server') {
    $filePath = __DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (is_file($filePath)) {
        return false;
    }
}

// Global CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Razorpay-Signature");
header("Content-Type: application/json; charset=UTF-8");

// Handle OPTIONS Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Parse Request
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?? [];

// Normalize API Path
$path = trim($path, '/');
if (str_starts_with($path, 'api/')) {
    $path = substr($path, 4);
}
$parts = explode('/', $path);
$module = array_shift($parts); // first segment (e.g. auth, subscriptions, health)
$action = $parts[0] ?? '';

// Health check endpoint: /api/health or /health
if ($module === 'health') {
    echo json_encode([
        'status' => 'UP',
        'engine' => 'PHP ' . PHP_VERSION,
        'message' => 'CreatorHub Core API Server Running (PHP)',
        'timestamp' => date('c')
    ]);
    exit;
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

        case 'reviews':
            require_once __DIR__ . '/routes/reviews.php';
            handleReviewsRoute($parts, $method, $body);
            break;

        case 'reports':
            require_once __DIR__ . '/routes/reports.php';
            handleReportsRoute($parts, $method, $body);
            break;

        default:
            http_response_code(404);
            echo json_encode([
                'error' => "Endpoint not found: /api/{$path}",
                'status' => 404
            ]);
            break;
    }
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error: ' . $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ]);
}
