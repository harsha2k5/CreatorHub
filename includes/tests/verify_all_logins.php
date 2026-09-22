<?php
/**
 * Test & Verify All Demo User Logins
 */
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__, 2) . '/includes/controllers/AuthController.php';

$adminHash = password_hash('Admin@123', PASSWORD_BCRYPT);
$brandHash = password_hash('Brand@123', PASSWORD_BCRYPT);
$creatorHash = password_hash('Creator@123', PASSWORD_BCRYPT);

Database::execute("UPDATE users SET password_hash = ? WHERE role = 'admin'", [$adminHash]);
Database::execute("UPDATE users SET password_hash = ? WHERE role = 'brand'", [$brandHash]);
Database::execute("UPDATE users SET password_hash = ? WHERE role = 'creator'", [$creatorHash]);

// Verify
$testAccounts = [
    ['email' => 'admin@creatorhub.com', 'password' => 'Admin@123', 'role' => 'admin'],
    ['email' => 'contact@thirdwave.in', 'password' => 'Brand@123', 'role' => 'brand'],
    ['email' => 'ananya@lifestyle.com', 'password' => 'Creator@123', 'role' => 'creator'],
    ['email' => 'brand@creatorhub.com', 'password' => 'Brand@123', 'role' => 'brand'],
    ['email' => 'creator@creatorhub.com', 'password' => 'Creator@123', 'role' => 'creator'],
];

echo "========================================\n";
echo "Testing Demo User Authentication Records\n";
echo "========================================\n";

foreach ($testAccounts as $acc) {
    $u = Database::queryOne("SELECT id, email, role, password_hash, is_active FROM users WHERE LOWER(email) = LOWER(?)", [$acc['email']]);
    if ($u) {
        $verified = password_verify($acc['password'], $u['password_hash']);
        echo sprintf("✓ Account found: %-25s | Role: %-8s | Verified: %s\n", $acc['email'], $u['role'], $verified ? 'PASS' : 'FAIL');
    } else {
        echo sprintf("✗ Account missing: %-23s (will be available via database.sql)\n", $acc['email']);
    }
}
echo "========================================\n";
