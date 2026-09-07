const assert = require('assert');
const { initDB, queryOne, run } = require('../db/database.cjs');
const seed = require('../db/seed.cjs');
const InstagramService = require('../services/InstagramService.cjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

async function testInstagramApplicationBarrier() {
    console.log('🧪 Running Test: Instagram Connection Required for Campaign Application Barrier...');
    await initDB();
    await seed();

    let creator = queryOne(
        "SELECT cp.id, cp.user_id, cp.subscription_tier, u.email, u.role FROM creator_profiles cp JOIN users u ON cp.user_id = u.id LIMIT 1"
    );
    assert(creator, 'Creator profile and user must exist.');
    const creatorUser = { id: creator.user_id, email: creator.email, role: creator.role };

    // Upgrade test creator to diamond for testing so quota/tier ceiling doesn't interfere
    run("UPDATE creator_profiles SET subscription_tier = 'diamond' WHERE id = ?", [creator.id]);

    let campaign = queryOne(`
        SELECT c.id, c.brand_id, c.reward_per_creator
        FROM campaigns c
        WHERE c.status = 'PUBLISHED'
          AND NOT EXISTS (
              SELECT 1 FROM campaign_applications ca
              WHERE ca.campaign_id = c.id AND ca.creator_id = ?
          )
        LIMIT 1
    `, [creator.id]);

    if (!campaign) {
        const brand = queryOne("SELECT id FROM brand_profiles LIMIT 1");
        const testCampId = `cmp_test_${Date.now()}`;
        run(`
            INSERT INTO campaigns (id, brand_id, title, description, category, city, reward_per_creator, budget_total, creators_required, status)
            VALUES (?, ?, 'Test Artisan Coffee Brief', 'Test brief for barrier verification', 'Food & Beverage', 'Bengaluru', 4000, 12000, 3, 'PUBLISHED')
        `, [testCampId, brand ? brand.id : 'brd_test']);
        campaign = queryOne("SELECT id, brand_id, reward_per_creator FROM campaigns WHERE id = ?", [testCampId]);
    }

    assert(campaign, 'Published campaign must exist.');

    // 1. Ensure creator has NO connected Instagram account
    InstagramService.disconnect(creator.id);
    const unconnectedStatus = InstagramService.getStatus(creator.id);
    assert.strictEqual(unconnectedStatus.is_connected, false, 'Account must not be connected.');

    // Direct check of DB status
    const igCheckBefore = queryOne(
        'SELECT id, username, is_connected FROM instagram_accounts WHERE creator_id = ? AND is_connected = 1',
        [creator.id]
    );
    assert(!igCheckBefore, 'No active connected Instagram account must exist in database.');

    const token = jwt.sign(
        { id: creatorUser.id, email: creatorUser.email, role: 'creator' },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    console.log(`  Testing application as creator: ${creatorUser.email} (ID: ${creator.id}) for campaign: ${campaign.id}`);

    // Attempt apply without Instagram connected
    const responseUnconnected = await fetch('http://localhost:5000/api/applications/apply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            campaign_id: campaign.id,
            pitch: 'I would love to film an aesthetic Instagram reel for this campaign!'
        })
    });

    const dataUnconnected = await responseUnconnected.json();
    console.log('  Response when unconnected:', responseUnconnected.status, dataUnconnected.code, dataUnconnected.error);
    assert.strictEqual(responseUnconnected.status, 403, 'Must return 403 Forbidden when applying without Instagram.');
    assert.strictEqual(dataUnconnected.code, 'INSTAGRAM_REQUIRED', 'Must return code INSTAGRAM_REQUIRED.');
    assert(dataUnconnected.error.includes('Instagram connection required'), 'Must return descriptive error.');

    // 2. Connect Instagram account for creator
    const connectResult = await InstagramService.connectByProfileLink({
        creatorId: creator.id,
        userId: creatorUser.id,
        creator,
        username: 'test_creator_official',
        followersCount: 32000,
        followingCount: 512,
        mediaCount: 180
    });
    assert(connectResult, 'Instagram connection must succeed.');

    const connectedStatus = InstagramService.getStatus(creator.id);
    assert.strictEqual(connectedStatus.is_connected, true, 'Instagram must now be connected.');

    // 3. Re-attempt applying to the campaign with Instagram connected
    const responseConnected = await fetch('http://localhost:5000/api/applications/apply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            campaign_id: campaign.id,
            pitch: 'I have 32k followers and create viral Reels in Bengaluru!'
        })
    });

    const dataConnected = await responseConnected.json();
    console.log('  Response when connected:', responseConnected.status, dataConnected.success, dataConnected.application?.id || dataConnected.error);
    assert.strictEqual(responseConnected.status, 201, 'Must return 201 Created when applying with connected Instagram.');
    assert.strictEqual(dataConnected.success, true, 'Application submission must succeed.');

    // Cleanup: Disconnect again to return to clean state and restore original tier
    InstagramService.disconnect(creator.id);
    run("UPDATE creator_profiles SET subscription_tier = ? WHERE id = ?", [creator.subscription_tier || 'free', creator.id]);

    console.log('✅ Instagram Connection Barrier Test Passed Successfully!');
}

testInstagramApplicationBarrier().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
