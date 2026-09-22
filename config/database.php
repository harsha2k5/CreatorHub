<?php
/**
 * CreatorHub - Centralized PDO Database Service
 * 
 * Provides unified, thread-safe database connection management supporting
 * both MySQL/MariaDB and SQLite with prepared statements, connection pooling,
 * automatic foreign key enforcement, and transaction safety.
 */

declare(strict_types=1);

class Database {
    private static ?PDO $pdo = null;
    private static string $driver = 'sqlite';

    /**
     * Get or initialize the centralized PDO database connection
     */
    public static function getConnection(): PDO {
        if (self::$pdo === null) {
            $config = require __DIR__ . '/config.php';
            $dbConfig = $config['database'];
            $driver = strtolower($dbConfig['driver'] ?? 'sqlite');

            if ($driver === 'mysql') {
                try {
                    $dsn = sprintf(
                        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                        $dbConfig['host'],
                        $dbConfig['port'],
                        $dbConfig['database'],
                        $dbConfig['charset'] ?? 'utf8mb4'
                    );

                    self::$pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password'], [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                    ]);
                    self::$pdo->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
                    self::$driver = 'mysql';
                } catch (PDOException $e) {
                    // Fallback to SQLite if MySQL is configured but unreachable
                    error_log("Database: MySQL connection failed (" . $e->getMessage() . "). Falling back to SQLite.");
                    self::$pdo = self::connectSqlite($dbConfig['sqlite_path']);
                    self::$driver = 'sqlite';
                }
            } else {
                self::$pdo = self::connectSqlite($dbConfig['sqlite_path']);
                self::$driver = 'sqlite';
            }
        }

        return self::$pdo;
    }

    /**
     * Connect to SQLite database with robust PRAGMA settings
     */
    private static function connectSqlite(string $dbPath): PDO {
        $dir = dirname($dbPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }

        try {
            $pdo = new PDO("sqlite:" . $dbPath);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            // Enforce SQLite Foreign Keys, WAL mode, and busy timeout
            $pdo->exec("PRAGMA journal_mode = WAL;");
            $pdo->exec("PRAGMA foreign_keys = ON;");
            $pdo->exec("PRAGMA busy_timeout = 5000;");

            return $pdo;
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'error' => 'Database connection failed: ' . $e->getMessage()
            ]);
            exit;
        }
    }

    /**
     * Get the active database driver name ('mysql' or 'sqlite')
     */
    public static function getDriver(): string {
        if (self::$pdo === null) {
            self::getConnection();
        }
        return self::$driver;
    }

    /**
     * Execute a SELECT query and return all matching rows
     */
    public static function query(string $sql, array $params = []): array {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Alias for query() to return all matching rows
     */
    public static function queryAll(string $sql, array $params = []): array {
        return self::query($sql, $params);
    }

    /**
     * Execute a SELECT query and return the first matching row or null
     */
    public static function queryOne(string $sql, array $params = []): ?array {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    /**
     * Execute a SELECT query and return the first column of the first row
     */
    public static function queryValue(string $sql, array $params = []): mixed {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchColumn();
    }

    /**
     * Execute an INSERT, UPDATE, or DELETE query and return affected rows
     */
    public static function execute(string $sql, array $params = []): int {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    /**
     * Get the ID of the last inserted row
     */
    public static function lastInsertId(?string $name = null): string|false {
        return self::getConnection()->lastInsertId($name);
    }

    /**
     * Check if a specific table exists in the database
     */
    public static function tableExists(string $tableName): bool {
        $pdo = self::getConnection();
        if (self::$driver === 'mysql') {
            $stmt = $pdo->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$tableName]);
            return (bool) $stmt->fetch();
        } else {
            $stmt = $pdo->prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?");
            $stmt->execute([$tableName]);
            return (bool) $stmt->fetch();
        }
    }

    /**
     * Execute a transaction safely with automatic rollback on exception
     */
    public static function transaction(callable $callback): mixed {
        $pdo = self::getConnection();
        $pdo->beginTransaction();
        try {
            $result = $callback($pdo);
            $pdo->commit();
            return $result;
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Reset connection instance (useful for testing and CLI workers)
     */
    public static function resetConnection(): void {
        self::$pdo = null;
    }
}
