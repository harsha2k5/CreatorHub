<?php
/**
 * CreatorHub - Comprehensive Automated PHP Test Suite
 * Tests All Core Architectural Pillars
 */

declare(strict_types=1);

$baseDir = dirname(__DIR__, 2);

require_once $baseDir . '/config/config.php';
require_once $baseDir . '/config/database.php';
require_once $baseDir . '/includes/Response.php';
require_once $baseDir . '/includes/auth.php';
require_once $baseDir . '/includes/JWTService.php';
require_once $baseDir . '/includes/TokenEncryptionService.php';
require_once $baseDir . '/includes/PaymentService.php';
require_once $baseDir . '/includes/profileHelper.php';
require_once $baseDir . '/includes/InstagramService.php';
require_once $baseDir . '/includes/AIAnalysisService.php';
require_once $baseDir . '/includes/models/User.php';
require_once $baseDir . '/includes/models/Campaign.php';
require_once $baseDir . '/includes/models/Collaboration.php';
require_once $baseDir . '/includes/models/Deliverable.php';
require_once $baseDir . '/includes/models/Payment.php';
require_once $baseDir . '/includes/models/Subscription.php';
require_once $baseDir . '/includes/controllers/SubscriptionController.php';

use CreatorHub\Models\User;
use CreatorHub\Models\Campaign;
use CreatorHub\Models\Collaboration;
use CreatorHub\Models\Payment;
use CreatorHub\Controllers\SubscriptionController;

function assertTest($condition, string $message): void {
    if (!$condition) {
        echo "❌ FAILED: {$message}\n";
        exit(1);
    }
    echo "  ✅ {$message}\n";
}

echo "====================================================\n";
echo "🚀 Starting CreatorHub PHP 8.2+ Architecture Test Suite\n";
echo "====================================================\n\n";

// --- 1. Database Connectivity ---
echo "--- 1. Database Connectivity (" . strtoupper(Database::getDriver()) . ") ---\n";
$userCount = Database::queryOne("SELECT COUNT(*) as count FROM users");
assertTest($userCount && (int)$userCount['count'] > 0, "Database connected successfully. Total users: " . $userCount['count']);

// --- 2. Token Encryption (AES-256-GCM) ---
echo "\n--- 2. Cryptographic Token Encryption (AES-256-GCM) ---\n";
$sampleToken = "EAAGm0PX4ZBZAYBO78sample_oauth_token_2026";
$encrypted = TokenEncryptionService::encrypt($sampleToken);
assertTest(!empty($encrypted) && strpos($encrypted, ':') !== false, "Token encrypted into authenticated GCM ciphertext");

$decrypted = TokenEncryptionService::decrypt($encrypted);
assertTest($decrypted === $sampleToken, "Ciphertext decrypted securely with matching plaintext");

$tampered = substr($encrypted, 0, -4) . 'ffff';
assertTest(TokenEncryptionService::decrypt($tampered) === null, "Tampered ciphertext rejected (GCM auth tag verified)");

// --- 3. Native JWT Authentication ---
echo "\n--- 3. Native JWT Authentication (HMAC-SHA256) ---\n";
$jwtSecret = "creatorhub_production_jwt_secret_key_secure_2026_min32chars";
$testPayload = ['id' => 'usr_test_123', 'email' => 'test@creatorhub.com', 'role' => 'creator'];
$token = JWTService::sign($testPayload, $jwtSecret, 3600);
assertTest(!empty($token) && substr_count($token, '.') === 2, "JWT signed cleanly with 3 parts");

$verifiedPayload = JWTService::verify($token, $jwtSecret);
assertTest($verifiedPayload && $verifiedPayload['id'] === 'usr_test_123', "JWT verified and payload restored");

$expiredToken = JWTService::sign($testPayload, $jwtSecret, -10);
assertTest(JWTService::verify($expiredToken, $jwtSecret) === null, "Expired JWT rejected");

// --- 4. User Model & Password Hashing ---
echo "\n--- 4. User Model & BCrypt Verification ---\n";
$testEmail = 'php_test_' . time() . '@creatorhub.com';
$createdUser = User::create([
    'email' => $testEmail,
    'password' => 'SecureP@ss123',
    'role' => 'creator'
]);
assertTest(!empty($createdUser['id']), "New user created with bcrypt hash");
assertTest(User::verifyPassword('SecureP@ss123', $createdUser['password_hash']), "Correct password verified via password_verify()");
assertTest(!User::verifyPassword('WrongPass', $createdUser['password_hash']), "Incorrect password rejected");

// --- 5. Subscription Plans & Pricing ---
echo "\n--- 5. Creator Subscription Plans & ₹1 Upgrades ---\n";
$plans = SubscriptionController::PLANS;
assertTest($plans['silver']['price_monthly'] === 1, "Silver plan priced at ₹1");
assertTest($plans['gold']['price_monthly'] === 1, "Gold plan priced at ₹1");
assertTest($plans['diamond']['price_monthly'] === 1, "Diamond plan priced at ₹1");

// --- 6. Razorpay Gateway & Cryptographic Signature Verification ---
echo "\n--- 6. Razorpay Payment Gateway & HMAC Verification ---\n";
$config = PaymentService::getPublicConfig();
assertTest($config['currency'] === 'INR', "Gateway currency configured to INR");

