const jwt = require('jsonwebtoken');
const { run, queryOne } = require('../db/database.cjs');
const { JWT_SECRET } = require('../middleware/auth.cjs');

async function testHttpConnectByLink() {
    const testUserId = `test_harsha_${Date.now()}`;
    const testEmail = `harsha_${Date.now()}@creatorhub.local`;

    run(
        `INSERT INTO users (id, email, password_hash, role, is_verified, is_active)
         VALUES (?, ?, 'hash123', 'creator', 1, 1)`,
        [testUserId, testEmail]
    );

    const token = jwt.sign(
        { id: testUserId, email: testEmail, role: 'creator' },
        JWT_SECRET,
        { expiresIn: '1d' }
    );

    console.log('Sending POST /api/instagram/connect-by-link for user without creator_profile...');
    const res = await fetch('http://localhost:5000/api/instagram/connect-by-link', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            profileUrl: 'https://www.instagram.com/_harsha.2k5?igsi=MXN4c2tqZWpoZXRsbA==',
            followersCount: 408,
            mediaCount: 9
        })
    });

    const data = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', JSON.stringify(data, null, 2));

    if (!data.success) {
        throw new Error('connect-by-link failed: ' + (data.error || 'unknown error'));
    }

    // Verify creator profile was created
    const profile = queryOne('SELECT * FROM creator_profiles WHERE user_id = ?', [testUserId]);
    console.log('Created creator profile in DB:', profile ? profile.id : 'NONE');

    // Verify instagram_accounts has the connected account
    const igAcc = queryOne('SELECT * FROM instagram_accounts WHERE creator_id = ?', [profile.id]);
    console.log('Connected Instagram account in DB:', igAcc ? `${igAcc.username} (${igAcc.followers_count} followers)` : 'NONE');

    if (!igAcc || igAcc.username !== '_harsha.2k5') {
        throw new Error('Instagram account was not linked properly!');
    }

    console.log('🎉 E2E HTTP test passed successfully!');
}

testHttpConnectByLink().catch(err => {
    console.error('❌ E2E HTTP test failed:', err);
    process.exit(1);
});
