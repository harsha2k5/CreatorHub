/**
 * CreatorHub - Creator Subscription Upgrade Test Suite
 * Validates:
 * 1. Plan pricing: All tiers (Silver, Gold, Diamond) priced at ₹1 (1 INR)
 * 2. Razorpay order generation: Order amount strictly set to 100 paise (₹1)
 * 3. Upgrade execution: DB records transaction price of ₹1 and updates creator tier
 * 4. Creator quota & perks: Proper limits applied after ₹1 upgrade
 */

const assert = require('assert');
const express = require('express');
const jwt = require('jsonwebtoken');
const { initDB, queryOne, run } = require('../db/database.cjs');
const seed = require('../db/seed.cjs');
const { JWT_SECRET } = require('../middleware/auth.cjs');
const { router: subscriptionRouter, SUBSCRIPTION_PLANS } = require('../routes/subscriptions.cjs');

async function testSubscriptionUpgradeSuite() {
    console.log('🧪 Starting Creator Subscription ₹1 Upgrade Test Suite...\n');

    await initDB();
    await seed();

    // 1. Validate SUBSCRIPTION_PLANS static configuration
    console.log('--- 1. Verify Plan Upgrade Prices are ₹1 ---');
    assert.strictEqual(SUBSCRIPTION_PLANS.free.price_monthly, 0, 'Free plan should be 0');
    assert.strictEqual(SUBSCRIPTION_PLANS.free.price_yearly, 0, 'Free plan should be 0');

    assert.strictEqual(SUBSCRIPTION_PLANS.silver.price_monthly, 1, 'Silver monthly must be ₹1');
    assert.strictEqual(SUBSCRIPTION_PLANS.silver.price_yearly, 1, 'Silver yearly must be ₹1');

    assert.strictEqual(SUBSCRIPTION_PLANS.gold.price_monthly, 1, 'Gold monthly must be ₹1');
    assert.strictEqual(SUBSCRIPTION_PLANS.gold.price_yearly, 1, 'Gold yearly must be ₹1');

    assert.strictEqual(SUBSCRIPTION_PLANS.diamond.price_monthly, 1, 'Diamond monthly must be ₹1');
    assert.strictEqual(SUBSCRIPTION_PLANS.diamond.price_yearly, 1, 'Diamond yearly must be ₹1');
    console.log('  ✅ Silver, Gold, and Diamond plan prices correctly configured to ₹1.');

    // 2. Setup Express test server
    const app = express();
    app.use(express.json());
    app.use('/api/subscriptions', subscriptionRouter);

    const server = await new Promise((resolve) => {
        const s = app.listen(0, () => resolve(s));
    });
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api/subscriptions`;

    try {
        // Fetch test creator
        const creatorUser = queryOne("SELECT * FROM users WHERE email = 'creator@creatorhub.com'");
        assert(creatorUser, 'Test creator user must exist');
        const token = jwt.sign(
            { id: creatorUser.id, email: creatorUser.email, role: 'creator' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 3. Test GET /plans endpoint
        console.log('\n--- 2. Test GET /api/subscriptions/plans API ---');
        const plansRes = await fetch(`${baseUrl}/plans`);
        const plansData = await plansRes.json();
        assert.strictEqual(plansRes.status, 200);
        assert.strictEqual(plansData.success, true);
        assert.strictEqual(plansData.plans.silver.price_monthly, 1);
        assert.strictEqual(plansData.plans.gold.price_monthly, 1);
        assert.strictEqual(plansData.plans.diamond.price_monthly, 1);
        console.log('  ✅ GET /plans returned ₹1 for Silver, Gold, and Diamond.');

        // 4. Test POST /create-order endpoint for Silver, Gold, Diamond (100 paise = ₹1)
        console.log('\n--- 3. Test POST /api/subscriptions/create-order for ₹1 (100 paise) ---');
        for (const tier of ['silver', 'gold', 'diamond']) {
            const orderRes = await fetch(`${baseUrl}/create-order`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ tier, billing_cycle: 'monthly' })
            });
            const orderData = await orderRes.json();
            assert.strictEqual(orderRes.status, 200, `create-order for ${tier} failed: ${orderData.error}`);
            assert.strictEqual(orderData.success, true);
            assert.strictEqual(orderData.amount, 100, `Order amount for ${tier} must be 100 paise (₹1)`);
            assert.strictEqual(orderData.price_inr, 1, `Order price_inr for ${tier} must be ₹1`);
            assert(orderData.order_id, `order_id must be generated for ${tier}`);
            console.log(`  ✅ ${tier.toUpperCase()} order generated: Order ID = ${orderData.order_id}, Amount = ${orderData.amount} paise (₹${orderData.price_inr})`);
        }

        // 5. Verify rejection of upgrade without payment authorization
        console.log('\n--- 4. Verify Upgrade Rejection Without Payment Authorization ---');
        const unauthRes = await fetch(`${baseUrl}/upgrade`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                tier: 'gold',
                billing_cycle: 'monthly'
                // No payment order or transaction reference
            })
        });
        const unauthData = await unauthRes.json();
        assert.strictEqual(unauthRes.status, 400, 'Must reject upgrade without payment authorization');
        assert.strictEqual(unauthData.success, false);
        console.log('  ✅ Upgrade rejected without payment authorization: ' + unauthData.error);

        // 6. Test POST /upgrade endpoint with authorized payment (Upgrading to Gold for ₹1)
        console.log('\n--- 5. Test POST /api/subscriptions/upgrade to Gold VIP for ₹1 ---');
        const upgradeRes = await fetch(`${baseUrl}/upgrade`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                tier: 'gold',
                billing_cycle: 'monthly',
                payment_method: 'Razorpay UPI (Test ₹1)',
                razorpay_order_id: `order_sub_sim_${Date.now()}`,
                razorpay_payment_id: `pay_test_${Date.now()}`
            })
        });
        const upgradeData = await upgradeRes.json();
        assert.strictEqual(upgradeRes.status, 200, `Upgrade failed: ${upgradeData.error}`);
        assert.strictEqual(upgradeData.success, true);
        assert.strictEqual(upgradeData.tier, 'gold');
        assert(upgradeData.message.includes('₹1'), 'Success message must reference ₹1');
        console.log(`  ✅ Upgrade response: ${upgradeData.message}`);

        // 6. Verify Database State
        console.log('\n--- 5. Verify Database Records ---');
        const creatorProfile = queryOne('SELECT * FROM creator_profiles WHERE user_id = ?', [creatorUser.id]);
        assert.strictEqual(creatorProfile.subscription_tier, 'gold', 'Creator profile tier must be gold');

        const latestSub = queryOne(
            'SELECT * FROM creator_subscriptions WHERE creator_id = ? ORDER BY created_at DESC LIMIT 1',
            [creatorProfile.id]
        );
        assert(latestSub, 'creator_subscriptions record must exist');
        assert.strictEqual(latestSub.tier, 'gold', 'Subscription tier must be gold');
        assert.strictEqual(Number(latestSub.price), 1, 'Subscription price must be recorded as 1');
        console.log(`  ✅ DB creator_subscriptions verified: ID = ${latestSub.id}, Price = ₹${latestSub.price}, Tier = ${latestSub.tier}`);

        // 7. Verify GET /current endpoint reflects Gold perks & ₹1 tier
        console.log('\n--- 6. Verify Current Status API Reflects Upgrade ---');
        const currentRes = await fetch(`${baseUrl}/current`, { headers });
        const currentData = await currentRes.json();
        assert.strictEqual(currentRes.status, 200);
        assert.strictEqual(currentData.subscription.tier, 'gold');
        assert.strictEqual(currentData.subscription.application_limit, 40);
        assert.strictEqual(currentData.subscription.max_campaign_reward, 50000);
        console.log(`  ✅ Current subscription: Tier = ${currentData.subscription.tier_name}, Limit = ${currentData.subscription.application_limit} applications, Max Brief = ₹${currentData.subscription.max_campaign_reward}`);

        console.log('\n🎉 ALL CREATOR SUBSCRIPTION ₹1 UPGRADE TESTS PASSED SUCCESSFULLY!');
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
}

if (require.main === module) {
    testSubscriptionUpgradeSuite().catch(err => {
        console.error('❌ Test failed:', err);
        process.exit(1);
    });
}

module.exports = testSubscriptionUpgradeSuite;
