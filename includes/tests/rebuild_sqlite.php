<?php
/**
 * Rebuild SQLite database from database.sql
 */

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/config/config.php';
require_once dirname(__DIR__, 2) . '/config/database.php';

echo "Rebuilding database.sqlite from database.sql...\n";

$dbPath = dirname(__DIR__, 2) . '/database.sqlite';
$sqlPath = dirname(__DIR__, 2) . '/database.sql';

if (file_exists($dbPath)) {
    unlink($dbPath);
}

$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec('PRAGMA foreign_keys = ON');

$sql = file_get_contents($sqlPath);

$lines = explode("\n", $sql);
$cleanSql = '';
foreach ($lines as $line) {
    $trimmed = trim($line);
    if (empty($trimmed) || str_starts_with($trimmed, '--')) continue;
    $cleanSql .= $line . "\n";
}

$statements = array_filter(array_map('trim', explode(';', $cleanSql)));

$count = 0;
foreach ($statements as $stmt) {
    if (!empty($stmt)) {
        try {
            $pdo->exec($stmt);
            $count++;
        } catch (\Throwable $e) {
            echo "Warning on statement: " . $e->getMessage() . "\n";
        }
    }
}

echo "Database rebuild complete. Processed {$count} statements.\n";
