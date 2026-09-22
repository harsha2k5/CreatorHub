<?php
$pageTitle = 'Contact Us';
$submitted = false;
$error = '';

require_once __DIR__ . '/config/database.php';

// Ensure contact_inquiries table exists
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $subject = trim($_POST['subject'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if (empty($name) || empty($email) || empty($message)) {
        $error = 'Please complete all required fields.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Please enter a valid email address.';
    } else {
        $id = 'inq_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(4)), 0, 5);
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        Database::execute(
            "INSERT INTO contact_inquiries (id, name, email, subject, message, status, ip_address) VALUES (?, ?, ?, ?, ?, 'unread', ?)",
            [$id, $name, $email, $subject ?: 'General Inquiry', $message, $ip]
        );
        $submitted = true;
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
    <div class="text-center space-y-3">
        <h1 class="font-heading text-3xl sm:text-4xl font-extrabold text-zinc-900">Get in Touch</h1>
        <p class="text-sm sm:text-base text-zinc-600">Have questions about brand campaigns, creator verification, or escrow protection?</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Contact Info Cards -->
        <div class="space-y-4">
            <div class="bg-white p-5 rounded-2xl border border-zinc-200 space-y-1">
                <div class="text-xs font-semibold text-zinc-400 uppercase">Support Email</div>
                <div class="text-sm font-bold text-zinc-900">support@creatorhub.com</div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-zinc-200 space-y-1">
                <div class="text-xs font-semibold text-zinc-400 uppercase">Headquarters</div>
                <div class="text-sm font-bold text-zinc-900">Indiranagar, Bengaluru, KA</div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-zinc-200 space-y-1">
                <div class="text-xs font-semibold text-zinc-400 uppercase">Operating Hours</div>
                <div class="text-sm font-bold text-zinc-900">Mon – Sat: 9:00 AM – 7:00 PM IST</div>
            </div>
            <div class="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-1">
                <div class="text-xs font-semibold text-indigo-500 uppercase">Platform Governance</div>
                <div class="text-xs text-indigo-950 font-medium">Inquiries are logged in real-time to the Admin Messages Portal.</div>
            </div>
        </div>

        <!-- Contact Form -->
        <div class="md:col-span-2 bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
            <?php if ($submitted): ?>
                <div class="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                    <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl mx-auto">✓</div>
                    <div class="space-y-1">
                        <h3 class="font-heading font-bold text-lg text-emerald-900">Message Received!</h3>
                        <p class="text-xs text-emerald-700">Thank you for contacting CreatorHub. Your message has been logged directly into our support desk and our team will review it shortly.</p>
                    </div>
                    <div class="pt-2">
                        <a href="contact.php" class="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
                            Send another inquiry →
                        </a>
                    </div>
                </div>
            <?php else: ?>
                <?php if ($error): ?>
                    <div class="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                        <?= htmlspecialchars($error) ?>
                    </div>
                <?php endif; ?>

                <form method="POST" class="space-y-4">
                    <div>
                        <label class="block text-xs font-semibold text-zinc-700 mb-1">Your Full Name *</label>
                        <input type="text" name="name" required class="w-full px-4 py-2.5 text-sm rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition" placeholder="Ananya Rao">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-zinc-700 mb-1">Email Address *</label>
                        <input type="email" name="email" required class="w-full px-4 py-2.5 text-sm rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition" placeholder="ananya@creatorhub.com">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-zinc-700 mb-1">Subject</label>
                        <input type="text" name="subject" class="w-full px-4 py-2.5 text-sm rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition" placeholder="Campaign Inquiry / Verification Request">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-zinc-700 mb-1">Message *</label>
                        <textarea name="message" rows="4" required class="w-full px-4 py-2.5 text-sm rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition" placeholder="How can we assist you?"></textarea>
                    </div>
                    <button type="submit" class="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold text-sm text-white shadow-md shadow-indigo-600/20 transition cursor-pointer">
                        Send Message →
                    </button>
                </form>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
