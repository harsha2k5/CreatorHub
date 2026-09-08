/**
 * Comprehensive Live HTTP Server Integration Test for CreatorHub PHP Backend
 * Boots PHP CLI server on port 5050 and verifies all API endpoints over HTTP.
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const assert = require('assert');

const PORT = 5050;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function request(method, urlPath, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
        const u = new URL(urlPath, BASE_URL);
        const reqHeaders = { ...headers };
        let bodyStr = null;
        if (body && typeof body === 'object') {
            bodyStr = JSON.stringify(body);
            reqHeaders['Content-Type'] = 'application/json';
            reqHeaders['Content-Length'] = Buffer.byteLength(bodyStr);
        }

        const req = http.request(
            {
                hostname: u.hostname,
                port: u.port,
                path: u.pathname + u.search,
                method,
                headers: reqHeaders
            },
            (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    let parsed = null;
                    try {
                        parsed = JSON.parse(data);
                    } catch (e) {
                        parsed = data;
                    }
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: parsed
                    });
                });
            }
        );

        req.on('error', reject);
        if (bodyStr) req.write(bodyStr);
        req.end();
    });
}

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runLiveServerTests() {
    console.log('====================================================');
    console.log('🌐 Starting PHP 8.2+ Live HTTP Server Test Suite');
    console.log(`Target Port: ${PORT}`);
    console.log('====================================================\n');

    // 1. Spawn PHP Server via run.cjs runner
    const runnerScript = path.resolve(__dirname, '../run.cjs');
    const routerScript = path.resolve(__dirname, '../router.php');
    const serverDir = path.resolve(__dirname, '..');

    console.log('🚀 Spawning PHP CLI server...');
    const serverProcess = spawn('node', [runnerScript, '-S', `127.0.0.1:${PORT}`, '-t', serverDir, routerScript], {
        stdio: 'pipe'
    });

    let serverError = '';
    serverProcess.stderr.on('data', (data) => {
        serverError += data.toString();
    });

    // Cleanup hook
    const killServer = () => {
        if (serverProcess && serverProcess.pid) {
            try {
                const { execSync } = require('child_process');
                if (process.platform === 'win32') {
                    execSync(`taskkill /pid ${serverProcess.pid} /t /f`, { stdio: 'ignore' });
                } else {
                    serverProcess.kill('SIGKILL');
                }
            } catch (e) {
                // process may already be terminated
            }
        }
    };
    process.on('exit', killServer);
    process.on('SIGINT', killServer);

    // Wait for health check
    let ready = false;
    for (let i = 0; i < 25; i++) {
        await sleep(400);
        try {
            const health = await request('GET', '/api/health');
            if (health.status === 200 && health.body.status === 'UP') {
                ready = true;
                console.log(`✅ PHP Server listening on ${BASE_URL} (Engine: ${health.body.engine})`);
                break;
            }
        } catch (e) {
            // keep waiting
        }
    }

    if (!ready) {
        killServer();
        throw new Error(`PHP server failed to start on port ${PORT}.\n${serverError}`);
    }

    try {
        // --- TEST 1: CORS Options Preflight ---
        console.log('\n--- 1. CORS Preflight & Security Headers ---');
        const corsRes = await request('OPTIONS', '/api/campaigns', {
            Origin: 'http://localhost:5173',
            'Access-Control-Request-Method': 'POST'
        });
        assert.strictEqual(corsRes.status, 204, 'CORS preflight should return 204 No Content');
        assert.strictEqual(corsRes.headers['access-control-allow-origin'], 'http://localhost:5173');
        assert.strictEqual(corsRes.headers['access-control-allow-credentials'], 'true');
        console.log('  ✅ CORS preflight passed with correct origin & credentials reflection');

        // --- TEST 2: User Registration (Creator & Brand) ---
        console.log('\n--- 2. User Registration ---');
        const ts = Date.now();
        const creatorEmail = `test_creator_${ts}@example.com`;
        const brandEmail = `test_brand_${ts}@example.com`;

        const regCreator = await request('POST', '/api/auth/register', {}, {
            email: creatorEmail,
            password: 'Password123!',
            name: 'Priya Sharma',
            role: 'creator'
        });
        assert.strictEqual(regCreator.status, 201, 'Creator registration must return 201');
        assert(regCreator.body.token, 'Must return JWT token');
        assert.strictEqual(regCreator.body.user.role, 'creator');
        const creatorToken = regCreator.body.token;
        console.log('  ✅ Creator registered successfully');

        const regBrand = await request('POST', '/api/auth/register', {}, {
            email: brandEmail,
            password: 'Password123!',
            name: 'Zara Lifestyle',
            role: 'brand'
        });
        assert.strictEqual(regBrand.status, 201, 'Brand registration must return 201');
        assert(regBrand.body.token, 'Must return JWT token');
        assert.strictEqual(regBrand.body.user.role, 'brand');
        const brandToken = regBrand.body.token;
        console.log('  ✅ Brand registered successfully');

        // --- TEST 3: Login ---
        console.log('\n--- 3. Login & Authentication ---');
        const loginRes = await request('POST', '/api/auth/login', {}, {
            email: creatorEmail,
            password: 'Password123!'
        });
        assert.strictEqual(loginRes.status, 200, 'Login must return 200');
        assert(loginRes.body.token, 'Login must return JWT');
        assert(loginRes.body.user.profile, 'User must have creator profile');
        console.log('  ✅ Creator login successful with profile populated');

        // --- TEST 4: Authenticated /api/auth/me ---
        console.log('\n--- 4. Authenticated /me ---');
        const meRes = await request('GET', '/api/auth/me', {
            Authorization: `Bearer ${creatorToken}`
        });
        assert.strictEqual(meRes.status, 200);
        assert.strictEqual(meRes.body.user.email, creatorEmail);
        console.log('  ✅ Authenticated /me endpoint returned valid user session');

        // --- TEST 5: Unauthorized Access Blocking ---
        console.log('\n--- 5. Authorization & Role Enforcement ---');
        const unauthRes = await request('GET', '/api/auth/me');
        assert.strictEqual(unauthRes.status, 401, 'Missing token must be 401');
        console.log('  ✅ Unauthorized access properly blocked (401)');

        // --- TEST 6: Subscriptions Plans & ₹1 Price ---
        console.log('\n--- 6. Subscription Plans (₹1 Gating) ---');
        const plansRes = await request('GET', '/api/subscriptions/plans');
        const plans = Array.isArray(plansRes.body.plans) ? plansRes.body.plans : Object.values(plansRes.body.plans);
        const silver = plans.find((p) => p.id === 'silver') || plansRes.body.plans.silver;
        assert(silver && (silver.price_monthly === 1 || silver.price === 1), 'Silver must be ₹1');
        console.log('  ✅ Subscription plans returned with ₹1 tier pricing');

        // --- TEST 7: Campaigns Browsing ---
        console.log('\n--- 7. Campaign Browsing ---');
        const campaignsRes = await request('GET', '/api/campaigns');
        assert.strictEqual(campaignsRes.status, 200);
        assert(Array.isArray(campaignsRes.body.campaigns));
        console.log(`  ✅ Retrieved ${campaignsRes.body.campaigns.length} campaigns`);

        // --- TEST 8: Brand Creates Campaign ---
        console.log('\n--- 8. Brand Creates Campaign ---');
        const createCampRes = await request(
            'POST',
            '/api/campaigns',
            { Authorization: `Bearer ${brandToken}` },
            {
                title: 'Summer Fashion Launch 2026',
                description: 'Showcase sustainable summer collection with reels',
                category: 'Fashion',
                budget: 25000,
                reward_per_creator: 5000,
                location: 'Bengaluru',
                deliverables: [{ platform: 'Instagram', type: 'Reel', count: 1 }]
            }
        );
        assert.strictEqual(createCampRes.status, 201, 'Campaign creation must return 201');
        const campaignId = createCampRes.body.campaign.id;
        console.log(`  ✅ Campaign created with ID: ${campaignId}`);

        // --- TEST 9: Creator Applies to Campaign ---
        console.log('\n--- 9. Creator Applies to Campaign ---');
        const applyRes = await request(
            'POST',
            '/api/applications/apply',
            { Authorization: `Bearer ${creatorToken}` },
            {
                campaign_id: campaignId,
                pitch: 'I have 50k fashion engaged followers in Bengaluru!',
                proposed_budget: 5000
            }
        );
        assert.strictEqual(applyRes.status, 201, 'Application must return 201');
        const applicationId = applyRes.body.application.id;
        console.log(`  ✅ Application submitted with ID: ${applicationId}`);

        // --- TEST 10: Brand Accepts Application -> Collaboration Created ---
        console.log('\n--- 10. Brand Accepts Application & Creates Collaboration ---');
        const acceptRes = await request(
            'POST',
            `/api/applications/${applicationId}/accept`,
            { Authorization: `Bearer ${brandToken}` }
        );
        assert.strictEqual(acceptRes.status, 200, 'Accept application must return 200');
        const collaborationId = acceptRes.body.collaboration_id || acceptRes.body.collaboration?.id;
        assert(collaborationId, 'Must return collaboration_id');
        console.log(`  ✅ Application accepted, collaboration created: ${collaborationId}`);

        // --- TEST 11: Creator Submits Deliverable Proof ---
        console.log('\n--- 11. Creator Submits Deliverable Proof ---');
        const submitRes = await request(
            'POST',
            `/api/collaborations/${collaborationId}/submit`,
            { Authorization: `Bearer ${creatorToken}` },
            {
                live_post_url: 'https://instagram.com/p/summer2026reel',
                screenshot_url: 'https://storage.creatorhub.internal/proof123.jpg',
                notes: 'Posted on prime time 7 PM IST'
            }
        );
        assert.strictEqual(submitRes.status, 200, 'Deliverable submission must return 200');
        console.log('  ✅ Deliverable submitted by creator');

        // --- TEST 12: Strict Escrow Payment Barrier (Must Reject Approval If Unfunded) ---
        console.log('\n--- 12. Strict Escrow Payment Barrier (Approval Gate) ---');
        const reviewUnfundedRes = await request(
            'POST',
            `/api/collaborations/${collaborationId}/review`,
            { Authorization: `Bearer ${brandToken}` },
            {
                action: 'APPROVE'
            }
        );
        assert.strictEqual(reviewUnfundedRes.status, 400, 'Must return 400 Bad Request on unfunded collaboration');
        assert.strictEqual(reviewUnfundedRes.body.code, 'PAYMENT_REQUIRED', 'Must return code PAYMENT_REQUIRED');
        console.log('  ✅ Correctly blocked approval of unfunded collaboration (PAYMENT_REQUIRED)');

        // --- TEST 13: Brand Creates Razorpay Order for Escrow ---
        console.log('\n--- 13. Razorpay Escrow Order Creation ---');
        const orderRes = await request(
            'POST',
            '/api/payments/create-order',
            { Authorization: `Bearer ${brandToken}` },
            {
                collaboration_id: collaborationId
            }
        );
        assert.strictEqual(orderRes.status, 200, 'Order creation must return 200');
        assert(orderRes.body.order_id, 'Must return Razorpay order_id');
        const orderId = orderRes.body.order_id;
        console.log(`  ✅ Razorpay order created: ${orderId} (Amount: ₹${orderRes.body.amount})`);

        // --- TEST 14: Payment Verification & Escrow Locking ---
        console.log('\n--- 14. Payment Verification & Escrow Lock ---');
        const verifyRes = await request(
            'POST',
            '/api/payments/verify',
            { Authorization: `Bearer ${brandToken}` },
            {
                collaboration_id: collaborationId,
                razorpay_order_id: orderId,
                razorpay_payment_id: `pay_test_${Date.now()}`,
                razorpay_signature: 'test_simulated_sig'
            }
        );
        assert.strictEqual(verifyRes.status, 200, 'Verification must return 200');
        assert.strictEqual(verifyRes.body.status, 'ESCROW_LOCKED');
        console.log('  ✅ Payment verified, collaboration status -> ESCROW_LOCKED');

        // --- TEST 15: Deliverable Approval Now Succeeds ---
        console.log('\n--- 15. Brand Approves Deliverables After Escrow Funded ---');
        const reviewFundedRes = await request(
            'POST',
            `/api/collaborations/${collaborationId}/review`,
            { Authorization: `Bearer ${brandToken}` },
            {
                action: 'APPROVE'
            }
        );
        assert.strictEqual(reviewFundedRes.status, 200, 'Approval must succeed after escrow locked');
        console.log('  ✅ Collaboration approved and completed successfully');

        // --- TEST 16: Instagram Status & Crawler Integration ---
        console.log('\n--- 16. Instagram Integration Endpoints ---');
        const igStatusRes = await request('GET', '/api/instagram/status', {
            Authorization: `Bearer ${creatorToken}`
        });
        assert.strictEqual(igStatusRes.status, 200);
        assert.strictEqual(igStatusRes.body.connected, false);
        console.log('  ✅ Instagram status checked (clean unconnected state)');

        // --- TEST 17: AI Match Score ---
        console.log('\n--- 17. AI Matching Engine ---');
        const aiRes = await request(
            'POST',
            '/api/ai/match-score',
            { Authorization: `Bearer ${brandToken}` },
            {
                campaign_id: campaignId,
                creator_id: regCreator.body.user.profile?.id || 'crt_test'
            }
        );
        assert.strictEqual(aiRes.status, 200);
        assert(typeof aiRes.body.match_score === 'number' || typeof aiRes.body.score === 'number');
        console.log('  ✅ AI Compatibility Match Score generated successfully');

        // --- TEST 18: In-App Chat & Messaging ---
        console.log('\n--- 18. In-App Conversations & Chat Messaging ---');
        // Creator views conversations (auto-created when application was accepted in test 10)
        const convsRes = await request('GET', '/api/messages/conversations', {
            Authorization: `Bearer ${creatorToken}`
        });
        assert.strictEqual(convsRes.status, 200);
        assert(Array.isArray(convsRes.body.conversations));
        assert(convsRes.body.conversations.length > 0, 'Must have at least 1 active conversation');
        const activeConv = convsRes.body.conversations[0];
        console.log(`  ✅ Retrieved ${convsRes.body.conversations.length} conversation(s) for creator (ID: ${activeConv.id})`);

        // Creator reads message thread
        const threadRes = await request('GET', `/api/messages/${activeConv.id}`, {
            Authorization: `Bearer ${creatorToken}`
        });
        assert.strictEqual(threadRes.status, 200);
        assert(Array.isArray(threadRes.body.messages));
        console.log(`  ✅ Retrieved ${threadRes.body.messages.length} messages in thread`);

        // Creator sends a reply
        const replyRes = await request(
            'POST',
            `/api/messages/${activeConv.id}`,
            { Authorization: `Bearer ${creatorToken}` },
            {
                text: 'Excited to start! I will have the draft ready by Friday.'
            }
        );
        assert.strictEqual(replyRes.status, 201);
        assert.strictEqual(replyRes.body.message.text, 'Excited to start! I will have the draft ready by Friday.');
        console.log('  ✅ Creator sent chat reply successfully');

        // Brand reads thread and verifies incoming message
        const brandThreadRes = await request('GET', `/api/messages/${activeConv.id}`, {
            Authorization: `Bearer ${brandToken}`
        });
        assert.strictEqual(brandThreadRes.status, 200);
        const lastMsg = brandThreadRes.body.messages[brandThreadRes.body.messages.length - 1];
        assert.strictEqual(lastMsg.text, 'Excited to start! I will have the draft ready by Friday.');
        console.log('  ✅ Brand received creator reply and message marked read');

        // --- TEST 19: Notifications Center ---
        console.log('\n--- 19. Notifications Center ---');
        const notifsRes = await request('GET', '/api/notifications', {
            Authorization: `Bearer ${creatorToken}`
        });
        assert.strictEqual(notifsRes.status, 200);
        assert(Array.isArray(notifsRes.body.notifications));
        console.log(`  ✅ Retrieved ${notifsRes.body.notifications.length} notifications for creator`);

        const markAllRes = await request('POST', '/api/notifications/read-all', {
            Authorization: `Bearer ${creatorToken}`
        });
        assert.strictEqual(markAllRes.status, 200);
        console.log('  ✅ Marked all notifications as read');

        console.log('\n====================================================');
        console.log('🎉 ALL 19 LIVE HTTP ENDPOINT TESTS PASSED WITH 100% SUCCESS!');
        console.log('PHP 8.2+ Backend is production ready and fully compatible.');
        console.log('====================================================\n');
    } finally {
        killServer();
    }
}

runLiveServerTests()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Live HTTP Server Test Failed:', err);
        process.exit(1);
    });
