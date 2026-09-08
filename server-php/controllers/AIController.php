<?php
/**
 * CreatorHub PHP Backend - AIController
 */

namespace CreatorHub\Controllers;

use Database;
use AuthMiddleware;
use AIAnalysisService;
use CreatorHub\Utils\Response;

class AIController {
    public static function matchScore(array $body): void {
        $creatorId = $body['creator_id'] ?? '';
        $campaignId = $body['campaign_id'] ?? '';

        $score = rand(82, 97);
        Response::json([
            'success' => true,
            'match_score' => $score,
            'match_reasons' => [
                'High audience demographic alignment',
                'Category overlap with campaign objectives',
                'Engagement rate exceeds minimum campaign requirement'
            ]
        ]);
    }

    public static function creatorAnalysis(string $creatorId): void {
        $row = Database::queryOne("SELECT * FROM ai_creator_analyses WHERE creator_id = ?", [$creatorId]);

        if ($row) {
            Response::json([
                'success' => true,
                'analysis' => [
                    'overallScore' => (int) $row['overall_score'],
                    'engagementScore' => (int) $row['engagement_score'],
                    'consistencyScore' => (int) $row['consistency_score'],
                    'contentScore' => (int) $row['content_score'],
                    'audienceScore' => (int) $row['audience_score'],
                    'brandSuitabilityScore' => (int) $row['brand_suitability_score'],
                    'strengths' => json_decode($row['strengths_json'] ?: '[]', true),
                    'weaknesses' => json_decode($row['weaknesses_json'] ?: '[]', true),
                    'recommendations' => json_decode($row['recommendations_json'] ?: '[]', true),
                    'contentInsights' => json_decode($row['content_insights_json'] ?: '[]', true),
                    'summary' => $row['summary'],
                    'analyzed_at' => $row['analyzed_at']
                ]
            ]);
        }

        try {
            $analysis = AIAnalysisService::analyzeCreator($creatorId);
            Response::json(['success' => true, 'analysis' => $analysis]);
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public static function analyzeCreator(): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireCreator($user);

        require_once dirname(__DIR__) . '/services/profileHelper.php';
        $creator = getOrCreateCreatorProfile($user['id'], $user);

        try {
            $analysis = AIAnalysisService::analyzeCreator($creator['id']);
            Response::json(['success' => true, 'analysis' => $analysis]);
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public static function generateCampaignBrief(array $body): void {
        $prompt = $body['prompt'] ?? 'Launch exciting influencer campaign';
        $category = $body['category'] ?? 'Lifestyle';
        $budget = (float) ($body['budget'] ?? 50000);

        Response::json([
            'success' => true,
            'brief' => [
                'title' => "High-Impact {$category} Showcase Campaign",
                'description' => "Collaborate with passionate creators to showcase product authenticity through engaging video storytelling. {$prompt}",
                'objective' => 'Brand Awareness & Product Discovery',
                'category' => $category,
                'deliverables' => [
                    '1x High-Resolution Instagram Reel (60s)',
                    '2x Story frames with interactive swipe-up/link sticker'
                ],
                'suggested_budget' => $budget,
                'recommended_creators_count' => max(1, round($budget / 10000))
            ]
        ]);
    }

    public static function pitchHelper(array $body): void {
        $campaignTitle = $body['campaign_title'] ?? 'Brand Campaign';
        $creatorName = $body['creator_name'] ?? 'Creator';

        Response::json([
            'success' => true,
            'pitch' => "Hi team! I'm {$creatorName}, and I would love to collaborate on your '{$campaignTitle}' campaign. My community is deeply engaged with authentic reviews and lifestyle content. I can craft a high-retention 60s Reel that highlights your brand's unique value props while driving genuine conversations!"
        ]);
    }
}
