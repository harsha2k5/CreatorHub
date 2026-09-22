<?php
/**
 * CreatorHub - Admin Campaign Moderation Page
 */

declare(strict_types=1);

$baseDir = dirname(__DIR__);
require_once $baseDir . '/config/config.php';
require_once $baseDir . '/config/database.php';

$campaigns = Database::query("
    SELECT c.*, b.company_name, b.business_email 
    FROM campaigns c
    LEFT JOIN brand_profiles b ON c.brand_id = b.id
    ORDER BY c.created_at DESC
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
    <title>CreatorHub Admin — Campaign Compliance</title>
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
        .title-cell { font-weight: 700; color: #ffffff !important; font-size: 0.95rem; }
        .brand-cell { font-size: 0.85rem; color: #818cf8 !important; font-weight: 600; }
        .badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
        .badge-published { background: rgba(16, 185, 129, 0.15); color: #34d399 !important; border: 1px solid rgba(16, 185, 129, 0.35); }
        .badge-draft { background: rgba(148, 163, 184, 0.15); color: #cbd5e1 !important; border: 1px solid rgba(148, 163, 184, 0.35); }
        .badge-completed { background: rgba(59, 130, 246, 0.15); color: #60a5fa !important; border: 1px solid rgba(59, 130, 246, 0.35); }
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
                        Campaign Compliance & Moderation <span class="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30"><?= count($campaigns) ?> Campaigns</span>
                    </h1>
                    <p class="text-xs text-slate-400 mt-0.5">Live Hyper-local Opportunities & Deliverable Governance</p>
                </div>
            </div>
            <div class="flex items-center gap-2.5">
                <a href="<?= htmlspecialchars($baseUrl) ?>/admin/" class="nav-btn">
                    📊 Overview
                </a>
                <a href="<?= htmlspecialchars($baseUrl) ?>/admin/users.php" class="nav-btn">
                    👥 Users
                </a>
                <a href="<?= htmlspecialchars($baseUrl) ?>/admin/instagram-health.php" class="nav-btn">
                    📡 Meta Health
                </a>
                <a href="<?= htmlspecialchars($baseUrl) ?>/admin/messages.php" class="nav-btn">
                    📬 Inquiries
                </a>
                <a href="<?= htmlspecialchars($baseUrl) ?>/" class="nav-btn-primary">
                    ← Main App
                </a>
            </div>
        </header>

        <!-- Campaigns Table Card -->
        <div class="admin-card overflow-hidden shadow-2xl">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm admin-table">
                    <thead>
                        <tr>
                            <th>Campaign Title</th>
                            <th>Brand / Partner</th>
                            <th>Category</th>
                            <th>Budget / Reward</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($campaigns as $c): ?>
                        <tr>
                            <td>
                                <div class="title-cell"><?= htmlspecialchars($c['title']) ?></div>
                                <div class="text-xs text-slate-400 mt-0.5">📍 <?= htmlspecialchars($c['location_name'] ?? ($c['city'] ?? 'Bengaluru')) ?></div>
                            </td>
                            <td>
                                <div class="brand-cell"><?= htmlspecialchars($c['company_name'] ?? 'Brand Partner') ?></div>
                                <div class="text-xs text-slate-400 font-mono"><?= htmlspecialchars($c['business_email'] ?? '') ?></div>
                            </td>
                            <td>
                                <span class="text-xs font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/80">
                                    <?= htmlspecialchars($c['category']) ?>
                                </span>
                            </td>
                            <td>
                                <div class="font-extrabold text-emerald-400 text-sm">₹<?= number_format((float)$c['reward_per_creator']) ?></div>
                                <div class="text-[11px] text-slate-400">Total: ₹<?= number_format((float)$c['budget_total']) ?></div>
                            </td>
                            <td>
                                <span class="badge <?= strtoupper($c['status']) === 'PUBLISHED' ? 'badge-published' : (strtoupper($c['status']) === 'COMPLETED' ? 'badge-completed' : 'badge-draft') ?>">
                                    <span class="w-1.5 h-1.5 rounded-full <?= strtoupper($c['status']) === 'PUBLISHED' ? 'bg-emerald-400' : 'bg-slate-400' ?>"></span>
                                    <?= strtoupper(htmlspecialchars($c['status'])) ?>
                                </span>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
