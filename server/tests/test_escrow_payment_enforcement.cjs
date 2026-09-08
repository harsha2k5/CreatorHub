const assert = require('assert');
const { initDB, queryOne, run } = require('../db/database.cjs');
const PaymentService = require('../services/PaymentService.cjs');

async function testEscrowPaymentEnforcement() {
    console.log('🧪 Running Test: Razorpay Escrow Payment Enforcement Before Approval...');
    await initDB();

    const brand = queryOne("SELECT id, user_id FROM brand_profiles LIMIT 1");
    const creator = queryOne("SELECT id, user_id FROM creator_profiles LIMIT 1");
    const campaign = queryOne("SELECT id, reward_per_creator FROM campaigns LIMIT 1");

    assert(brand, 'Brand profile must exist');
    assert(creator, 'Creator profile must exist');
    assert(campaign, 'Campaign must exist');

    const collabId = `collab_enf_${Date.now()}`;
    const reward = campaign.reward_per_creator || 5000;

    const appId = `app_enf_${Date.now()}`;
    run(
        `INSERT INTO campaign_applications (id, campaign_id, creator_id, brand_id, pitch, status)
         VALUES (?, ?, ?, ?, 'Looking forward to working together!', 'ACCEPTED')`,
        [appId, campaign.id, creator.id, brand.id]
    );

    // 1. Create collaboration in ACCEPTED state without funded escrow
    run(
        `INSERT INTO collaborations (id, campaign_id, application_id, brand_id, creator_id, status, current_step)
         VALUES (?, ?, ?, ?, ?, 'ACCEPTED', 1)`,
        [collabId, campaign.id, appId, brand.id, creator.id]
    );

    // Also record deliverable submitted by creator
    run(
        `INSERT INTO deliverables (id, collaboration_id, live_post_url, status)
         VALUES (?, ?, 'https://instagram.com/p/proof123', 'SUBMITTED')`,
        [`del_${Date.now()}`, collabId]
    );

    console.log('  1. Testing rejection of releaseEscrow when payment is unfunded...');
    let threwError = false;
    try {
        await PaymentService.releaseEscrow(collabId);
    } catch (err) {
        threwError = true;
        assert(err.message.includes('Payment required') || err.message.includes('Escrow has not been funded'), 'Must throw payment required error');
    }
    assert.strictEqual(threwError, true, 'releaseEscrow must reject if escrow is unfunded');
    console.log('  ✓ releaseEscrow correctly rejected unfunded collaboration.');

    // 2. Fund escrow via Razorpay order creation and verification
    console.log('  2. Creating Razorpay order and funding escrow via verifyPayment...');
    const orderRes = await PaymentService.createOrder({
        collaborationId: collabId,
        brandUserId: brand.user_id
    });
    assert(orderRes.success, 'Order creation must succeed');
    assert(orderRes.order_id, 'Must return order ID');

    const simPaymentId = `pay_sim_${Date.now()}_test`;
    const verifyRes = await PaymentService.verifyPayment({
        collaborationId: collabId,
        brandUserId: brand.user_id,
        razorpay_order_id: orderRes.order_id,
        razorpay_payment_id: simPaymentId,
        razorpay_signature: 'test_simulated_sig'
    });
    assert.strictEqual(verifyRes.success, true, 'Payment verification must succeed');
    assert.strictEqual(verifyRes.status, 'ESCROW_LOCKED', 'Status must be ESCROW_LOCKED');

    const updatedCollab = queryOne('SELECT status FROM collaborations WHERE id = ?', [collabId]);
    assert.strictEqual(updatedCollab.status, 'ESCROW_LOCKED', 'Collaboration status must be ESCROW_LOCKED');
    console.log('  ✓ Escrow successfully funded and locked via Razorpay verification.');

    // 3. Deliverable approval & escrow release now succeeds
    console.log('  3. Testing escrow release now that payment is verified...');
    const releaseRes = await PaymentService.releaseEscrow(collabId);
    assert.strictEqual(releaseRes.success, true);
    assert.strictEqual(releaseRes.status, 'RELEASED');

    const paymentRow = queryOne('SELECT status FROM payments WHERE collaboration_id = ? ORDER BY created_at DESC LIMIT 1', [collabId]);
    assert.strictEqual(paymentRow.status, 'RELEASED');
    console.log('  ✓ Escrow successfully released to creator after verification.');

    console.log('✅ Escrow Payment Enforcement Test Passed Successfully!');
}

if (require.main === module) {
    testEscrowPaymentEnforcement()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('❌ Test failed:', err);
            process.exit(1);
        });
}

module.exports = testEscrowPaymentEnforcement;
