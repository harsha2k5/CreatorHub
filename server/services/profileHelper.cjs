const { queryOne, run } = require('../db/database.cjs');

/**
 * Ensures a valid creator profile always exists for an authenticated user.
 * If the profile was missing (e.g. after a cleanup, admin preview, or registration edge case),
 * it seamlessly auto-provisions one so the user is never blocked from connecting Instagram or applying.
 */
function getOrCreateCreatorProfile(userId, fallbackUser = null) {
    if (!userId) return null;
    let creator = queryOne('SELECT * FROM creator_profiles WHERE user_id = ?', [userId]);
    if (creator) return creator;

    let user = queryOne('SELECT id, email, role FROM users WHERE id = ?', [userId]);
    if (!user && fallbackUser && fallbackUser.id === userId) {
        try {
            const fallbackEmail = fallbackUser.email || `user_${userId.substring(0, 8)}@creatorhub.local`;
            const fallbackRole = fallbackUser.role || 'creator';
            run(
                `INSERT OR IGNORE INTO users (id, email, password_hash, role, is_verified, is_active)
                 VALUES (?, ?, 'oauth_or_session_hash', ?, 1, 1)`,
                [userId, fallbackEmail, fallbackRole]
            );
            user = queryOne('SELECT id, email, role FROM users WHERE id = ?', [userId]);
        } catch (e) {
            console.error('[AutoHeal] Could not insert fallback user:', e);
        }
    }

    if (!user) {
        // Last resort user provisioning
        try {
            const fallbackEmail = `creator_${userId.substring(0, 8)}@creatorhub.local`;
            run(
                `INSERT OR IGNORE INTO users (id, email, password_hash, role, is_verified, is_active)
                 VALUES (?, ?, 'placeholder_hash', 'creator', 1, 1)`,
                [userId, fallbackEmail]
            );
            user = queryOne('SELECT id, email, role FROM users WHERE id = ?', [userId]);
        } catch (e) {
            console.error('[AutoHeal] Last resort user insertion error:', e);
        }
    }

    if (!user) return null;

    const creatorId = `crt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const emailPrefix = (user.email.split('@')[0] || 'creator').replace(/[^a-zA-Z0-9_.]/g, '_').toLowerCase();
    let finalUsername = emailPrefix;
    let counter = 1;
    while (queryOne('SELECT id FROM creator_profiles WHERE username = ?', [finalUsername])) {
        finalUsername = `${emailPrefix}_${counter++}`;
    }

    try {
        run(`
            INSERT INTO creator_profiles (
                id, user_id, full_name, username, phone, city, area,
                lat, lng, bio, avatar_url, categories_json, languages_json,
                min_budget, radius_km
            ) VALUES (?, ?, ?, ?, '', 'Bengaluru', 'Central', 12.9716, 77.5946, 'Content creator on CreatorHub', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300', '["Lifestyle"]', '["English"]', 3000, 15.0)
        `, [creatorId, user.id, user.email.split('@')[0], finalUsername]);

        creator = queryOne('SELECT * FROM creator_profiles WHERE id = ?', [creatorId]);
        console.log(`[AutoHeal] Successfully auto-created missing creator profile ${creatorId} for user ${user.id} (${user.email})`);
        return creator;
    } catch (e) {
        console.error('[AutoHeal] Error auto-creating creator profile:', e);
        return queryOne('SELECT * FROM creator_profiles WHERE user_id = ?', [userId]);
    }
}

module.exports = {
    getOrCreateCreatorProfile
};