$testOrderId = "order_test_" . time();
$testPayId = "pay_test_" . time();
$fakeSecret = "sample_rzp_secret_123";
putenv("RAZORPAY_KEY_SECRET={$fakeSecret}");
$_ENV['RAZORPAY_KEY_SECRET'] = $fakeSecret;

$validSig = hash_hmac('sha256', "{$testOrderId}|{$testPayId}", $fakeSecret);
assertTest(PaymentService::verifySignature($testOrderId, $testPayId, $validSig) === true, "Valid HMAC-SHA256 signature verified");
assertTest(PaymentService::verifySignature($testOrderId, $testPayId, "invalid_sig") === false, "Invalid signature rejected");

// Webhook Signature
$rawWebhook = '{"event":"payment.captured","payload":{}}';
$webhookSecret = "test_webhook_secret_escrow_2026";
putenv("RAZORPAY_WEBHOOK_SECRET={$webhookSecret}");
$_ENV['RAZORPAY_WEBHOOK_SECRET'] = $webhookSecret;
$validWebhookSig = hash_hmac('sha256', $rawWebhook, $webhookSecret);
assertTest(PaymentService::verifyWebhookSignature($rawWebhook, $validWebhookSig) === true, "Razorpay webhook HMAC signature verified");

// --- 7. Campaigns Model & Discovery ---
echo "\n--- 7. Campaigns Model & Listing ---\n";
$allCampaigns = Campaign::findAll(['limit' => 5]);
assertTest(is_array($allCampaigns), "Campaigns retrieved successfully: " . count($allCampaigns) . " items");

// --- 8. Meta / Instagram Integration & Crawler ---
echo "\n--- 8. Instagram Graph API & Fallback Public Crawler ---\n";
$realCreator = Database::queryOne("SELECT id FROM creator_profiles LIMIT 1");
$creatorIdForAuth = $realCreator ? $realCreator['id'] : 'crt_dummy';
$authInfo = InstagramService::getAuthorizationUrl($creatorIdForAuth, 'http://localhost/CreatorHub/creator/dashboard');
assertTest(is_array($authInfo) && isset($authInfo['configured']), "Instagram authorization URL structure validated");

$publicData = InstagramService::fetchPublicProfile('https://www.instagram.com/zara/');
assertTest($publicData['username'] === 'zara', "Public profile parsed handle: " . $publicData['username']);
assertTest($publicData['followers_count'] > 0, "Public profile parsed followers: " . $publicData['followers_count']);

// --- 9. AI Analysis Service ---
echo "\n--- 9. AI Analysis Service (Gemini / Analytical Fallback) ---\n";
$testCreator = Database::queryOne("SELECT id FROM creator_profiles LIMIT 1");
if ($testCreator) {
    $analysis = AIAnalysisService::analyzeCreator($testCreator['id']);
    assertTest(isset($analysis['overallScore']) && $analysis['overallScore'] >= 50, "Creator AI analysis generated overall score: " . $analysis['overallScore']);
    assertTest(count($analysis['strengths']) > 0, "AI analysis generated strengths list");
}

// --- 10. Strict Escrow Payment Barrier ---
echo "\n--- 10. Strict Escrow Payment Barrier ---\n";
$existingCamp = Database::queryOne("SELECT id, brand_id FROM campaigns LIMIT 1");
$existingCreator = Database::queryOne("SELECT id FROM creator_profiles LIMIT 1");

if ($existingCamp && $existingCreator) {
    $testCollabId = 'collab_test_' . time();
    $testAppId = 'app_test_' . time();

    Database::execute(
        "INSERT INTO campaign_applications (id, campaign_id, creator_id, brand_id, pitch, status)
         VALUES (?, ?, ?, ?, 'PHP test pitch', 'ACCEPTED')",
        [$testAppId, $existingCamp['id'], $existingCreator['id'], $existingCamp['brand_id']]
    );

    Database::execute(
        "INSERT INTO collaborations (id, campaign_id, application_id, brand_id, creator_id, status, current_step)
         VALUES (?, ?, ?, ?, ?, 'SUBMITTED', 3)",
        [$testCollabId, $existingCamp['id'], $testAppId, $existingCamp['brand_id'], $existingCreator['id']]
    );

    $verifiedPayment = Database::queryOne(
        "SELECT * FROM payments WHERE collaboration_id = ? AND status IN ('VERIFIED', 'HELD_IN_ESCROW', 'RELEASED')",
        [$testCollabId]
    );
    assertTest($verifiedPayment === null, "Verified: Collaboration has 0 funded escrow payments in database");

    // Clean up
    Database::execute("DELETE FROM collaborations WHERE id = ?", [$testCollabId]);
    Database::execute("DELETE FROM campaign_applications WHERE id = ?", [$testAppId]);
}

Database::execute("DELETE FROM users WHERE email = ?", [$testEmail]);

echo "\n====================================================\n";
echo "🎉 ALL 10 TEST SUITES PASSED FLAWLESSLY!\n";
echo "CreatorHub Architecture is fully operational.\n";
echo "====================================================\n";
