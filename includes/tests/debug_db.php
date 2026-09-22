<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

echo "=== CREATOR PROFILES ===\n";
$cp = Database::query('SELECT id, user_id, full_name, username, bio FROM creator_profiles');
print_r($cp);

echo "\n=== INSTAGRAM ACCOUNTS ===\n";
$ig = Database::query('SELECT id, creator_id, user_id, instagram_username, username, is_connected FROM instagram_accounts');
print_r($ig);

echo "\n=== INSTAGRAM METRICS ===\n";
$im = Database::query('SELECT * FROM instagram_metrics');
print_r($im);

echo "\n=== INSTAGRAM MEDIA COUNT ===\n";
$media = Database::query('SELECT creator_id, COUNT(*) as cnt, SUM(like_count) as total_likes, SUM(comment_count) as total_comments FROM instagram_media GROUP BY creator_id');
print_r($media);
