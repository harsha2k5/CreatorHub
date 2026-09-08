<?php
/**
 * CreatorHub PHP Backend - Subscriptions Route
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/middleware/auth.php';
require_once dirname(__DIR__) . '/services/profileHelper.php';
require_once dirname(__DIR__) . '/services/PaymentService.php';

const SUBSCRIPTION_PLANS = [
    'free' => [
        'id' => 'free',
        'name' => 'Free Starter',
        'price_monthly' => 0,
        'price_yearly' => 0,
        'application_limit' => 3,
        'max_campaign_reward' => 5000,
        'badge_name' => 'Free Plan',
        'badge_color' => 'slate',
        'perks' => [
            '3 campaign applications per month',
            'Access to briefs up to ₹5,000',
            'Standard public directory listing',
            'Standard escrow payout processing'
        ]
    ],
    'silver' => [
        'id' => 'silver',
        'name' => 'Silver Growth',
        'price_monthly' => 1,
        'price_yearly' => 1,
        'application_limit' => 15,
        'max_campaign_reward' => 15000,
        'badge_name' => 'Silver Pro',
        'badge_color' => 'slate',
        'badge_icon' => 'Sparkles',
        'perks' => [
            '15 campaign applications per month (5x more)',
            'Unlock high-paying campaigns up to ₹15,000',
            '24h Early Access to newly published briefs',
            'Silver Verified Profile Badge',
            'Priority brand application review'
        ]
    ],
    'gold' => [
        'id' => 'gold',
        'name' => 'Gold Pro',
        'price_monthly' => 1,
        'price_yearly' => 1,
        'application_limit' => 40,
        'max_campaign_reward' => 50000,
        'badge_name' => 'Gold VIP',
        'badge_color' => 'amber',
        'badge_icon' => 'Crown',
        'popular' => true,
        'perks' => [
            '40 campaign applications per month (13x more)',
            'Unlock premium brand campaigns up to ₹50,000',
            'AI Pitch Assistant for tailored winning proposals',
            'Top 3 ranking in Brand Creator Matchmaker',
            'Gold Pro Influencer Badge',
            'Direct brand invitations spotlight'
        ]
    ],
    'diamond' => [
        'id' => 'diamond',
        'name' => 'Diamond VIP',
        'price_monthly' => 1,
        'price_yearly' => 1,
        'application_limit' => 999999,
        'max_campaign_reward' => 999999999,
        'badge_name' => 'Diamond Elite',
        'badge_color' => 'purple',
        'badge_icon' => 'Gem',
        'perks' => [
            'Unlimited campaign applications every month',
            'Access to all Mega-Budget Campaigns (₹50,000+)',
            '0% Platform Commission fee on all collaborations',
            'VIP Direct Brand Pitch Spotlight',
            'Dedicated Creator Success Manager',
            'Diamond Elite Verification Badge'
        ]
    ]
];

function handleSubscriptionsRoute(string $action, string $method, array $body) {
    if ($action === 'plans' && $method === 'GET') {
        echo json_encode([
            'success' => true,
            'plans' => SUBSCRIPTION_PLANS
        ]);
        return;
    }

    if ($action === 'current' && $method === 'GET') {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireCreator($user);

        $creator = getOrCreateCreatorProfile($user['id'], $user);
        if (!$creator) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Creator profile not found.']);
            return;
        }

        $tier = strtolower($creator['subscription_tier'] ?: 'free');
        $expiresAt = $creator['subscription_expires_at'];

        if ($expiresAt && strtotime($expiresAt) < time()) {
            $tier = 'free';
            Database::execute(
                "UPDATE creator_profiles SET subscription_tier = 'free', subscription_expires_at = NULL, subscription_updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [$creator['id']]
            );
        }

        $plan = SUBSCRIPTION_PLANS[$tier] ?? SUBSCRIPTION_PLANS['free'];

        $usageRow = Database::queryOne(
            "SELECT COUNT(*) as count FROM campaign_applications
             WHERE creator_id = ? AND applied_at >= datetime('now', 'start of month')",
            [$creator['id']]
        );
        $applicationsUsed = (int) ($usageRow ? $usageRow['count'] : 0);
        $applicationLimit = $plan['application_limit'];
        $applicationsRemaining = max(0, $applicationLimit - $applicationsUsed);

        $history = Database::query(
            "SELECT * FROM creator_subscriptions WHERE creator_id = ? ORDER BY created_at DESC LIMIT 5",
            [$creator['id']]
        );

        echo json_encode([
            'success' => true,
            'subscription' => [
                'tier' => $tier,
                'tier_name' => $plan['name'],
                'badge_name' => $plan['badge_name'],
                'expires_at' => $expiresAt,
                'is_active' => $tier !== 'free',
                'applications_used' => $applicationsUsed,
                'application_limit' => $applicationLimit,
                'applications_remaining' => $applicationsRemaining,
                'max_campaign_reward' => $plan['max_campaign_reward'],
                'plan' => $plan,
                'history' => $history
            ]
        ]);
        return;
    }

    if ($action === 'create-order' && $method === 'POST') {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireCreator($user);

        $tier = strtolower($body['tier'] ?? '');
        $billingCycle = ($body['billing_cycle'] ?? 'monthly') === 'yearly' ? 'yearly' : 'monthly';

        if (!in_array($tier, ['silver', 'gold', 'diamond'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid subscription tier selected.']);
            return;
        }

        $creator = getOrCreateCreatorProfile($user['id'], $user);
        if (!$creator) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Creator profile not found.']);
            return;
        }

        $plan = SUBSCRIPTION_PLANS[$tier];
        $price = $billingCycle === 'yearly' ? $plan['price_yearly'] : $plan['price_monthly']; // exactly 1 INR
        $amountInPaise = (int) round($price * 100);

        $receipt = "sub_rcpt_" . round(microtime(true) * 1000) . "_" . substr($creator['id'], 0, 6);
        $rzpOrder = PaymentService::callRazorpayOrderAPI($amountInPaise, $receipt, [
            'type' => 'creator_subscription_upgrade',
            'creator_id' => $creator['id'],
            'tier' => $tier,
            'billing_cycle' => $billingCycle
        ]);

        $orderId = $rzpOrder ? $rzpOrder['id'] : 'order_sub_sim_' . round(microtime(true) * 1000);
        $isSimulated = empty($rzpOrder);
        $publicConfig = PaymentService::getPublicConfig();

        echo json_encode([
            'success' => true,
            'order_id' => $orderId,
            'amount' => $amountInPaise,
            'currency' => 'INR',
            'key_id' => $publicConfig['key_id'],
            'plan_name' => $plan['name'],
            'tier' => $tier,
            'billing_cycle' => $billingCycle,
            'price_inr' => $price,
            'is_simulated' => $isSimulated,
            'prefill' => [
                'name' => $creator['full_name'] ?: ($user['name'] ?? 'Creator'),
                'email' => $user['email'] ?: 'creator@creatorhub.com'
            ]
        ]);
        return;
    }

    if ($action === 'upgrade' && $method === 'POST') {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireCreator($user);

        $tier = strtolower($body['tier'] ?? '');
        $billingCycle = ($body['billing_cycle'] ?? 'monthly') === 'yearly' ? 'yearly' : 'monthly';
        $paymentMethod = $body['payment_method'] ?? 'Razorpay UPI / Card';
        $razorpayOrderId = $body['razorpay_order_id'] ?? null;
        $razorpayPaymentId = $body['razorpay_payment_id'] ?? null;
        $razorpaySignature = $body['razorpay_signature'] ?? null;

        if (!in_array($tier, ['silver', 'gold', 'diamond'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid subscription tier selected.']);
            return;
        }

        if (!$razorpayOrderId && !$razorpayPaymentId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Payment authorization required. Missing order or payment reference.']);
            return;
        }

        $creator = getOrCreateCreatorProfile($user['id'], $user);
        if (!$creator) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Creator profile not found.']);
            return;
        }

        $plan = SUBSCRIPTION_PLANS[$tier];
        $price = $billingCycle === 'yearly' ? $plan['price_yearly'] : $plan['price_monthly']; // ₹1

        // Verify cryptographic signature if live transaction
        if ($razorpayOrderId && $razorpayPaymentId && $razorpaySignature && !str_starts_with($razorpayOrderId, 'order_sub_sim_')) {
            $secret = env('RAZORPAY_KEY_SECRET');
            if (!empty($secret)) {
                $expectedSig = hash_hmac('sha256', "{$razorpayOrderId}|{$razorpayPaymentId}", $secret);
                if (!hash_equals($expectedSig, $razorpaySignature)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Invalid Razorpay payment signature.']);
                    return;
                }
            }
        }

        $daysToAdd = $billingCycle === 'yearly' ? 365 : 30;
        $expiresDate = date('Y-m-d H:i:s', time() + ($daysToAdd * 86400));
        $subId = 'sub_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);
        $txRef = $razorpayPaymentId ?: 'TXN_CH_' . time();

        Database::execute(
            "INSERT INTO creator_subscriptions (
                id, creator_id, tier, price, billing_cycle, status,
                payment_method, transaction_ref, started_at, expires_at
            ) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, CURRENT_TIMESTAMP, ?)",
            [$subId, $creator['id'], $tier, $price, $billingCycle, $paymentMethod, $txRef, $expiresDate]
        );

        Database::execute(
            "UPDATE creator_profiles
             SET subscription_tier = ?, subscription_expires_at = ?, subscription_updated_at = CURRENT_TIMESTAMP
             WHERE id = ?",
            [$tier, $expiresDate, $creator['id']]
        );

        Database::execute(
            "INSERT INTO notifications (id, user_id, title, message, link) VALUES (?, ?, ?, ?, ?)",
            [
                'notif_' . round(microtime(true) * 1000),
                $user['id'],
                "👑 Upgraded to {$plan['name']}!",
                "Your membership is now active. You paid ₹{$price} and unlocked campaigns up to ₹" . ($plan['max_campaign_reward'] > 999999 ? 'Unlimited' : number_format($plan['max_campaign_reward'])) . " and {$plan['application_limit']} monthly applications.",
                "/creator/dashboard"
            ]
        );

        echo json_encode([
            'success' => true,
            'message' => "Congratulations! You are now upgraded to {$plan['name']} for ₹{$price}.",
            'tier' => $tier,
            'expires_at' => $expiresDate,
            'transaction_ref' => $txRef,
            'price_paid' => $price,
            'payment_method' => $paymentMethod,
            'plan' => $plan
        ]);
        return;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Subscription endpoint not found.']);
}
