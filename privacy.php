<?php
$pageTitle = 'Privacy Policy';
require_once __DIR__ . '/includes/header.php';
?>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
    <div class="space-y-2 border-b border-zinc-200 pb-6">
        <h1 class="font-heading text-3xl font-extrabold text-zinc-900">Privacy Policy</h1>
        <p class="text-xs text-zinc-500">Last updated: September 2026 • Compliance Version 2.0</p>
    </div>

    <div class="prose prose-zinc max-w-none text-sm space-y-6 text-zinc-700 leading-relaxed">
        <section class="space-y-2">
            <h2 class="font-heading text-lg font-bold text-zinc-900">1. Information We Collect</h2>
            <p>CreatorHub collects account registration data (email, name, role), location coordinates for hyper-local matchmaking, and official Instagram Graph API tokens when voluntarily connected by creators for verification.</p>
        </section>

        <section class="space-y-2">
            <h2 class="font-heading text-lg font-bold text-zinc-900">2. Meta Graph API v19.0 Compliance</h2>
            <p>When you link your Instagram professional or business account, we exchange short-lived tokens for 60-day long-lived tokens encrypted with AES-256-GCM. We never store passwords or access private messages. Tokens are strictly used for read-only follower metrics, recent post timestamps, and media insights.</p>
        </section>

        <section class="space-y-2">
            <h2 class="font-heading text-lg font-bold text-zinc-900">3. Escrow & Payment Data</h2>
            <p>All financial transactions are handled via Razorpay payment gateway using HMAC-SHA256 signature verification. CreatorHub does not store full credit card numbers or banking passwords.</p>
        </section>

        <section class="space-y-2">
            <h2 class="font-heading text-lg font-bold text-zinc-900">4. Contact & Inquiries</h2>
            <p>For data removal or privacy inquiries, contact our Data Protection Officer at <strong>privacy@creatorhub.com</strong>.</p>
        </section>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
