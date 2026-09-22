<?php
/**
 * Test Escrow Payment Enforcement Before Approval (PHP Architecture)
 */

declare(strict_types=1);

$baseDir = dirname(__DIR__, 2);
require_once $baseDir . '/config/config.php';
require_once $baseDir . '/config/database.php';
require_once $baseDir . '/includes/PaymentService.php';

function assertEnforceTest($cond, $msg) {
    if (!$cond) {
        echo "❌ FAILED: {$msg}\n";
        exit(1);
    }
    echo "  ✅ {$msg}\n";
}

echo "🧪 Running Test: PHP Escrow Payment Enforcement Before Approval...\n\n";

$brand = Database::queryOne("SELECT id, user_id FROM brand_profiles LIMIT 1");
$creator = Database::queryOne("SELECT id, user_id FROM creator_profiles LIMIT 1");
$campaign = Database::queryOne("SELECT id, reward_per_creator FROM campaigns LIMIT 1");

assertEnforceTest($brand && $creator && $campaign, "Brand, Creator, and Campaign exist in database");

$collabId = 'collab_php_enf_' . round(microtime(true) * 1000);
$reward = $campaign['reward_per_creator'] ?: 5000;

$appId = 'app_php_enf_' . round(microtime(true) * 1000);
Database::execute(
    "INSERT INTO campaign_applications (id, campaign_id, creator_id, brand_id, pitch, status)
     VALUES (?, ?, ?, ?, 'PHP test pitch', 'ACCEPTED')",
    [$appId, $campaign['id'], $creator['id'], $brand['id']]
);

// 1. Create collaboration in ACCEPTED state without funded escrow
Database::execute(
    "INSERT INTO collaborations (id, campaign_id, application_id, brand_id, creator_id, status, current_step)
     VALUES (?, ?, ?, ?, ?, 'ACCEPTED', 1)",
    [$collabId, $campaign['id'], $appId, $brand['id'], $creator['id']]
);

Database::execute(
    "INSERT INTO deliverables (id, collaboration_id, live_post_url, status)
     VALUES (?, ?, 'https://instagram.com/p/phptest123', 'SUBMITTED')",
    ['del_php_' . round(microtime(true) * 1000), $collabId]
);

echo "--- 1. Testing releaseEscrow on unfunded collaboration ---\n";
$caught = false;
try {
    PaymentService::releaseEscrow($collabId, $brand['user_id']);
} catch (\Throwable $e) {
    $caught = true;
    assertEnforceTest(str_contains($e->getMessage(), 'Payment required'), "Throws Payment required exception: " . $e->getMessage());
}
assertEnforceTest($caught, "releaseEscrow correctly rejected unfunded collaboration");

echo "\n--- 2. Funding escrow via Razorpay order & verification ---\n";
$orderRes = PaymentService::createEscrowOrder($collabId, $brand['user_id']);
assertEnforceTest(!empty($orderRes['order_id']), "Razorpay order created with ID: " . $orderRes['order_id']);

$simPaymentId = 'pay_sim_' . round(microtime(true) * 1000);
$verifyRes = PaymentService::verifyEscrowPayment([
    'collaboration_id' => $collabId,
    'brand_user_id' => $brand['user_id'],
    'razorpay_order_id' => $orderRes['order_id'],
    'razorpay_payment_id' => $simPaymentId,
    'razorpay_signature' => 'test_simulated_sig'
]);
assertEnforceTest($verifyRes['success'] && $verifyRes['status'] === 'ESCROW_LOCKED', "Payment verified and status is ESCROW_LOCKED");

$collabRow = Database::queryOne("SELECT status FROM collaborations WHERE id = ?", [$collabId]);
assertEnforceTest($collabRow['status'] === 'ESCROW_LOCKED', "Collaboration DB status updated to ESCROW_LOCKED");

echo "\n--- 3. Approving and releasing escrow after verification ---\n";
$releaseRes = PaymentService::releaseEscrow($collabId, $brand['user_id']);
assertEnforceTest($releaseRes['success'], "Escrow release succeeded after verification");

$paymentRow = Database::queryOne("SELECT status FROM payments WHERE collaboration_id = ? ORDER BY created_at DESC LIMIT 1", [$collabId]);
assertEnforceTest($paymentRow['status'] === 'RELEASED', "Payment DB status updated to RELEASED");

// Clean up
Database::execute("DELETE FROM collaborations WHERE id = ?", [$collabId]);
Database::execute("DELETE FROM campaign_applications WHERE id = ?", [$appId]);

echo "\n✅ All PHP Escrow Payment Enforcement Tests Passed Successfully!\n";
