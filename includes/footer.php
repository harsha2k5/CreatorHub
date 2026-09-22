    </main>

    <!-- Public Footer -->
    <footer class="bg-zinc-900 text-zinc-400 py-12 border-t border-zinc-800 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="space-y-3">
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">C</div>
                    <span class="font-heading font-bold text-lg text-white">CreatorHub</span>
                </div>
                <p class="text-xs text-zinc-500 leading-relaxed">
                    Hyper-local Brand × Creator Marketplace powered by PHP 8.2 & Meta Graph API v19.0. Zero fake data guarantee.
                </p>
            </div>

            <div>
                <h4 class="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">Platform</h4>
                <ul class="space-y-2 text-xs">
                    <li><a href="<?= htmlspecialchars($baseUrl) ?>/" class="hover:text-white transition">Explore Campaigns</a></li>
                    <li><a href="<?= htmlspecialchars($baseUrl) ?>/about.php" class="hover:text-white transition">About Us</a></li>
                    <li><a href="<?= htmlspecialchars($baseUrl) ?>/contact.php" class="hover:text-white transition">Contact Support</a></li>
                    <li><a href="<?= htmlspecialchars($baseUrl) ?>/install.php" class="hover:text-white transition">System Installer</a></li>
                </ul>
            </div>

            <div>
                <h4 class="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">Governance</h4>
                <ul class="space-y-2 text-xs">
                    <li><a href="<?= htmlspecialchars($baseUrl) ?>/admin/" class="hover:text-white transition">Admin Portal</a></li>
                    <li><a href="<?= htmlspecialchars($baseUrl) ?>/privacy.php" class="hover:text-white transition">Privacy Policy</a></li>
                    <li><a href="<?= htmlspecialchars($baseUrl) ?>/terms.php" class="hover:text-white transition">Terms of Service</a></li>
                </ul>
            </div>

            <div>
                <h4 class="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">Trust & Security</h4>
                <p class="text-xs text-zinc-500 leading-relaxed">
                    Razorpay Escrow Protected. 100% verified engagement metrics via Official Meta Graph API.
                </p>
                <div class="mt-4 text-[11px] text-zinc-600">
                    &copy; <?= date('Y') ?> CreatorHub Inc. All rights reserved.
                </div>
            </div>
        </div>
    </footer>
</body>
</html>
