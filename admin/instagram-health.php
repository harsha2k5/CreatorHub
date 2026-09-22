<?php
/**
 * CreatorHub - Admin Instagram Health Monitor Page
 */

declare(strict_types=1);

$baseDir = dirname(__DIR__);
require_once $baseDir . '/config/config.php';
require_once $baseDir . '/config/database.php';

$connectedAccounts = Database::query("
    SELECT ig.*, cr.full_name, cr.city 
    FROM instagram_accounts ig
    LEFT JOIN creator_profiles cr ON ig.creator_id = cr.id
    ORDER BY ig.last_synced_at DESC
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
    <title>CreatorHub Admin — Meta Graph API Health</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= htmlspecialchars($baseUrl) ?>/<?= htmlspecialchars($latestCss) ?>">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #0f172a !important; color: #f8fafc !important; }
        .font-heading { font-family: 'Outfit', sans-serif; }
        .admin-card { background: rgba(30, 41, 59, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.25rem; }
        .admin-table th { background: rgba(15, 23, 42, 0.95); color: #94a3b8 !important; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.75rem; padding: 1rem; border-bottom: 1px solid rgba(51, 65, 85, 0.8); }
        .admin-table td { padding: 1rem; vertical-align: middle; border-bottom: 1px solid rgba(51, 65, 85, 0.6); background: transparent; }
        .admin-table tr:hover td { background-color: rgba(51, 65, 85, 0.35); }
        .name-cell { font-weight: 700; color: #ffffff !important; font-size: 0.95rem; }
        .location-cell { color: #94a3b8 !important; font-size: 0.75rem; margin-top: 0.2rem; }
        .ig-cell { font-size: 0.85rem; color: #f472b6 !important; font-weight: 700; font-family: monospace; text-decoration: none; }
        .ig-cell:hover { color: #fb7185 !important; text-decoration: underline; }
        .type-badge { display: inline-flex; align-items: center; padding: 0.3rem 0.65rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 700; font-family: monospace; background: #1e293b !important; color: #38bdf8 !important; border: 1px solid rgba(56, 189, 248, 0.4) !important; letter-spacing: 0.03em; }
        .badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
        .badge-connected { background: rgba(16, 185, 129, 0.18) !important; color: #34d399 !important; border: 1px solid rgba(16, 185, 129, 0.4) !important; }
        .time-badge { font-size: 0.8rem; color: #e2e8f0 !important; font-family: monospace; font-weight: 600; }
        .nav-btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.85rem; border-radius: 0.65rem; font-size: 0.75rem; font-weight: 700; background: #1e293b !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; text-decoration: none !important; transition: all 0.2s ease; }
        .nav-btn:hover { background: #334155 !important; color: #ffffff !important; border-color: #6366f1 !important; transform: translateY(-1px); }
        .nav-btn-primary { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.85rem; border-radius: 0.65rem; font-size: 0.75rem; font-weight: 700; background: #4f46e5 !important; color: #ffffff !important; border: 1px solid #6366f1 !important; text-decoration: none !important; box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4) !important; transition: all 0.2s ease; }
        .nav-btn-primary:hover { background: #4338ca !important; color: #ffffff !important; transform: translateY(-1px); }
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
                        Meta Graph API & Instagram Accounts <span class="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30"><?= count($connectedAccounts) ?> Connected</span>
                    </h1>
                    <p class="text-xs text-slate-400 mt-0.5">Live Instagram Token Health, Sync Timestamps & Real-time Graph Metrics</p>
                </div>
            </div>
            <div class="flex items-center gap-2.5">
                <a href="<?= htmlspecialchars($baseUrl) ?>/admin/" class="nav-btn">
                    📊 Overview
                </a>
                <a href="<?= htmlspecialchars($baseUrl) ?>/admin/users.php" class="nav-btn">
                    👥 Users
                </a>
                <a href="<?= htmlspecialchars($baseUrl) ?>/admin/campaigns.php" class="nav-btn">
                    📢 Campaigns
                </a>
                <a href="<?= htmlspecialchars($baseUrl) ?>/admin/messages.php" class="nav-btn">
                    📬 Inquiries
                </a>
                <a href="<?= htmlspecialchars($baseUrl) ?>/" class="nav-btn-primary">
                    ← Main App
                </a>
            </div>
        </header>

        <!-- Instagram Accounts Table Card -->
        <div class="admin-card overflow-hidden shadow-2xl">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm admin-table">
                    <thead>
                        <tr>
                            <th>Creator Full Name</th>
                            <th>Instagram Account</th>
                            <th>Connection Type</th>
                            <th>Live Status</th>
                            <th>Last Sync Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($connectedAccounts)): ?>
                        <tr>
                            <td colspan="5" class="p-8 text-center text-slate-400">No Instagram accounts connected yet.</td>
                        </tr>
                        <?php else: ?>
                        <?php foreach ($connectedAccounts as $ig): ?>
                        <tr>
                            <td>
                                <div class="name-cell"><?= htmlspecialchars($ig['full_name'] ?? 'Creator') ?></div>
                                <div class="location-cell">📍 <?= htmlspecialchars($ig['city'] ?? 'Bengaluru') ?></div>
                            </td>
                            <td>
                                <a href="<?= htmlspecialchars($ig['profile_url'] ?? "https://instagram.com/{$ig['username']}") ?>" target="_blank" class="ig-cell">
                                    @<?= htmlspecialchars($ig['username'] ?: $ig['instagram_username']) ?>
                                </a>
                            </td>
                            <td>
                                <span class="type-badge">
                                    <?= htmlspecialchars($ig['account_type']) ?>
                                </span>
                            </td>
                            <td>
                                <span class="badge badge-connected">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    <?= htmlspecialchars($ig['connection_status']) ?>
                                </span>
                            </td>
                            <td>
                                <span class="time-badge"><?= htmlspecialchars($ig['last_synced_at']) ?></span>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
