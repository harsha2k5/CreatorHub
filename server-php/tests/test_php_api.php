<?php
/**
 * CreatorHub PHP Backend - Automated Integration Test Suite
 * Run via: php server-php/tests/test_php_api.php
 */

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/services/JWTService.php';
require_once dirname(__DIR__) . '/services/TokenEncryptionService.php';
require_once dirname(__DIR__) . '/services/PaymentService.php';
require_once dirname(__DIR__) . '/services/profileHelper.php';
require_once dirname(__DIR__) . '/routes/subscriptions.php';

function assertCustom($condition, $message) {
    if (!$condition) {
        echo "❌ FAILED: {$message}\n";
        exit(1);
    }
    echo "  ✅ {$message}\n";
}

echo "🧪 Starting CreatorHub PHP Backend Test Suite...\n\n";

// --- 1. Database Connection ---
echo "--- 1. Database Connectivity (SQLite WAL) ---\n";
$userCount = Database::queryOne("SELECT COUNT(*) as count FROM users");
assertCustom($userCount && $userCount['count'] > 0, "Database connected. Total users: " . $userCount['count']);

// --- 2. Token Encryption (AES-256-GCM) ---
echo "\n--- 2. Cryptographic Token Encryption (AES-256-GCM) ---\n";
$sampleToken = "EAAGm0PX4ZBZAYBO78sample_oauth_token_2026";
$encrypted = TokenEncryptionService::encrypt($sampleToken);
assertCustom(!empty($encrypted) && strpos($encrypted, ':') !== false, "Token encrypted into authenticated GCM ciphertext");

$decrypted = TokenEncryptionService::decrypt($encrypted);
assertCustom($decrypted === $sampleToken, "Ciphertext decrypted securely with matching plaintext");

$tampered = substr($encrypted, 0, -4) . 'ffff';
assertCustom(TokenEncryptionService::decrypt($tampered) === null, "Tampered ciphertext rejected (GCM auth tag verified)");

// --- 3. Native JWT Token Sign & Verify ---
echo "\n--- 3. Native JWT Authentication (HMAC-SHA256) ---\n";
$jwtSecret = "creatorhub_development_jwt_secret_key_12345";
$testPayload = ['id' => 'usr_test_123', 'email' => 'test@creatorhub.com', 'role' => 'creator'];
$token = JWTService::sign($testPayload, $jwtSecret, 3600);
assertCustom(!empty($token) && substr_count($token, '.') === 2, "JWT signed cleanly with 3 parts");

$verifiedPayload = JWTService::verify($token, $jwtSecret);
assertCustom($verifiedPayload && $verifiedPayload['id'] === 'usr_test_123', "JWT verified and payload restored");

$expiredToken = JWTService::sign($testPayload, $jwtSecret, -10);
assertCustom(JWTService::verify($expiredToken, $jwtSecret) === null, "Expired JWT rejected");

// --- 4. Subscriptions Pricing & Logic ---
echo "\n--- 4. Creator Subscription Plans & ₹1 Upgrades ---\n";
assertCustom(SUBSCRIPTION_PLANS['silver']['price_monthly'] === 1, "Silver plan priced at ₹1");
assertCustom(SUBSCRIPTION_PLANS['gold']['price_monthly'] === 1, "Gold plan priced at ₹1");
assertCustom(SUBSCRIPTION_PLANS['diamond']['price_monthly'] === 1, "Diamond plan priced at ₹1");

// Test creator profile auto-heal
$creatorUser = Database::queryOne("SELECT * FROM users WHERE email = 'creator@creatorhub.com'");
assertCustom(!empty($creatorUser), "Test creator user exists in database");

$creatorProfile = getOrCreateCreatorProfile($creatorUser['id'], $creatorUser);
assertCustom(!empty($creatorProfile), "Creator profile verified/auto-healed: " . $creatorProfile['id']);

// --- 5. Razorpay Gateway & Signature Verification ---
echo "\n--- 5. Razorpay Payment Gateway & HMAC Verification ---\n";
$config = PaymentService::getPublicConfig();
assertCustom($config['currency'] === 'INR', "Gateway currency configured to INR");

$testOrderId = "order_test_" . time();
$testPayId = "pay_test_" . time();
$fakeSecret = "sample_rzp_secret_123";
putenv("RAZORPAY_KEY_SECRET={$fakeSecret}");
$_ENV['RAZORPAY_KEY_SECRET'] = $fakeSecret;

$validSig = hash_hmac('sha256', "{$testOrderId}|{$testPayId}", $fakeSecret);
assertCustom(PaymentService::verifySignature($testOrderId, $testPayId, $validSig) === true, "Valid HMAC-SHA256 signature verified");
assertCustom(PaymentService::verifySignature($testOrderId, $testPayId, "invalid_sig") === false, "Invalid signature rejected");

// --- 6. Creator Earnings API ---
echo "\n--- 6. Creator Earnings Calculations ---\n";
$earnings = PaymentService::getCreatorEarnings($creatorProfile['id']);
assertCustom(isset($earnings['total_earned']), "Earnings total returned: ₹" . $earnings['total_earned']);
assertCustom(isset($earnings['held_in_escrow']), "Held in escrow returned: ₹" . $earnings['held_in_escrow']);

echo "\n🎉 ALL CREATORHUB PHP BACKEND TESTS PASSED CLEANLY!\n";
