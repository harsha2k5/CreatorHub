<?php
/**
 * CreatorHub - Reusable Public Header
 */

declare(strict_types=1);

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$scriptDir = dirname($_SERVER['SCRIPT_NAME'] ?? '');
$appRoot = rtrim($scriptDir, '/\\');
$baseUrl = $protocol . $host . ($appRoot ? $appRoot : '');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($pageTitle) ? htmlspecialchars($pageTitle) . ' — CreatorHub' : 'CreatorHub — Brand × Local Creator Marketplace & Escrow' ?></title>
    <meta name="description" content="Production-grade platform connecting local brands & outlets with content creators with location radius search & escrow payments.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
    <?php
    $cssFiles = glob(dirname(__DIR__) . '/assets/css/*.css') ?: glob(dirname(__DIR__) . '/assets/*.css');
    $latestCss = $cssFiles ? 'assets/css/' . basename(end($cssFiles)) : 'assets/css/index-DrHrAOYd.css';
    ?>
    <link rel="stylesheet" href="<?= htmlspecialchars($baseUrl) ?>/<?= htmlspecialchars($latestCss) ?>">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .font-heading { font-family: 'Outfit', sans-serif; }
    </style>
</head>
<body class="bg-[#fafafa] text-zinc-900 antialiased font-sans min-h-screen flex flex-col">
    <!-- Main Public Header -->
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <a href="<?= htmlspecialchars($baseUrl) ?>/" class="flex items-center gap-3">
                <img src="<?= htmlspecialchars($baseUrl) ?>/assets/images/logo.svg" alt="CreatorHub" class="h-9 w-auto" />
            </a>

            <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
                <a href="<?= htmlspecialchars($baseUrl) ?>/" class="hover:text-indigo-600 transition">Explore Campaigns</a>
                <a href="<?= htmlspecialchars($baseUrl) ?>/about.php" class="hover:text-indigo-600 transition">About</a>
                <a href="<?= htmlspecialchars($baseUrl) ?>/contact.php" class="hover:text-indigo-600 transition">Contact</a>
                <a href="<?= htmlspecialchars($baseUrl) ?>/admin/" class="hover:text-indigo-600 transition">Admin</a>
            </nav>

            <div class="flex items-center gap-3">
                <a href="<?= htmlspecialchars($baseUrl) ?>/" class="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition shadow-indigo-500/20">
                    Launch App →
                </a>
            </div>
        </div>
    </header>
    <main class="flex-1">
