<?php
/**
 * CreatorHub - Main Web Application Front Controller & Entry Point
 */

declare(strict_types=1);

// 1. If request is targeting /api/*, forward to api/index.php
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));
$path = trim($uri, '/');
if (str_starts_with($path, 'api/') || str_contains($path, '/api/')) {
    require __DIR__ . '/api/index.php';
    exit;
}

// 2. If request is targeting a static asset, serve it directly with proper MIME type
if ($uri !== '/' && $uri !== '') {
    $candidates = [
        __DIR__ . $uri,
        __DIR__ . '/dist' . $uri,
        __DIR__ . '/assets' . $uri
    ];
    foreach ($candidates as $cand) {
        if (file_exists($cand) && is_file($cand)) {
            $ext = strtolower(pathinfo($cand, PATHINFO_EXTENSION));
            $mimes = [
                'css'   => 'text/css; charset=UTF-8',
                'js'    => 'application/javascript; charset=UTF-8',
                'mjs'   => 'application/javascript; charset=UTF-8',
                'json'  => 'application/json; charset=UTF-8',
                'png'   => 'image/png',
                'jpg'   => 'image/jpeg',
                'jpeg'  => 'image/jpeg',
                'gif'   => 'image/gif',
                'svg'   => 'image/svg+xml',
                'webp'  => 'image/webp',
                'ico'   => 'image/x-icon',
                'woff'  => 'font/woff',
                'woff2' => 'font/woff2',
                'ttf'   => 'font/ttf',
                'map'   => 'application/json'
            ];
            $contentType = $mimes[$ext] ?? (function_exists('mime_content_type') ? @mime_content_type($cand) : 'application/octet-stream');
            header('Content-Type: ' . $contentType);
            header('Content-Length: ' . (string)filesize($cand));
            readfile($cand);
            exit;
        }
    }
}

// Compute dynamic base path for flexible deployment (root domain vs subfolder /CreatorHub/)
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$scriptDir = dirname($_SERVER['SCRIPT_NAME'] ?? '');
$basePath = rtrim($scriptDir, '/\\');
$baseUrl = $protocol . $host . ($basePath ? $basePath : '');
$apiBaseUrl = $baseUrl . '/api';

// Auto-discover latest compiled CSS and JS bundles by modification time
$cssFiles = array_merge(glob(__DIR__ . '/assets/*.css') ?: [], glob(__DIR__ . '/dist/assets/*.css') ?: [], glob(__DIR__ . '/assets/css/*.css') ?: []);
$jsFiles = array_merge(glob(__DIR__ . '/assets/*.js') ?: [], glob(__DIR__ . '/dist/assets/*.js') ?: [], glob(__DIR__ . '/assets/js/*.js') ?: []);

if (!empty($cssFiles)) {
    usort($cssFiles, fn($a, $b) => filemtime($b) <=> filemtime($a));
    $latestCss = str_replace('\\', '/', substr($cssFiles[0], strlen(__DIR__) + 1));
} else {
    $latestCss = 'assets/index-Dt8_xcNa.css';
}

if (!empty($jsFiles)) {
    usort($jsFiles, fn($a, $b) => filemtime($b) <=> filemtime($a));
    $latestJs = str_replace('\\', '/', substr($jsFiles[0], strlen(__DIR__) + 1));
} else {
    $latestJs = 'assets/index-Ci-eNYGV.js';
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="<?= htmlspecialchars($baseUrl) ?>/assets/mrbeast-avatar.jpg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CreatorHub — Brand × Creator Marketplace & Escrow Platform</title>
    <meta name="description" content="Production-grade platform connecting local brands & outlets with content creators with location radius search & escrow payments." />
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Dynamic Base URL Injection for Frontend API Bridge -->
    <script>
      window.__CREATORHUB_API_BASE__ = "<?= htmlspecialchars($apiBaseUrl) ?>";
      window.__CREATORHUB_BASE_URL__ = "<?= htmlspecialchars($baseUrl) ?>";
    </script>

    <!-- Compiled CSS -->
    <link rel="stylesheet" crossorigin href="<?= htmlspecialchars($baseUrl) ?>/<?= htmlspecialchars($latestCss) ?>">
  </head>
  <body class="bg-[#071012] text-[#f4f4f5] antialiased font-sans">
    <div id="root"></div>

    <!-- Compiled Application Scripts -->
    <script type="module" crossorigin src="<?= htmlspecialchars($baseUrl) ?>/<?= htmlspecialchars($latestJs) ?>"></script>
  </body>
</html>
