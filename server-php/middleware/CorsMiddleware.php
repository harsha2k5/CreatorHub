<?php
/**
 * CreatorHub PHP Backend - Strict CORS Middleware
 * Complies with credentials-aware CORS (never sends '*' with credentials).
 */

namespace CreatorHub\Middleware;

class CorsMiddleware {
    /**
     * List of explicitly allowed origins or origin regex patterns
     */
    private static array $allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5000'
    ];

    /**
     * Check origin and emit proper CORS headers
     */
    public static function handle(): void {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $frontendUrl = getenv('FRONTEND_URL') ?: (getenv('VITE_API_URL') ?: '');

        $isAllowed = false;

        if (!empty($origin)) {
            // Check exact local matches
            if (in_array($origin, self::$allowedOrigins, true)) {
                $isAllowed = true;
            }
            // Check configured FRONTEND_URL
            elseif (!empty($frontendUrl) && rtrim($origin, '/') === rtrim($frontendUrl, '/')) {
                $isAllowed = true;
            }
            // Check Netlify subdomains: https://<site-name>.netlify.app or deploy previews
            elseif (preg_match('/^https:\/\/([a-zA-Z0-9\-_]+)\.netlify\.app$/i', $origin)) {
                $isAllowed = true;
            }
        }

        if ($isAllowed) {
            header("Access-Control-Allow-Origin: {$origin}");
            header("Access-Control-Allow-Credentials: true");
        } else {
            // If origin is not allowed or no origin sent (e.g. server-to-server or test)
            if (!empty($origin)) {
                header("Access-Control-Allow-Origin: " . self::$allowedOrigins[0]);
                header("Access-Control-Allow-Credentials: true");
            } else {
                header("Access-Control-Allow-Origin: *");
            }
        }

        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Razorpay-Signature, Accept");
        header("Access-Control-Max-Age: 86400"); // 24 hours preflight cache
        header("Content-Type: application/json; charset=UTF-8");

        // Fast-exit for OPTIONS preflight
        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
