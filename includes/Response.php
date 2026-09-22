<?php
/**
 * CreatorHub - Standardized API Response Helper
 */

declare(strict_types=1);

namespace CreatorHub\Utils;

class Response {
    /**
     * Send standard JSON response
     */
    public static function json(array $data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Send structured error response
     */
    public static function error(string $message, int $statusCode = 400, array $extra = []): void {
        self::json(array_merge([
            'success' => false,
            'error' => $message
        ], $extra), $statusCode);
    }

    public static function unauthorized(string $message = 'Unauthorized'): void {
        self::error($message, 401);
    }

    public static function forbidden(string $message = 'Forbidden'): void {
        self::error($message, 403);
    }

    public static function notFound(string $message = 'Not Found'): void {
        self::error($message, 404);
    }

    public static function serverError(string $message = 'Internal Server Error', ?\Throwable $e = null): void {
        $extra = [];
        $env = defined('APP_ENV') ? APP_ENV : (getenv('APP_ENV') ?: 'development');
        if ($env === 'development' && $e !== null) {
            $extra['debug'] = [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ];
        }
        self::error($message, 500, $extra);
    }
}
