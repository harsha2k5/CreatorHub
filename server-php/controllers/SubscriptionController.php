<?php
/**
 * CreatorHub PHP Backend - SubscriptionController
 */

namespace CreatorHub\Controllers;

use Database;
use AuthMiddleware;
use PaymentService;
use CreatorHub\Utils\Response;
use CreatorHub\Models\Subscription;

class SubscriptionController {
    public const PLANS = [
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

    public static function plans(): void {
        Response::json([
            'success' => true,
            'plans' => self::PLANS
        ]);
    }

    public static function current(): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireCreator($user);

        require_once dirname(__DIR__) . '/services/profileHelper.php';
        $creator = getOrCreateCreatorProfile($user['id'], $user);

        $tier = strtolower($creator['subscription_tier'] ?? 'free');
        $plan = self::PLANS[$tier] ?? self::PLANS['free'];

        $sub = Database::queryOne(
            "SELECT * FROM creator_subscriptions WHERE creator_id = ? AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1",
            [$creator['id']]
        );

        Response::json([
            'success' => true,
            'tier' => $tier,
            'plan' => $plan,
            'subscription' => $sub,
            'is_active' => $sub ? true : ($tier === 'free')
        ]);
    }

    public static function createOrder(array $body): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireCreator($user);

        require_once dirname(__DIR__) . '/services/profileHelper.php';
        $creator = getOrCreateCreatorProfile($user['id'], $user);

        $tier = strtolower(trim($body['tier'] ?? 'silver'));
        if (!isset(self::PLANS[$tier]) || $tier === 'free') {
            Response::error('Invalid subscription tier requested.', 400);
        }

        $billingCycle = strtolower(trim($body['billing_cycle'] ?? 'monthly'));
        $price = (float) self::PLANS[$tier]['price_' . $billingCycle];

        try {
            $orderData = PaymentService::createSubscriptionOrder($creator['id'], $tier, $price);
            Response::json(array_merge(['success' => true], $orderData));
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public static function upgrade(array $body): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireCreator($user);

        require_once dirname(__DIR__) . '/services/profileHelper.php';
        $creator = getOrCreateCreatorProfile($user['id'], $user);

        $tier = strtolower(trim($body['tier'] ?? ''));
        $orderId = $body['razorpay_order_id'] ?? '';
        $paymentId = $body['razorpay_payment_id'] ?? '';
        $signature = $body['razorpay_signature'] ?? '';

        if (empty($tier) || empty($orderId) || empty($paymentId)) {
            Response::error('tier, razorpay_order_id, and razorpay_payment_id are required.', 400);
        }

        try {
            $result = PaymentService::verifySubscriptionPayment([
                'creator_id' => $creator['id'],
                'tier' => $tier,
                'razorpay_order_id' => $orderId,
                'razorpay_payment_id' => $paymentId,
                'razorpay_signature' => $signature
            ]);
            Response::json($result);
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
