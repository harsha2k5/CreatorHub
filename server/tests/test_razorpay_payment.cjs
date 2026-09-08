/**
 * CreaterHub - Razorpay Production Payment & Escrow Test Suite
 * Validates:
 * 1. Create payment order
 * 2. Invalid amount rejection / tamper prevention
 * 3. Unauthorized brand rejection
 * 4. Invalid collaboration state rejection
 * 5. Successful server-side HMAC signature verification
 * 6. Invalid signature rejection (marks payment FAILED)
 * 7. Duplicate payment prevention (cannot lock twice)
 * 8. Webhook signature validation (raw body HMAC-SHA256)
 * 9. Duplicate webhook idempotency
 * 10. Failed payment webhook handling
 * 11. Successful transition to ESCROW_LOCKED
 */

const assert = require('assert');
const crypto = require('crypto');
const { initDB, queryOne, run } = require('../db/database.cjs');
const seed = require('../db/seed.cjs');
const PaymentService = require('../services/PaymentService.cjs');

async function testRazorpayPaymentSuite() {
    console.log('🧪 Starting Razorpay Payment & Escrow Test Suite...\n');

    process.env.RAZORPAY_KEY_ID = 'rzp_test_51creatorhub001';
    process.env.RAZORPAY_KEY_SECRET = 'test_secret_creatorhub_escrow_2026';
    process.env.RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret_escrow_2026';

    await initDB();
    await seed();

    // Fetch test brand and creator profiles
    const brand = queryOne("SELECT b.*, u.id as user_id FROM brand_profiles b JOIN users u ON b.user_id = u.id LIMIT 1");
    const otherBrand = queryOne("SELECT b.*, u.id as user_id FROM brand_profiles b JOIN users u ON b.user_id = u.id WHERE b.id != ? LIMIT 1", [brand.id]);
    const creator = queryOne("SELECT c.*, u.id as user_id FROM creator_profiles c JOIN users u ON c.user_id = u.id LIMIT 1");
    const campaign = queryOne("SELECT * FROM campaigns WHERE brand_id = ? LIMIT 1", [brand.id]);

    assert(brand, 'Test brand profile must exist');
    assert(otherBrand, 'Second test brand profile must exist for authorization tests');
    assert(creator, 'Test creator profile must exist');
    assert(campaign, 'Test campaign must exist');

    console.log('--- 1. Create Payment Order ---');
    const collabId1 = `collab_rzp_test_${Date.now()}_1`;
    const appId1 = `app_rzp_test_${Date.now()}_1`;

    run(
        `INSERT INTO campaign_applications (id, campaign_id, creator_id, brand_id, pitch, status)
         VALUES (?, ?, ?, ?, 'Pitch test 1', 'ACCEPTED')`,
        [appId1, campaign.id, creator.id, brand.id]
    );

    run(
        `INSERT INTO collaborations (id, campaign_id, application_id, brand_id, creator_id, status, current_step)
         VALUES (?, ?, ?, ?, ?, 'ACCEPTED', 1)`,
        [collabId1, campaign.id, appId1, brand.id, creator.id]
    );

    const orderRes = await PaymentService.createOrder({
        collaborationId: collabId1,
        brandUserId: brand.user_id
    });

    assert(orderRes.success, 'Order creation must succeed');
    assert(orderRes.order_id, 'Razorpay order_id must be generated');
    assert.strictEqual(orderRes.currency, 'INR');
    assert.strictEqual(orderRes.agreed_amount, Number(campaign.reward_per_creator));
    assert.strictEqual(orderRes.amount, Math.round(Number(campaign.reward_per_creator) * 100), 'Amount in paise must be 100x rupees');
    assert.strictEqual(orderRes.key_id, process.env.RAZORPAY_KEY_ID);
    console.log(`  ✅ Order created successfully: ${orderRes.order_id} (₹${orderRes.agreed_amount} / ${orderRes.amount} paise)`);

    console.log('--- 2. Invalid Amount / Tamper Prevention ---');
    // The server calculates amount strictly from database (campaign.reward_per_creator), ignoring client values
    const pendingPayment = queryOne("SELECT * FROM payments WHERE collaboration_id = ? AND status = 'PENDING'", [collabId1]);
    assert(pendingPayment, 'Pending payment row must be created');
    assert.strictEqual(pendingPayment.amount, Number(campaign.reward_per_creator));
    console.log('  ✅ Amount strictly calculated server-side from database records');

    console.log('--- 3. Unauthorized Brand Validation ---');
    let authErrorCaught = false;
    try {
        await PaymentService.createOrder({
            collaborationId: collabId1,
            brandUserId: otherBrand.user_id // Wrong brand trying to fund
        });
    } catch (err) {
        authErrorCaught = true;
        assert(err.message.includes('Unauthorized') || err.message.includes('Only the participating brand'), 'Must throw unauthorized error');
    }
    assert(authErrorCaught, 'Must reject order creation from unauthorized brand');
    console.log('  ✅ Unauthorized brand cannot fund other brand\'s collaboration');

    console.log('--- 4. Invalid Collaboration State Validation ---');
    const cancelledCollabId = `collab_cancelled_${Date.now()}`;
    run(
        `INSERT INTO collaborations (id, campaign_id, application_id, brand_id, creator_id, status, current_step)
         VALUES (?, ?, ?, ?, ?, 'CANCELLED', 1)`,
        [cancelledCollabId, campaign.id, appId1, brand.id, creator.id]
    );

    let stateErrorCaught = false;
    try {
        await PaymentService.createOrder({
            collaborationId: cancelledCollabId,
            brandUserId: brand.user_id
        });
    } catch (err) {
        stateErrorCaught = true;
        assert(err.message.includes('status') || err.message.includes('Cannot fund escrow'));
    }
    assert(stateErrorCaught, 'Must reject order creation on CANCELLED collaboration');
    console.log('  ✅ Rejected payment on invalid collaboration status (CANCELLED)');

    console.log('--- 5. Invalid Signature Rejection ---');
    let sigErrorCaught = false;
    try {
        await PaymentService.verifyPayment({
            collaborationId: collabId1,
            brandUserId: brand.user_id,
            razorpay_order_id: orderRes.order_id,
            razorpay_payment_id: 'pay_tampered_12345',
            razorpay_signature: 'fake_tampered_signature_9999'
        });
    } catch (err) {
        sigErrorCaught = true;
        assert(err.message.includes('verification failed') || err.message.includes('signature'));
    }
    assert(sigErrorCaught, 'Must reject fraudulent or tampered signature');

    const failedPayment = queryOne('SELECT * FROM payments WHERE collaboration_id = ?', [collabId1]);
    assert.strictEqual(failedPayment.status, 'FAILED', 'Payment status must be marked FAILED on invalid signature');
    assert(failedPayment.failure_reason, 'Failure reason must be logged');
    console.log('  ✅ Invalid signature rejected and payment marked FAILED');

    console.log('--- 6. Successful Server-Side Signature Verification ---');
    const validPaymentId = `pay_rzp_live_${Date.now()}`;
    const validSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderRes.order_id}|${validPaymentId}`)
        .digest('hex');

    const verifyRes = await PaymentService.verifyPayment({
        collaborationId: collabId1,
        brandUserId: brand.user_id,
        razorpay_order_id: orderRes.order_id,
        razorpay_payment_id: validPaymentId,
        razorpay_signature: validSignature
    });

    assert(verifyRes.success, 'Verification must succeed with authentic HMAC-SHA256 signature');
    assert.strictEqual(verifyRes.verified, true);
    assert.strictEqual(verifyRes.status, 'ESCROW_LOCKED');

    const verifiedPayment = queryOne('SELECT * FROM payments WHERE id = ?', [verifyRes.payment_id]);
    assert.strictEqual(verifiedPayment.status, 'VERIFIED');
    assert.strictEqual(verifiedPayment.razorpay_payment_id, validPaymentId);
    assert.strictEqual(verifiedPayment.razorpay_signature_verified, 1);
    assert(verifiedPayment.verified_at, 'verified_at timestamp must be recorded');
    assert(verifiedPayment.paid_at, 'paid_at timestamp must be recorded');
    console.log(`  ✅ Server successfully verified HMAC-SHA256 signature and marked payment VERIFIED`);

    console.log('--- 7. Successful Transition to ESCROW_LOCKED ---');
    const lockedCollab = queryOne('SELECT * FROM collaborations WHERE id = ?', [collabId1]);
    assert.strictEqual(lockedCollab.status, 'ESCROW_LOCKED', 'Collaboration state must transition to ESCROW_LOCKED');
    assert.strictEqual(lockedCollab.current_step, 2, 'Current step must advance to 2 (Work / Deliverables In Progress)');
    console.log('  ✅ Collaboration state transitioned to ESCROW_LOCKED and step advanced to 2');

    console.log('--- 8. Duplicate Payment Prevention ---');
    let duplicateErrorCaught = false;
    try {
        await PaymentService.createOrder({
            collaborationId: collabId1,
            brandUserId: brand.user_id
        });
    } catch (err) {
        duplicateErrorCaught = true;
        assert(err.message.includes('already been funded') || err.message.includes('locked'));
    }
    assert(duplicateErrorCaught, 'Must prevent creating duplicate payment orders for already locked escrow');

    // Also test idempotent verifyPayment
    const idempotentVerify = await PaymentService.verifyPayment({
        collaborationId: collabId1,
        brandUserId: brand.user_id,
        razorpay_order_id: orderRes.order_id,
        razorpay_payment_id: validPaymentId,
        razorpay_signature: validSignature
    });
    assert(idempotentVerify.success && idempotentVerify.verified, 'Idempotent verify must return success');
    assert(idempotentVerify.already_verified, 'Must indicate already verified');
    console.log('  ✅ Prevented duplicate escrow locking and supported idempotent verification');

    console.log('--- 9. Webhook Signature Validation ---');
    const webhookEventId1 = `evt_test_${Date.now()}_1`;
    const webhookCollabId = `collab_wh_${Date.now()}`;
    const webhookAppId = `app_wh_${Date.now()}`;
    const webhookOrderId = `order_wh_${Date.now()}`;

    run(
        `INSERT INTO campaign_applications (id, campaign_id, creator_id, brand_id, pitch, status)
         VALUES (?, ?, ?, ?, 'Webhook test', 'ACCEPTED')`,
        [webhookAppId, campaign.id, creator.id, brand.id]
    );
    run(
        `INSERT INTO collaborations (id, campaign_id, application_id, brand_id, creator_id, status, current_step)
         VALUES (?, ?, ?, ?, ?, 'ACCEPTED', 1)`,
        [webhookCollabId, campaign.id, webhookAppId, brand.id, creator.id]
    );
    run(
        `INSERT INTO payments (id, collaboration_id, brand_id, creator_id, amount, status, razorpay_order_id, transaction_ref)
         VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
        [`pay_wh_${Date.now()}`, webhookCollabId, brand.id, creator.id, 5000, webhookOrderId, `TXN_WH_${Date.now()}`]
    );

    const webhookPayloadObj = {
        id: webhookEventId1,
        entity: 'event',
        event: 'payment.captured',
        payload: {
            payment: {
                entity: {
                    id: `pay_captured_${Date.now()}`,
                    order_id: webhookOrderId,
                    amount: 500000,
                    currency: 'INR',
                    status: 'captured'
                }
            }
        }
    };
    const rawBodyBuffer = Buffer.from(JSON.stringify(webhookPayloadObj), 'utf8');

    // Test invalid webhook signature
    let invalidWhCaught = false;
    try {
        await PaymentService.processWebhook({
            rawBody: rawBodyBuffer,
            signature: 'invalid_webhook_signature',
            event: webhookPayloadObj
        });
    } catch (err) {
        invalidWhCaught = true;
        assert(err.message.includes('Invalid') && err.message.includes('signature'));
    }
    assert(invalidWhCaught, 'Must reject invalid webhook signature');
    console.log('  ✅ Rejected tampered webhook signature');

    // Test valid webhook signature
    const validWebhookSig = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBodyBuffer)
        .digest('hex');

    const whResult = await PaymentService.processWebhook({
        rawBody: rawBodyBuffer,
        signature: validWebhookSig,
        event: webhookPayloadObj
    });
    assert(whResult.success, 'Valid webhook must process successfully');
    assert.strictEqual(whResult.event, 'payment.captured');

    const whPayment = queryOne('SELECT * FROM payments WHERE razorpay_order_id = ?', [webhookOrderId]);
    assert.strictEqual(whPayment.status, 'VERIFIED');
    assert.strictEqual(whPayment.webhook_event_id, webhookEventId1);

    const whCollab = queryOne('SELECT * FROM collaborations WHERE id = ?', [webhookCollabId]);
    assert.strictEqual(whCollab.status, 'ESCROW_LOCKED');
    console.log('  ✅ Valid webhook signature verified and transitioned state to ESCROW_LOCKED');

    console.log('--- 10. Duplicate Webhook Idempotency ---');
    const duplicateWhResult = await PaymentService.processWebhook({
        rawBody: rawBodyBuffer,
        signature: validWebhookSig,
        event: webhookPayloadObj
    });
    assert(duplicateWhResult.success, 'Duplicate webhook must not crash');
    assert.strictEqual(duplicateWhResult.duplicate, true, 'Must identify duplicate event');
    console.log('  ✅ Duplicate webhook ignored idempotently without altering data');

    console.log('--- 11. Failed Payment Webhook Handling ---');
    const failedOrderId = `order_fail_${Date.now()}`;
    const failedCollabId = `collab_fail_${Date.now()}`;
    run(
        `INSERT INTO collaborations (id, campaign_id, application_id, brand_id, creator_id, status, current_step)
         VALUES (?, ?, ?, ?, ?, 'ACCEPTED', 1)`,
        [failedCollabId, campaign.id, webhookAppId, brand.id, creator.id]
    );
    run(
        `INSERT INTO payments (id, collaboration_id, brand_id, creator_id, amount, status, razorpay_order_id, transaction_ref)
         VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
        [`pay_fail_${Date.now()}`, failedCollabId, brand.id, creator.id, 5000, failedOrderId, `TXN_FAIL_${Date.now()}`]
    );

    const failedPayloadObj = {
        id: `evt_failed_${Date.now()}`,
        entity: 'event',
        event: 'payment.failed',
        payload: {
            payment: {
                entity: {
                    id: `pay_declined_${Date.now()}`,
                    order_id: failedOrderId,
                    error_description: 'Card declined by bank due to insufficient funds'
                }
            }
        }
    };
    const failedRawBody = Buffer.from(JSON.stringify(failedPayloadObj), 'utf8');
    const failedSig = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(failedRawBody)
        .digest('hex');

    const failedWhResult = await PaymentService.processWebhook({
        rawBody: failedRawBody,
        signature: failedSig,
        event: failedPayloadObj
    });
    assert(failedWhResult.success);

    const failedDbPayment = queryOne('SELECT * FROM payments WHERE razorpay_order_id = ?', [failedOrderId]);
    assert.strictEqual(failedDbPayment.status, 'FAILED');
    assert.strictEqual(failedDbPayment.failure_reason, 'Card declined by bank due to insufficient funds');
    console.log('  ✅ Failed payment webhook marked payment as FAILED with error description');

    console.log('\n======================================================');
    console.log('🎉 All 11 Razorpay Escrow Gateway Tests Passed Successfully!');
    console.log('======================================================\n');
}

if (require.main === module) {
    testRazorpayPaymentSuite().catch(err => {
        console.error('❌ Razorpay test suite failed:', err);
        process.exit(1);
    });
}

module.exports = testRazorpayPaymentSuite;
