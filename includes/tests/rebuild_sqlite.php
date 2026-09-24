<?php
/**
 * Rebuild SQLite database from schema.sqlite.sql and database.sql
 */

declare(strict_types=1);

$root = dirname(__DIR__, 2);
require_once $root . '/config/config.php';

$dbPath = $root . '/database.sqlite';
$schemaPath = $root . '/config/schema.sqlite.sql';
$sqlPath = $root . '/database.sql';

if (file_exists($dbPath)) {
    unlink($dbPath);
}

$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec('PRAGMA foreign_keys = OFF');
$pdo->exec('PRAGMA journal_mode = WAL');

echo "Applying SQLite schema from config/schema.sqlite.sql...\n";
$schemaSql = file_get_contents($schemaPath);
$pdo->exec($schemaSql);
echo "Schema applied successfully.\n";

echo "Parsing INSERT statements from database.sql...\n";
$sql = file_get_contents($sqlPath);

$len = strlen($sql);
$inString = false;
$stringChar = '';
$escaped = false;
$current = '';
$statements = [];

for ($i = 0; $i < $len; $i++) {
    $char = $sql[$i];

    if ($inString) {
        if ($escaped) {
            if ($char === "'") {
                $current .= "''";
            } elseif ($char === '"') {
                $current .= '"';
            } elseif ($char === '\\') {
                $current .= '\\\\';
            } elseif ($char === 'n') {
                $current .= "\\n";
            } elseif ($char === 'r') {
                $current .= "\\r";
            } elseif ($char === 't') {
                $current .= "\\t";
            } else {
                $current .= $char;
            }
            $escaped = false;
        } elseif ($char === '\\') {
            $escaped = true;
        } elseif ($char === $stringChar) {
            $inString = false;
            $current .= $char;
        } else {
            $current .= $char;
        }
    } else {
        if ($char === "'" || $char === '"') {
            $inString = true;
            $stringChar = $char;
            $current .= $char;
        } elseif ($char === ';') {
            $trimmed = trim($current);
            if (!empty($trimmed)) {
                $statements[] = $trimmed;
            }
            $current = '';
        } elseif ($char === '-' && $i + 1 < $len && $sql[$i + 1] === '-') {
            $eol = strpos($sql, "\n", $i);
            if ($eol === false) break;
            $i = $eol;
        } else {
            $current .= $char;
        }
    }
}

if (!empty(trim($current))) {
    $statements[] = trim($current);
}

echo "Found " . count($statements) . " total statements in database.sql.\n";

$pdo->beginTransaction();
$insertCount = 0;
$errorCount = 0;

foreach ($statements as $stmt) {
    if (stripos($stmt, 'INSERT INTO') === 0) {
        try {
            $pdo->exec($stmt);
            $insertCount++;
        } catch (\Throwable $e) {
            $errorCount++;
            echo "Error on INSERT (" . substr($stmt, 0, 80) . "...): " . $e->getMessage() . "\n";
        }
    }
}

$pdo->commit();
$pdo->exec('PRAGMA foreign_keys = ON');

echo "Finished importing data: {$insertCount} INSERT statements executed, {$errorCount} errors.\n";

// Show summary of row counts
$tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")->fetchAll(PDO::FETCH_COLUMN);
echo "=== Table Summary ===\n";
foreach ($tables as $t) {
    $c = $pdo->query("SELECT COUNT(*) FROM \"{$t}\"")->fetchColumn();
    echo sprintf(" - %-25s: %d rows\n", $t, $c);
}
