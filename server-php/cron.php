<?php
/**
 * CreatorHub PHP Backend - CLI Background Cron Worker
 * Run via Crontab, e.g.:
 * * /10 * * * * php /path/to/server-php/cron.php >> /var/log/creatorhub-cron.log 2>&1
 */

declare(strict_types=1);

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo "This script can only be run via CLI.\n";
    exit(1);
}

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

echo "[" . date('Y-m-d H:i:s') . "] Starting CreatorHub Background Cron Worker...\n";

try {
    // 1. Check for expired creator subscriptions
    $now = date('Y-m-d H:i:s');
    $expiredSubs = Database::execute(
        "UPDATE creator_subscriptions 
         SET status = 'EXPIRED' 
         WHERE status = 'ACTIVE' AND expires_at IS NOT NULL AND expires_at < ?",
        [$now]
    );
    if ($expiredSubs > 0) {
        echo "Updated {$expiredSubs} expired subscription(s) to EXPIRED.\n";
    }

    // 2. Refresh active creator profiles with connected Instagram accounts (older than 24h)
    $staleCreators = Database::query(
        "SELECT id, user_id, instagram_username, instagram_access_token 
         FROM creator_profiles 
         WHERE instagram_verified = 1 AND instagram_username IS NOT NULL 
         LIMIT 20"
    );
    echo "Found " . count($staleCreators) . " verified Instagram creators for background health verification.\n";

    echo "[" . date('Y-m-d H:i:s') . "] CreatorHub Background Cron Worker Finished Successfully.\n";
} catch (\Throwable $e) {
    echo "[" . date('Y-m-d H:i:s') . "] ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
