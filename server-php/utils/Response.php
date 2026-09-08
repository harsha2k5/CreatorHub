<?php
/**
 * CreatorHub PHP Backend - Standardized JSON API Response Helper
 */

namespace CreatorHub\Utils;

class Response {
    /**
     * Send standard JSON response and exit
     */
    public static function json(array $data, int $status = 200): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Send standardized success response
     */
    public static function success(array $data = [], ?string $message = null, int $status = 200): void {
        $response = ['success' => true];
        if ($message !== null) {
            $response['message'] = $message;
        }
        $response = array_merge($response, $data);
        self::json($response, $status);
    }

    /**
     * Send standardized error response
     */
    public static function error(string $message, int $status = 400, ?string $code = null, array $extra = []): void {
        $response = [
            'success' => false,
            'error' => $message,
            'message' => $message
        ];
        if ($code !== null) {
            $response['code'] = $code;
        }
        $response = array_merge($response, $extra);
        self::json($response, $status);
    }

    /**
     * Common error helpers
     */
    public static function unauthorized(string $message = 'Authentication required'): void {
        self::error($message, 401, 'UNAUTHORIZED');
    }

    public static function forbidden(string $message = 'Access forbidden'): void {
        self::error($message, 403, 'FORBIDDEN');
    }

    public static function notFound(string $message = 'Resource not found'): void {
        self::error($message, 404, 'NOT_FOUND');
    }

    public static function validation(array $errors, string $message = 'Validation failed'): void {
        self::error($message, 422, 'VALIDATION_ERROR', ['errors' => $errors]);
    }

    public static function serverError(string $message = 'Internal server error', ?\Throwable $e = null): void {
        $extra = [];
        $env = getenv('APP_ENV') ?: (getenv('NODE_ENV') ?: 'production');
        if ($env === 'development' && $e !== null) {
            $extra['debug'] = [
                'exception' => get_class($e),
                'file' => basename($e->getFile()),
                'line' => $e->getLine()
            ];
        }
        self::error($message, 500, 'SERVER_ERROR', $extra);
    }
}
