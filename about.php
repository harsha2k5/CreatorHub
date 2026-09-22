<?php
$pageTitle = 'About Us';
require_once __DIR__ . '/includes/header.php';
?>

<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
    <!-- Hero Section -->
    <div class="text-center space-y-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            ✨ Architectural Standard
        </div>
        <h1 class="font-heading text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight">
            Empowering Local Brands & Verified Creators
        </h1>
        <p class="max-w-2xl mx-auto text-base sm:text-lg text-zinc-600 leading-relaxed">
            CreatorHub is a hyper-local collaboration marketplace bridging the gap between physical retail outlets and genuine regional creators with 100% verified data.
        </p>
    </div>

    <!-- Core Pillars Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                🛡️
            </div>
            <h3 class="font-heading font-bold text-lg text-zinc-900">Zero Fake Data</h3>
            <p class="text-xs text-zinc-600 leading-relaxed">
                All follower statistics and engagement rates originate directly from official Meta Graph API v19.0 connections. Synthetic metrics are strictly prohibited.
            </p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                📍
            </div>
            <h3 class="font-heading font-bold text-lg text-zinc-900">Geospatial Discovery</h3>
            <p class="text-xs text-zinc-600 leading-relaxed">
                Precision Haversine discovery engine matches creators within 1 km to 50 km radii of brand store outlets, boosting authentic walk-in footfall.
            </p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-3">
            <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                🔒
            </div>
            <h3 class="font-heading font-bold text-lg text-zinc-900">Escrow Safety Barrier</h3>
            <p class="text-xs text-zinc-600 leading-relaxed">
                Brand payments are held in secure escrow upon collaboration acceptance and released only upon validated proof of deliverable completion.
            </p>
        </div>
    </div>

    <!-- Technology Callout -->
    <div class="bg-zinc-900 text-white rounded-3xl p-8 sm:p-10 space-y-6">
        <div class="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
                <h2 class="font-heading text-2xl font-bold">Built for Performance & Scale</h2>
                <p class="text-xs text-zinc-400 mt-1">High-performance PHP 8.2 backend with MySQL/MariaDB & SQLite support.</p>
            </div>
            <a href="<?= htmlspecialchars($baseUrl) ?>/" class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition shadow-lg shadow-indigo-600/30 self-start md:self-auto">
                Explore Marketplace →
            </a>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
