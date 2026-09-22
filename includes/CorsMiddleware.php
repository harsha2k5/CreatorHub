<?php
/**
 * CreatorHub - Credentials-Aware CORS Middleware
 */

declare(strict_types=1);

namespace CreatorHub\Middleware;

class CorsMiddleware {
    public static function handle(): void {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        
        // Handle Allowed Origins (Allow localhost, Vite dev server, XAMPP local host)
        header("Access-Control-Allow-Origin: {$origin}");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
        header("Access-Control-Max-Age: 86400");

        // Handle Preflight OPTIONS Request
        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
