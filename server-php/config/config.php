<?php
/**
 * CreatorHub PHP Backend - Global Configuration & Environment Loader
 */

// Ensure timezone
date_default_timezone_set('Asia/Kolkata');

// Function to load .env file
if (!function_exists('loadEnv')) {
    function loadEnv($path) {
        if (!file_exists($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) {
                continue;
            }

            $parts = explode('=', $line, 2);
            if (count($parts) === 2) {
                $key = trim($parts[0]);
                $val = trim($parts[1]);
                // Strip wrapping quotes
                if ((str_starts_with($val, '"') && str_ends_with($val, '"')) ||
                    (str_starts_with($val, "'") && str_ends_with($val, "'"))) {
                    $val = substr($val, 1, -1);
                }
                if (!array_key_exists($key, $_ENV)) {
                    $_ENV[$key] = $val;
                    putenv("{$key}={$val}");
                }
            }
        }
    }
}

// Load root .env and server-php/.env
$rootEnvPath = dirname(__DIR__, 2) . '/.env';
loadEnv($rootEnvPath);
$localEnvPath = dirname(__DIR__) . '/.env';
loadEnv($localEnvPath);

// Register Seamless PSR-4 and Root Class Autoloader
spl_autoload_register(function (string $class) {
    $baseDir = dirname(__DIR__) . '/';
    $prefix = 'CreatorHub\\';

    if (str_starts_with($class, $prefix)) {
        $relativeClass = substr($class, strlen($prefix));
        $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }

    // Root & Global class fallback (services, models, utils, middleware, controllers)
    $subdirs = ['services', 'models', 'utils', 'middleware', 'controllers', 'config'];
    foreach ($subdirs as $dir) {
        $file = $baseDir . $dir . '/' . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

if (!function_exists('env')) {
    function env($key, $default = null) {
        if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
            return $_ENV[$key];
        }
        $val = getenv($key);
        return ($val !== false && $val !== '') ? $val : $default;
    }
}

// Resolve SQLite database path
$rawDbPath = env('DB_DATABASE') ?: env('DATABASE_URL');
if ($rawDbPath) {
    if (!str_starts_with($rawDbPath, '/') && !preg_match('/^[A-Za-z]:[\\\\\/]/', $rawDbPath)) {
        $dbResolvedPath = dirname(__DIR__, 2) . '/' . ltrim($rawDbPath, '/\\');
    } else {
        $dbResolvedPath = $rawDbPath;
    }
} else {
    $dbResolvedPath = dirname(__DIR__, 2) . '/server/data/creatorhub.db';
}

// Global Configuration Array
return [
    'port' => (int) env('PORT', 5000),
    'env' => env('APP_ENV', env('NODE_ENV', 'development')),
    'app_url' => env('APP_URL', 'http://localhost:5000'),
    'jwt_secret' => env('JWT_SECRET', 'creatorhub_development_jwt_secret_key_12345'),
    'db_driver' => env('DB_DRIVER', 'sqlite'),
    'database_path' => $dbResolvedPath,
    'meta' => [
        'app_id' => env('META_APP_ID', ''),
        'app_secret' => env('META_APP_SECRET', ''),
        'redirect_uri' => env('META_REDIRECT_URI', 'http://localhost:5173/creator/dashboard')
    ],
    'razorpay' => [
        'key_id' => env('RAZORPAY_KEY_ID', ''),
        'key_secret' => env('RAZORPAY_KEY_SECRET', ''),
        'webhook_secret' => env('RAZORPAY_WEBHOOK_SECRET', '')
    ],
    'gemini_api_key' => env('GEMINI_API_KEY', '')
];
