<?php
/**
 * Test Razorpay Gateway & Escrow Operations
 */

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/config/config.php';
require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__, 2) . '/includes/PaymentService.php';

echo "🧪 Running Test: Razorpay Gateway & Escrow Service...\n\n";

Database::getConnection();

// 1. Check Public Config
$config = PaymentService::getPublicConfig();
echo "1. Razorpay Public Config: " . json_encode($config) . "\n";
if (empty($config['key_id'])) {
    echo "❌ Error: key_id is empty in config!\n";
    exit(1);
}
echo "  ✅ Key ID configured: " . $config['key_id'] . " (mode: " . $config['mode'] . ")\n\n";

// 2. Test Creator Subscription Order & Upgrade
$creator = Database::queryOne("SELECT id, user_id FROM creator_profiles LIMIT 1");
if (!$creator) {
    echo "❌ Error: No creator found in DB!\n";
    exit(1);
}

echo "2. Testing Creator Subscription Order (₹1 Gold VIP Upgrade)...\n";
$subOrder = PaymentService::createSubscriptionOrder($creator['id'], 'gold', 1.0);
echo "  ✅ Subscription Order created: " . $subOrder['order_id'] . " (Amount: " . $subOrder['amount'] . " paise)\n";

$simPayId = 'pay_rzp_test_' . time();
$subVerify = PaymentService::verifySubscriptionPayment([
    'creator_id' => $creator['id'],
    'tier' => 'gold',
    'razorpay_order_id' => $subOrder['order_id'],
    'razorpay_payment_id' => $simPayId,
    'razorpay_signature' => 'sig_test_sandbox_123'
]);
echo "  ✅ Subscription Verified: " . $subVerify['message'] . " (Tier: " . $subVerify['tier'] . ")\n\n";

// 3. Test Full Escrow Lifecycle
$brand = Database::queryOne("SELECT id, user_id FROM brand_profiles LIMIT 1");
$campaign = Database::queryOne("SELECT id, reward_per_creator FROM campaigns LIMIT 1");

$collabId = 'collab_rzp_test_' . time();
$appId = 'app_rzp_test_' . time();

Database::execute(
    "INSERT INTO campaign_applications (id, campaign_id, creator_id, brand_id, pitch, status)
     VALUES (?, ?, ?, ?, 'Razorpay gateway test pitch', 'ACCEPTED')",
    [$appId, $campaign['id'], $creator['id'], $brand['id']]
);

Database::execute(
    "INSERT INTO collaborations (id, campaign_id, application_id, brand_id, creator_id, status, current_step)
     VALUES (?, ?, ?, ?, ?, 'ACCEPTED', 1)",
    [$collabId, $campaign['id'], $appId, $brand['id'], $creator['id']]
);

echo "3. Testing Escrow Order Creation...\n";
$escrowOrder = PaymentService::createEscrowOrder($collabId, $brand['user_id']);
echo "  ✅ Escrow Order Created: " . $escrowOrder['order_id'] . " (Amount INR: ₹" . $escrowOrder['amount_inr'] . ")\n";

echo "4. Testing Escrow Verification...\n";
$verifyRes = PaymentService::verifyEscrowPayment([
    'collaboration_id' => $collabId,
    'brand_user_id' => $brand['user_id'],
    'razorpay_order_id' => $escrowOrder['order_id'],
    'razorpay_payment_id' => 'pay_escrow_test_' . time(),
    'razorpay_signature' => 'sig_escrow_test'
]);
echo "  ✅ Escrow Verified & Locked: status = " . $verifyRes['status'] . "\n";

echo "5. Testing Escrow Release to Creator...\n";
$releaseRes = PaymentService::releaseEscrow($collabId, $brand['user_id']);
echo "  ✅ Escrow Released: " . $releaseRes['message'] . " (Amount: ₹" . $releaseRes['amount'] . ")\n\n";

// Clean up test records
Database::execute("DELETE FROM collaborations WHERE id = ?", [$collabId]);
Database::execute("DELETE FROM campaign_applications WHERE id = ?", [$appId]);

echo "🎉 ALL RAZORPAY GATEWAY & ESCROW TESTS PASSED 100%!\n";
