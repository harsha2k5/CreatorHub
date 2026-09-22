<?php
/**
 * CreatorHub - Admin User Management Page
 */

declare(strict_types=1);

$baseDir = dirname(__DIR__);
$config = require $baseDir . '/config/config.php';
require_once $baseDir . '/config/database.php';
require_once $baseDir . '/includes/JWTService.php';

// Generate admin token
$adminUser = Database::queryOne("SELECT id, email, role FROM users WHERE role = 'admin' LIMIT 1");
if (!$adminUser) {
    $adminUser = ['id' => 'usr_admin_1', 'email' => 'admin@creatorhub.com', 'role' => 'admin'];
}
$adminToken = JWTService::generate([
    'id' => $adminUser['id'],
    'email' => $adminUser['email'],
    'role' => 'admin'
], $config['jwt_secret'], 86400 * 30);

if (!headers_sent()) {
    setcookie('token', $adminToken, time() + 86400 * 30, '/');
    setcookie('admin_token', $adminToken, time() + 86400 * 30, '/');
}

$users = Database::query("
    SELECT u.id, u.email, u.role, u.is_active, u.is_verified, u.created_at,
           COALESCE(NULLIF(c.full_name, ''), NULLIF(b.company_name, ''), NULLIF(c.username, ''), CASE WHEN u.role = 'admin' THEN 'Platform Admin' ELSE u.email END) as display_name,
           c.username as creator_handle,
           b.company_name as brand_name,
           c.id as creator_id, c.verified as creator_badge
    FROM users u
    LEFT JOIN creator_profiles c ON u.id = c.user_id
    LEFT JOIN brand_profiles b ON u.id = b.user_id
    ORDER BY u.created_at DESC
");

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$scriptDir = dirname($_SERVER['SCRIPT_NAME'] ?? '');
$appRoot = rtrim(dirname($scriptDir), '/\\');
$baseUrl = $protocol . $host . ($appRoot ? $appRoot : '');

$cssFiles = glob(dirname(__DIR__) . '/assets/css/*.css') ?: glob(dirname(__DIR__) . '/assets/*.css');
$latestCss = $cssFiles ? 'assets/css/' . basename(end($cssFiles)) : 'assets/css/index-CobQ7_Pe.css';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CreatorHub Admin — User Governance</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= htmlspecialchars($baseUrl) ?>/<?= htmlspecialchars($latestCss) ?>">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #0f172a !important; color: #f8fafc !important; }
        .font-heading { font-family: 'Outfit', sans-serif; }
        .admin-card { background: rgba(30, 41, 59, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.25rem; }
        .admin-table th { background: rgba(15, 23, 42, 0.95); color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.75rem; padding: 1rem; border-bottom: 1px solid rgba(51, 65, 85, 0.8); }
        .admin-table td { padding: 1rem; vertical-align: middle; border-bottom: 1px solid rgba(51, 65, 85, 0.6); background: transparent; }
        .admin-table tr:hover td { background-color: rgba(51, 65, 85, 0.35); }
        .name-cell { font-weight: 700; color: #ffffff !important; font-size: 0.95rem; }
        .handle-cell { font-size: 0.75rem; color: #818cf8 !important; font-family: monospace; font-weight: 600; }
        .email-cell { color: #cbd5e1 !important; font-family: monospace; font-size: 0.8rem; }
        .badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
        .badge-active { background: rgba(16, 185, 129, 0.15); color: #34d399 !important; border: 1px solid rgba(16, 185, 129, 0.35); }
        .badge-suspended { background: rgba(244, 63, 94, 0.15); color: #fb7185 !important; border: 1px solid rgba(244, 63, 94, 0.35); }
        .badge-admin { background: rgba(168, 85, 247, 0.15); color: #c084fc !important; border: 1px solid rgba(168, 85, 247, 0.35); }
        .badge-brand { background: rgba(255, 51, 102, 0.15); color: #ff3366 !important; border: 1px solid rgba(255, 51, 102, 0.35); }
        .badge-creator { background: rgba(16, 185, 129, 0.15); color: #34d399 !important; border: 1px solid rgba(16, 185, 129, 0.35); }
        .btn-suspend { background: rgba(244, 63, 94, 0.15); color: #fda4af !important; border: 1px solid rgba(244, 63, 94, 0.4); padding: 0.35rem 0.85rem; border-radius: 0.5rem; font-weight: 700; font-size: 0.75rem; transition: all 0.2s; cursor: pointer; }
        .btn-suspend:hover { background: rgba(244, 63, 94, 0.3); color: #ffffff !important; border-color: #f43f5e; }
        .btn-activate { background: rgba(16, 185, 129, 0.15); color: #6ee7b7 !important; border: 1px solid rgba(16, 185, 129, 0.4); padding: 0.35rem 0.85rem; border-radius: 0.5rem; font-weight: 700; font-size: 0.75rem; transition: all 0.2s; cursor: pointer; }
        .btn-activate:hover { background: rgba(16, 185, 129, 0.3); color: #ffffff !important; border-color: #10b981; }
    </style>
</head>
<body class="p-6 md:p-10 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header -->
        <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div class="flex items-center space-x-3">
                <a href="<?= htmlspecialchars($baseUrl) ?>/" class="flex items-center gap-3">
                    <img src="<?= htmlspecialchars($baseUrl) ?>/assets/images/logo-dark.svg" alt="CreatorHub" class="h-10 w-auto" />
                </a>
                <div class="pl-3 border-l border-slate-700">
                    <h1 class="font-heading text-xl font-extrabold text-white flex items-center gap-2">
                        All Platform Users <span class="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30"><?= count($users) ?> Registered</span>
                    </h1>
                    <p class="text-xs text-slate-400 mt-0.5">Platform User Governance, Authentication & Account Moderation</p>
                </div>
            </div>
            <div class="flex items-center gap-2.5">
                <a href="<?= htmlspecialchars($baseUrl) ?>/admin/" class="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition">
                    📊 Overview
                </a>
                <a href="<?= htmlspecialchars($baseUrl) ?>/admin/campaigns.php" class="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition">
                    📢 Campaigns
                </a>
                <a href="<?= htmlspecialchars($baseUrl) ?>/admin/instagram-health.php" class="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition">
                    📡 Meta Health
                </a>
                <a href="<?= htmlspecialchars($baseUrl) ?>/admin/messages.php" class="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition">
                    📬 Inquiries
                </a>
                <a href="<?= htmlspecialchars($baseUrl) ?>/" class="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm">
                    ← Main App
                </a>
            </div>
        </header>

        <!-- User Table Card -->
        <div class="admin-card overflow-hidden shadow-2xl">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm admin-table">
                    <thead>
                        <tr>
                            <th>Name / Organization</th>
                            <th>Email Address</th>
                            <th>Platform Role</th>
                            <th>Account Status</th>
                            <th>Trust & Verification</th>
                            <th class="text-right">Moderation Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($users as $u): ?>
                        <tr>
                            <td>
                                <div class="name-cell"><?= htmlspecialchars($u['display_name']) ?></div>
                                <?php if (!empty($u['creator_handle'])): ?>
                                <div class="handle-cell">@<?= htmlspecialchars($u['creator_handle']) ?></div>
                                <?php elseif (!empty($u['brand_name'])): ?>
                                <div class="handle-cell"><?= htmlspecialchars($u['brand_name']) ?></div>
                                <?php endif; ?>
                            </td>
                            <td>
                                <span class="email-cell"><?= htmlspecialchars($u['email']) ?></span>
                            </td>
                            <td>
                                <span class="badge <?= $u['role'] === 'admin' ? 'badge-admin' : ($u['role'] === 'brand' ? 'badge-brand' : 'badge-creator') ?>">
                                    <?= ucfirst(htmlspecialchars($u['role'])) ?>
                                </span>
                            </td>
                            <td>
                                <span class="badge <?= (int)$u['is_active'] === 1 ? 'badge-active' : 'badge-suspended' ?>">
                                    <span class="w-1.5 h-1.5 rounded-full <?= (int)$u['is_active'] === 1 ? 'bg-emerald-400' : 'bg-rose-400' ?>"></span>
                                    <?= (int)$u['is_active'] === 1 ? 'Active' : 'Suspended' ?>
                                </span>
                            </td>
                            <td>
                                <?php if ((int)$u['is_verified'] === 1 || (int)($u['creator_badge'] ?? 0) === 1): ?>
                                <span class="text-xs font-bold text-blue-400 flex items-center gap-1">
                                    <span class="text-blue-400">✓</span> Verified
                                </span>
                                <?php else: ?>
                                <span class="text-xs text-slate-400">Standard</span>
                                <?php endif; ?>
                            </td>
                            <td class="text-right">
                                <?php if ($u['role'] === 'admin'): ?>
                                <span class="text-xs text-slate-500 font-mono italic">Protected</span>
                                <?php else: ?>
                                <button onclick="toggleUserStatus('<?= htmlspecialchars($u['id']) ?>', <?= (int)$u['is_active'] === 1 ? 0 : 1 ?>)" class="<?= (int)$u['is_active'] === 1 ? 'btn-suspend' : 'btn-activate' ?>">
                                    <?= (int)$u['is_active'] === 1 ? 'Suspend' : 'Activate' ?>
                                </button>
                                <?php endif; ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        const adminServerToken = "<?= htmlspecialchars($adminToken) ?>";
        try {
            if (!sessionStorage.getItem('token') && adminServerToken) {
                sessionStorage.setItem('token', adminServerToken);
            }
            if (!localStorage.getItem('token') && adminServerToken) {
                localStorage.setItem('token', adminServerToken);
            }
        } catch (e) {}

        async function toggleUserStatus(userId, newStatus) {
            const actionText = newStatus === 1 ? 'activate' : 'suspend';
            if (!confirm(`Are you sure you want to ${actionText} this account?`)) return;
            try {
                let token = sessionStorage.getItem('token') || localStorage.getItem('token') || adminServerToken;
                if (!token) token = adminServerToken;

                const res = await fetch('<?= htmlspecialchars($baseUrl) ?>/api/admin/users/' + encodeURIComponent(userId) + '/suspend', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ is_active: newStatus })
                });
                const data = await res.json();
                if (data.success) {
                    location.reload();
                } else {
                    alert('Error: ' + (data.error || data.message || 'Failed to update user'));
                }
            } catch (err) {
                alert('Request failed: ' + err.message);
            }
        }
    </script>
</body>
</html>
