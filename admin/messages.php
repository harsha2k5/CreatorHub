<?php
/**
 * CreatorHub - Admin Contact Messages & Inquiries Portal
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/JWTService.php';

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$scriptDir = dirname(dirname($_SERVER['SCRIPT_NAME'] ?? ''));
$appRoot = rtrim($scriptDir, '/\\');
$baseUrl = $protocol . $host . ($appRoot ? $appRoot : '');

// Handle status updates or deletes
$action = $_GET['action'] ?? '';
$targetId = $_GET['id'] ?? '';

// Ensure table exists
Database::getConnection()->exec("CREATE TABLE IF NOT EXISTS contact_inquiries (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'unread',
    ip_address VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

// Insert default demo inquiries if table is empty
$count = (int) Database::queryValue("SELECT COUNT(*) FROM contact_inquiries");
if ($count === 0) {
    Database::execute("INSERT INTO contact_inquiries (id, name, email, subject, message, status, created_at) VALUES 
        ('inq_1001', 'Ananya Rao', 'ananya@lifestyle.com', 'Creator Verification Query', 'Hi CreatorHub team, I submitted my Instagram connection credentials and wanted to confirm if my verified badge is under review.', 'unread', datetime('now', '-2 hours')),
        ('inq_1002', 'Rahul Mehta', 'contact@thirdwave.in', 'Escrow Payout Timeline', 'We are planning to launch a 5-creator Bengaluru campaign next week. How fast is the Razorpay escrow released once deliverables are approved?', 'read', datetime('now', '-1 day')),
        ('inq_1003', 'Chandana Murthy', 'chandana@fashion.in', 'Instagram Live Sync Status', 'Just synced my @chandana__murthy account! The AI score and analytics are working great. Thanks!', 'unread', datetime('now', '-30 minutes'))
    ");
}

if ($action === 'toggle_status' && $targetId) {
    $currentStatus = Database::queryValue("SELECT status FROM contact_inquiries WHERE id = ?", [$targetId]);
    $newStatus = ($currentStatus === 'unread') ? 'read' : (($currentStatus === 'read') ? 'resolved' : 'unread');
    Database::execute("UPDATE contact_inquiries SET status = ? WHERE id = ?", [$newStatus, $targetId]);
    header('Location: messages.php');
    exit;
} elseif ($action === 'delete' && $targetId) {
    Database::execute("DELETE FROM contact_inquiries WHERE id = ?", [$targetId]);
    header('Location: messages.php');
    exit;
}

$inquiries = Database::query("SELECT * FROM contact_inquiries ORDER BY created_at DESC");
$totalCount = count($inquiries);
$unreadCount = count(array_filter($inquiries, fn($i) => ($i['status'] ?? '') === 'unread'));
$resolvedCount = count(array_filter($inquiries, fn($i) => ($i['status'] ?? '') === 'resolved'));

// Auto-discover latest compiled CSS file
$cssFiles = glob(dirname(__DIR__) . '/assets/css/*.css') ?: glob(dirname(__DIR__) . '/assets/*.css');
$latestCss = $cssFiles ? 'assets/css/' . basename(end($cssFiles)) : 'assets/css/index-BesTCF_b.css';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CreatorHub Admin — Inquiries & Support Messages</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= htmlspecialchars($baseUrl) ?>/<?= htmlspecialchars($latestCss) ?>">
    <style>
        body { background-color: #0b0f17 !important; color: #e2e8f0 !important; font-family: 'Inter', sans-serif; }
        .font-heading { font-family: 'Outfit', sans-serif; }
        .admin-card { background: rgba(15, 23, 42, 0.85) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4); }
        .admin-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .admin-table th { background: #1e293b !important; color: #94a3b8 !important; text-transform: uppercase; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
        .admin-table td { padding: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.06); background: rgba(15, 23, 42, 0.6) !important; color: #f8fafc !important; vertical-align: top; }
        .admin-table tr:hover td { background: rgba(30, 41, 59, 0.7) !important; }
        .badge { display: inline-flex; align-items: center; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
        .badge-unread { background: rgba(244, 63, 94, 0.2); color: #fb7185 !important; border: 1px solid rgba(244, 63, 94, 0.4); }
        .badge-read { background: rgba(59, 130, 246, 0.2); color: #60a5fa !important; border: 1px solid rgba(59, 130, 246, 0.4); }
        .badge-resolved { background: rgba(16, 185, 129, 0.2); color: #34d399 !important; border: 1px solid rgba(16, 185, 129, 0.4); }
        .nav-btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.85rem; border-radius: 0.65rem; font-size: 0.75rem; font-weight: 700; background: #1e293b !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.15) !important; text-decoration: none !important; transition: all 0.2s ease; }
        .nav-btn:hover { background: #334155 !important; color: #ffffff !important; border-color: #6366f1 !important; transform: translateY(-1px); }
        .nav-btn-primary { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.85rem; border-radius: 0.65rem; font-size: 0.75rem; font-weight: 700; background: #4f46e5 !important; color: #ffffff !important; border: 1px solid #6366f1 !important; text-decoration: none !important; box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4) !important; transition: all 0.2s ease; }
        .nav-btn-primary:hover { background: #4338ca !important; color: #ffffff !important; transform: translateY(-1px); }
    </style>
</head>
<body class="min-h-screen p-6 md:p-10">
    <div class="max-w-7xl mx-auto space-y-8">
        <!-- Top Navbar -->
        <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div class="flex items-center space-x-3">
                <a href="<?= htmlspecialchars($baseUrl) ?>/" class="flex items-center gap-3">
                    <img src="<?= htmlspecialchars($baseUrl) ?>/assets/images/logo-dark.svg" alt="CreatorHub" class="h-10 w-auto" />
                </a>
                <div class="pl-3 border-l border-slate-700">
                    <h1 class="font-heading text-xl font-extrabold text-white flex items-center gap-2">
                        📬 Inquiries & Support Messages
                    </h1>
                    <p class="text-[11px] text-slate-400 mt-0.5">Real-time public contact submissions & support desk</p>
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
                <a href="<?= htmlspecialchars($baseUrl) ?>/admin/instagram-health.php" class="nav-btn">
                    📡 Meta Health
                </a>
                <a href="<?= htmlspecialchars($baseUrl) ?>/admin/messages.php" class="nav-btn-primary">
                    📬 Inquiries (<?= $unreadCount ?>)
                </a>
                <a href="<?= htmlspecialchars($baseUrl) ?>/" class="nav-btn">
                    ← Main App
                </a>
            </div>
        </header>

        <!-- Stats Overview Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div class="admin-card p-6 rounded-2xl">
                <div class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Inquiries Received</div>
                <div class="text-3xl font-heading font-black text-white mt-2"><?= $totalCount ?></div>
                <div class="text-xs text-slate-400 mt-1">Submitted through public Contact Us form</div>
            </div>
            <div class="admin-card p-6 rounded-2xl">
                <div class="text-xs font-bold uppercase tracking-wider text-rose-400">Unread Inquiries</div>
                <div class="text-3xl font-heading font-black text-rose-400 mt-2"><?= $unreadCount ?></div>
                <div class="text-xs text-slate-400 mt-1">Requires administrator response</div>
            </div>
            <div class="admin-card p-6 rounded-2xl">
                <div class="text-xs font-bold uppercase tracking-wider text-emerald-400">Resolved Messages</div>
                <div class="text-3xl font-heading font-black text-emerald-400 mt-2"><?= $resolvedCount ?></div>
                <div class="text-xs text-slate-400 mt-1">Addressed by support team</div>
            </div>
        </div>

        <!-- Inquiries Table -->
        <div class="admin-card rounded-2xl overflow-hidden">
            <div class="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                    <h3 class="font-heading font-bold text-lg text-white">All Received Inquiries</h3>
                    <p class="text-xs text-slate-400">Browse incoming queries submitted via the contact form</p>
                </div>
                <a href="<?= htmlspecialchars($baseUrl) ?>/contact.php" target="_blank" class="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
                    Open Contact Form ↗
                </a>
            </div>

            <div class="overflow-x-auto">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Sender & Contact</th>
                            <th>Subject</th>
                            <th>Message Content</th>
                            <th>Timestamp</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($inquiries)): ?>
                            <tr>
                                <td colspan="6" class="text-center py-12 text-slate-500">
                                    No messages received yet. Submit a test message on <a href="<?= htmlspecialchars($baseUrl) ?>/contact.php" class="text-indigo-400 underline">contact.php</a>.
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($inquiries as $inq): ?>
                                <tr>
                                    <td class="whitespace-nowrap">
                                        <div class="font-bold text-white text-sm"><?= htmlspecialchars($inq['name']) ?></div>
                                        <div class="text-xs text-indigo-400 font-mono mt-0.5"><?= htmlspecialchars($inq['email']) ?></div>
                                    </td>
                                    <td>
                                        <div class="font-semibold text-slate-200 text-sm"><?= htmlspecialchars($inq['subject'] ?: 'General Inquiry') ?></div>
                                    </td>
                                    <td class="max-w-md">
                                        <div class="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                                            <?= htmlspecialchars($inq['message']) ?>
                                        </div>
                                    </td>
                                    <td class="whitespace-nowrap font-mono text-xs text-slate-400">
                                        <?= htmlspecialchars(date('M j, Y — g:i A', strtotime($inq['created_at']))) ?>
                                    </td>
                                    <td class="whitespace-nowrap">
                                        <?php if ($inq['status'] === 'unread'): ?>
                                            <span class="badge badge-unread">● Unread</span>
                                        <?php elseif ($inq['status'] === 'read'): ?>
                                            <span class="badge badge-read">✓ Read</span>
                                        <?php else: ?>
                                            <span class="badge badge-resolved">✓ Resolved</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="whitespace-nowrap">
                                        <div class="flex items-center gap-2">
                                            <a href="messages.php?action=toggle_status&id=<?= urlencode($inq['id']) ?>" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition" title="Toggle Status">
                                                Change Status
                                            </a>
                                            <a href="messages.php?action=delete&id=<?= urlencode($inq['id']) ?>" onclick="return confirm('Delete this message?');" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-800/50 transition">
                                                Delete
                                            </a>
                                        </div>
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
