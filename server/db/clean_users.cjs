const fs = require('fs');
const path = require('path');
const { initDB, run, query, queryOne } = require('./database.cjs');

async function cleanUsers() {
    await initDB();

    console.log('🔄 Starting user database cleanup...');

    // 1. Create a backup of the current database file
    const dbPath = path.join(__dirname, '..', 'data', 'creatorhub.db');
    const backupPath = path.join(__dirname, '..', 'data', `creatorhub.backup_${Date.now()}.db`);
    if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, backupPath);
        console.log(`📦 Safety backup created at: ${backupPath}`);
    }

    // 2. Count current records before purge
    const beforeUsers = query('SELECT id, email, role FROM users');
    console.log(`📊 Current total users before cleanup: ${beforeUsers.length}`);

    // 3. Purge related transactional and activity tables in safe order
    run('DELETE FROM refresh_logs');
    run("DELETE FROM admin_actions WHERE admin_user_id != 'usr_admin_1'");
    run("DELETE FROM notifications WHERE user_id != 'usr_admin_1'");
    run('DELETE FROM payments');
    run('DELETE FROM reviews');
    run('DELETE FROM messages');
    run('DELETE FROM conversations');
    run('DELETE FROM deliverables');
    run('DELETE FROM collaborations');
    run('DELETE FROM campaign_applications');
    run('DELETE FROM campaigns');
    run('DELETE FROM ai_creator_analyses');
    run('DELETE FROM instagram_insights');
    run('DELETE FROM instagram_sync_logs');
    run('DELETE FROM instagram_media');
    run('DELETE FROM instagram_metrics');
    run('DELETE FROM instagram_accounts');
    run('DELETE FROM oauth_states');
    run('DELETE FROM creator_subscriptions');
    run('DELETE FROM brand_profiles');
    run('DELETE FROM creator_profiles');

    // 4. Delete all non-admin users
    run("DELETE FROM users WHERE role != 'admin'");

    // 5. Ensure admin user exists
    const admin = queryOne("SELECT id, email, role FROM users WHERE email = 'admin@creatorhub.com'");
    if (!admin) {
        console.warn('⚠️ Admin user missing, creating default admin account...');
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const adminHash = await bcrypt.hash('Admin@123', salt);
        run(
            `INSERT INTO users (id, email, password_hash, role, is_verified, is_active)
             VALUES (?, ?, ?, ?, ?, ?)`,
            ['usr_admin_1', 'admin@creatorhub.com', adminHash, 'admin', 1, 1]
        );
    }

    const afterUsers = query('SELECT id, email, role FROM users');
    console.log(`✅ Cleanup completed successfully!`);
    console.log(`📊 Users remaining in database: ${afterUsers.length}`);
    console.log(JSON.stringify(afterUsers, null, 2));
}

if (require.main === module) {
    cleanUsers().catch(err => {
        console.error('❌ Error during cleanup:', err);
        process.exit(1);
    });
}

module.exports = cleanUsers;
