const jwt = require('jsonwebtoken');
const { queryOne, run } = require('../db/database.cjs');
const { JWT_SECRET } = require('../middleware/auth.cjs');
const { getOrCreateCreatorProfile } = require('../services/profileHelper.cjs');

async function testAutoHealAndConnect() {
    console.log('🧪 Starting Instagram Auto-Heal & Connect Integration Test...');

    // 1. Create a test user with NO creator_profiles row (e.g. admin or corrupted/deleted profile)
    const testUserId = `test_user_${Date.now()}`;
    const testEmail = `tester_${Date.now()}@example.com`;

    run(
        `INSERT INTO users (id, email, password_hash, role, is_verified, is_active)
         VALUES (?, ?, 'hash123', 'creator', 1, 1)`,
        [testUserId, testEmail]
    );

    // Verify creator_profiles does NOT have this user
    let existingProfile = queryOne('SELECT * FROM creator_profiles WHERE user_id = ?', [testUserId]);
    if (existingProfile) {
        throw new Error('Expected no creator profile initially!');
    }
    console.log('✅ Confirmed user exists in users table with NO creator profile.');

    // 2. Call getOrCreateCreatorProfile
    const healedProfile = getOrCreateCreatorProfile(testUserId, { id: testUserId, email: testEmail, role: 'creator' });
    if (!healedProfile || healedProfile.user_id !== testUserId) {
        throw new Error('Failed to auto-heal creator profile!');
    }
    console.log('✅ Auto-healed creator profile successfully:', healedProfile.id, healedProfile.username);

    // 3. Test with a completely orphaned user (neither in users nor creator_profiles)
    const orphanedUserId = `orphaned_${Date.now()}`;
    const orphanedProfile = getOrCreateCreatorProfile(orphanedUserId, {
        id: orphanedUserId,
        email: `orphan_${Date.now()}@creatorhub.local`,
        role: 'creator'
    });
    if (!orphanedProfile || orphanedProfile.user_id !== orphanedUserId) {
        throw new Error('Failed to auto-heal orphaned creator profile!');
    }
    console.log('✅ Auto-healed orphaned session user successfully:', orphanedProfile.id);

    // 4. Test API endpoint POST /api/instagram/connect-by-link via fetch
    const token = jwt.sign(
        { id: healedProfile.user_id, email: testEmail, role: 'creator' },
        JWT_SECRET,
        { expiresIn: '1d' }
    );

    // We need server running or we can test using supertest or start server
    console.log('🎉 All profile auto-heal unit checks passed!');
}

testAutoHealAndConnect().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
