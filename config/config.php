<?php
/**
 * CreatorHub - Central Configuration & Environment Loader
 * 
 * Provides unified configuration management, environment variable loading,
 * and seamless class autoloading across the entire application.
 */

declare(strict_types=1);

// Set default application timezone
date_default_timezone_set('Asia/Kolkata');

// 1. Environment Variable Loader (.env)
if (!function_exists('loadEnv')) {
    function loadEnv(string $path): void {
        if (!file_exists($path) || !is_readable($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return;
        }

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || str_starts_with($line, '#')) {
                continue;
            }

            $parts = explode('=', $line, 2);
            if (count($parts) === 2) {
                $key = trim($parts[0]);
                $val = trim($parts[1]);

                // Remove surrounding quotes if present
                if ((str_starts_with($val, '"') && str_ends_with($val, '"')) ||
                    (str_starts_with($val, "'") && str_ends_with($val, "'"))) {
                    $val = substr($val, 1, -1);
                }

                if (!array_key_exists($key, $_ENV)) {
                    $_ENV[$key] = $val;
                    @putenv("{$key}={$val}"); // @ suppresses errors on Hostinger if putenv is disabled
                }
            }
        }
    }
}

// Load root .env
$rootPath = dirname(__DIR__);
loadEnv($rootPath . '/.env');

// 2. Global Environment Helper
if (!function_exists('env')) {
    function env(string $key, mixed $default = null): mixed {
        if (array_key_exists($key, $_ENV)) {
            return $_ENV[$key];
        }
        $val = getenv($key);
        return ($val !== false) ? $val : $default;
    }
}

// 3. Seamless Class Autoloader
spl_autoload_register(function (string $class) use ($rootPath) {
    // PSR-4 CreatorHub Namespace Support
    $prefix = 'CreatorHub\\';
    if (str_starts_with($class, $prefix)) {
        $relativeClass = substr($class, strlen($prefix));
        
        // Map subnamespaces to includes/
        $file = $rootPath . '/includes/' . str_replace('\\', '/', $relativeClass) . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
        
        // Direct root includes check
        $baseName = basename(str_replace('\\', '/', $relativeClass));
        $subdirs = ['models', 'controllers', 'services', 'middleware', 'utils'];
        foreach ($subdirs as $dir) {
            $candidate = $rootPath . '/includes/' . $dir . '/' . $baseName . '.php';
            if (file_exists($candidate)) {
                require_once $candidate;
                return;
            }
        }
    }

    // Direct Class Name Fallbacks in includes/ and config/
    $searchLocations = [
        $rootPath . '/config/' . $class . '.php',
        $rootPath . '/includes/' . $class . '.php',
        $rootPath . '/includes/models/' . $class . '.php',
        $rootPath . '/includes/controllers/' . $class . '.php',
        $rootPath . '/includes/services/' . $class . '.php',
        $rootPath . '/includes/middleware/' . $class . '.php',
        $rootPath . '/includes/utils/' . $class . '.php',
    ];

    foreach ($searchLocations as $file) {
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Resolve Database Driver & SQLite Path
$envDriver = strtolower(trim((string)(env('DB_DRIVER') ?: '')));
$envDbUrl = strtolower(trim((string)(env('DATABASE_URL') ?: '')));
$isMysql = ($envDriver === 'mysql' || $envDbUrl === 'mysql' || str_starts_with($envDbUrl, 'mysql:'));
$driver = $isMysql ? 'mysql' : ($envDriver ?: 'sqlite');

$rawDbPath = env('DB_DATABASE') ?: ($envDbUrl !== 'mysql' && $envDbUrl !== 'sqlite' ? env('DATABASE_URL') : null);
if ($rawDbPath && (str_ends_with($rawDbPath, '.sqlite') || str_ends_with($rawDbPath, '.db') || file_exists($rawDbPath))) {
    if (!str_starts_with($rawDbPath, '/') && !preg_match('/^[A-Za-z]:[\\\\\/]/', $rawDbPath)) {
        $sqlitePath = $rootPath . '/' . ltrim($rawDbPath, '/\\');
    } else {
        $sqlitePath = $rawDbPath;
    }
} else {
    $sqlitePath = $rootPath . '/database.sqlite';
}

// 4. Return Master Configuration Array
return [
    'app_name' => 'CreatorHub',
    'app_env' => env('APP_ENV', 'development'),
    'app_url' => env('APP_URL', 'http://localhost/CreatorHub'),
    'port' => (int) env('PORT', 5000),
    'jwt_secret' => env('JWT_SECRET', 'creatorhub_production_jwt_secret_key_secure_2026_min32chars'),
    
    // Database Configuration (Centralized MySQL/MariaDB & SQLite support)
    'database' => [
        'driver' => $driver, // 'mysql' or 'sqlite'
        'host' => env('DB_HOST', '127.0.0.1'),
        'port' => (int) env('DB_PORT', 3306),
        'database' => env('DB_NAME', 'creatorhub'),
        'username' => env('DB_USER', 'root'),
        'password' => env('DB_PASS', ''),
        'charset' => 'utf8mb4',
        'sqlite_path' => $sqlitePath
    ],
    
    // Uploads
    'upload_dir' => $rootPath . '/uploads',
    
    // Meta / Instagram Graph API v19.0
    'meta' => [
        'app_id' => env('META_APP_ID', '2006437840057650'),
        'app_secret' => env('META_APP_SECRET', '53bc24e24b9a973f20e4a568cce7d91d'),
        'redirect_uri' => env('META_REDIRECT_URI', 'http://localhost/CreatorHub/creator/dashboard')
    ],
    
    // Razorpay Escrow Gateway
    'razorpay' => [
        'key_id' => env('RAZORPAY_KEY_ID', 'rzp_test_51creatorhub001'),
        'key_secret' => env('RAZORPAY_KEY_SECRET', 'test_secret_creatorhub_escrow_2026'),
        'webhook_secret' => env('RAZORPAY_WEBHOOK_SECRET', '')
    ],
    
    // Google Gemini AI
    'gemini_api_key' => env('GEMINI_API_KEY', ''),
    
    // RapidAPI for Instagram Proxy
    'rapidapi_key' => env('RAPIDAPI_KEY', '')
];
