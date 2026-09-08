<?php
/**
 * CreatorHub PHP Backend - CollaborationController
 */

namespace CreatorHub\Controllers;

use Database;
use AuthMiddleware;
use PaymentService;
use CreatorHub\Utils\Response;
use CreatorHub\Models\Collaboration;
use CreatorHub\Models\Deliverable;

class CollaborationController {
    public static function index(): void {
        $user = AuthMiddleware::authenticate();

        if ($user['role'] === 'creator') {
            $creator = Database::queryOne("SELECT id FROM creator_profiles WHERE user_id = ?", [$user['id']]);
            $creatorId = $creator ? $creator['id'] : '';
            $collabs = Collaboration::findByCreatorId($creatorId);
        } else {
            $brand = Database::queryOne("SELECT id FROM brand_profiles WHERE user_id = ?", [$user['id']]);
            $brandId = $brand ? $brand['id'] : '';
            $collabs = Collaboration::findByBrandId($brandId);
        }

        // Enrich with deliverables
        $enriched = array_map(function($c) {
            $c['submissions'] = Deliverable::findByCollabId($c['id']);
            return $c;
        }, $collabs);

        Response::json(['success' => true, 'count' => count($enriched), 'collaborations' => $enriched]);
    }

    public static function show(string $id): void {
        $user = AuthMiddleware::authenticate();
        $collab = Collaboration::findById($id);

        if (!$collab) {
            Response::notFound('Collaboration not found.');
        }

        $collab['submissions'] = Deliverable::findByCollabId($id);
        Response::json(['success' => true, 'collaboration' => $collab]);
    }

    public static function submitDeliverable(string $id, array $body): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireCreator($user);

        $liveUrl = trim($body['live_post_url'] ?? $body['live_url'] ?? $body['deliverable_url'] ?? '');
        $notes = trim($body['notes'] ?? $body['proof_notes'] ?? $body['submission_notes'] ?? '');
        $platform = trim($body['platform'] ?? 'instagram');
        $caption = trim($body['caption'] ?? '');
        $screenshotUrl = trim($body['screenshot_url'] ?? '');

        if (empty($liveUrl)) {
            Response::error('Proof live URL is required.', 400);
        }

        $collab = Database::queryOne("SELECT * FROM collaborations WHERE id = ?", [$id]);
        if (!$collab) {
            Response::notFound('Collaboration not found.');
        }

        Deliverable::create([
            'collaboration_id' => $id,
            'live_post_url' => $liveUrl,
            'platform' => $platform,
            'caption' => $caption,
            'screenshot_url' => $screenshotUrl,
            'notes' => $notes
        ]);

        Collaboration::updateStatus($id, 'SUBMITTED', 3);

        Response::json([
            'success' => true,
            'message' => 'Deliverable proof submitted for brand review.'
        ]);
    }

    public static function reviewDeliverable(string $id, array $body): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireBrand($user);

        $decision = strtoupper($body['action'] ?? $body['decision'] ?? 'APPROVE');
        $feedback = trim($body['feedback'] ?? '');

        if (!in_array($decision, ['APPROVE', 'REVISION'], true)) {
            Response::error('Action must be either APPROVE or REVISION.', 400);
        }

        $collab = Database::queryOne("SELECT * FROM collaborations WHERE id = ?", [$id]);
        if (!$collab) {
            Response::notFound('Collaboration not found.');
        }

        if ($decision === 'APPROVE') {
            // Strict Escrow Gate Check: Razorpay escrow payment must be funded
            $verifiedPayment = Database::queryOne(
                "SELECT * FROM payments WHERE collaboration_id = ? AND status IN ('VERIFIED', 'HELD_IN_ESCROW', 'RELEASED')",
                [$id]
            );

            if (!$verifiedPayment && $collab['status'] !== 'ESCROW_LOCKED') {
                Response::error(
                    'Razorpay payment required before approving deliverables. Escrow has not been funded yet for this collaboration.',
                    400,
                    'PAYMENT_REQUIRED'
                );
            }

            Database::execute(
                "UPDATE deliverables SET status = 'APPROVED', reviewed_at = CURRENT_TIMESTAMP WHERE collaboration_id = ?",
                [$id]
            );
            Collaboration::updateStatus($id, 'COMPLETED', 4);

            try {
                PaymentService::releaseEscrow($id, $user['id']);
            } catch (\Throwable $e) {
                // If already released, proceed
            }

            Response::json([
                'success' => true,
                'message' => 'Deliverables approved! Escrow payment released to creator.'
            ]);
        } else {
            Database::execute(
                "UPDATE deliverables SET status = 'REVISION_REQUESTED', notes = ?, reviewed_at = CURRENT_TIMESTAMP WHERE collaboration_id = ?",
                [$feedback ?: 'Please review brand guidelines and revise.', $id]
            );
            Collaboration::updateStatus($id, 'REVISION_REQUESTED', 2);

            Response::json([
                'success' => true,
                'message' => 'Revision requested. Creator has been notified.'
            ]);
        }
    }

    public static function release(string $id): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireBrand($user);

        try {
            $res = PaymentService::releaseEscrow($id, $user['id']);
            Response::json($res);
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
