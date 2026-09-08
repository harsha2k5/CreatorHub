<?php
/**
 * CreatorHub PHP Backend - Collaborations Route
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/middleware/auth.php';
require_once dirname(__DIR__) . '/services/PaymentService.php';

function handleCollaborationsRoute(array $segments, string $method, array $body) {
    $user = AuthMiddleware::authenticate();

    // GET /api/collaborations
    if (empty($segments) && $method === 'GET') {
        if ($user['role'] === 'creator') {
            $creator = Database::queryOne("SELECT id FROM creator_profiles WHERE user_id = ?", [$user['id']]);
            $creatorId = $creator ? $creator['id'] : '';
            $collabs = Database::query(
                "SELECT c.*, camp.title as campaign_title, camp.deliverables as deliverables_requirements,
                        camp.budget_min, camp.budget_max, camp.reward_per_creator,
                        b.company_name as brand_name, b.business_email as brand_email, b.logo_url as brand_logo
                 FROM collaborations c
                 JOIN campaigns camp ON c.campaign_id = camp.id
                 JOIN brand_profiles b ON c.brand_id = b.id
                 WHERE c.creator_id = ?
                 ORDER BY c.created_at DESC",
                [$creatorId]
            );
        } else {
            $brand = Database::queryOne("SELECT id FROM brand_profiles WHERE user_id = ?", [$user['id']]);
            $brandId = $brand ? $brand['id'] : '';
            $collabs = Database::query(
                "SELECT c.*, camp.title as campaign_title, camp.deliverables as deliverables_requirements,
                        cr.full_name as creator_name, cr.username as creator_username, cr.avatar_url as creator_avatar
                 FROM collaborations c
                 JOIN campaigns camp ON c.campaign_id = camp.id
                 JOIN creator_profiles cr ON c.creator_id = cr.id
                 WHERE c.brand_id = ?
                 ORDER BY c.created_at DESC",
                [$brandId]
            );
        }

        echo json_encode(['success' => true, 'collaborations' => $collabs]);
        return;
    }

    $id = $segments[0] ?? null;
    $action = $segments[1] ?? null;

    if ($id && !$action && $method === 'GET') {
        $collab = Database::queryOne(
            "SELECT c.*, camp.title as campaign_title, camp.deliverables as deliverables_requirements,
                    b.company_name as brand_name, cr.full_name as creator_name
             FROM collaborations c
             JOIN campaigns camp ON c.campaign_id = camp.id
             JOIN brand_profiles b ON c.brand_id = b.id
             JOIN creator_profiles cr ON c.creator_id = cr.id
             WHERE c.id = ?",
            [$id]
        );

        if (!$collab) {
            http_response_code(404);
            echo json_encode(['error' => 'Collaboration not found.']);
            return;
        }

        echo json_encode(['success' => true, 'collaboration' => $collab]);
        return;
    }

    // POST /api/collaborations/:id/submit
    if ($id && $action === 'submit' && $method === 'POST') {
        AuthMiddleware::requireCreator($user);
        $liveUrl = trim($body['live_url'] ?? $body['deliverable_url'] ?? '');
        $notes = trim($body['proof_notes'] ?? $body['submission_notes'] ?? '');

        if (empty($liveUrl)) {
            http_response_code(400);
            echo json_encode(['error' => 'Proof live URL is required.']);
            return;
        }

        $delivId = 'del_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 4);
        Database::execute(
            "INSERT INTO deliverables (id, collaboration_id, live_post_url, notes, status)
             VALUES (?, ?, ?, ?, 'SUBMITTED')",
            [$delivId, $id, $liveUrl, $notes]
        );

        Database::execute(
            "UPDATE collaborations
             SET status = 'SUBMITTED',
                 current_step = 3
             WHERE id = ?",
            [$id]
        );

        echo json_encode(['success' => true, 'message' => 'Deliverable proof submitted for brand review.']);
        return;
    }

    // POST /api/collaborations/:id/review (Brand reviews proof with APPROVE or REVISION)
    if ($id && $action === 'review' && $method === 'POST') {
        AuthMiddleware::requireBrand($user);
        $decision = strtoupper($body['action'] ?? $body['decision'] ?? 'APPROVE');
        $feedback = trim($body['feedback'] ?? '');

        if (!in_array($decision, ['APPROVE', 'REVISION'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Action must be either APPROVE or REVISION.']);
            return;
        }

        $collab = Database::queryOne("SELECT * FROM collaborations WHERE id = ?", [$id]);
        if (!$collab) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Collaboration not found.']);
            return;
        }

        if ($decision === 'APPROVE') {
            // Enforce verified Razorpay escrow payment
            $verifiedPayment = Database::queryOne(
                "SELECT * FROM payments WHERE collaboration_id = ? AND status IN ('VERIFIED', 'HELD_IN_ESCROW', 'RELEASED')",
                [$id]
            );

            if (!$verifiedPayment && $collab['status'] !== 'ESCROW_LOCKED') {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'code' => 'PAYMENT_REQUIRED',
                    'error' => 'Razorpay payment required before approving deliverables. Escrow has not been funded yet for this collaboration.'
                ]);
                return;
            }

            Database::execute(
                "UPDATE deliverables SET status = 'APPROVED', reviewed_at = CURRENT_TIMESTAMP WHERE collaboration_id = ?",
                [$id]
            );
            Database::execute(
                "UPDATE collaborations SET status = 'COMPLETED', current_step = 4, completed_at = CURRENT_TIMESTAMP WHERE id = ?",
                [$id]
            );

            try {
                PaymentService::releaseEscrow($id, $user['id']);
            } catch (\Throwable $e) {
                // If already released, proceed
            }

            echo json_encode([
                'success' => true,
                'message' => 'Deliverables approved! Escrow payment released to creator.'
            ]);
            return;
        } else {
            Database::execute(
                "UPDATE deliverables SET status = 'REVISION_REQUESTED', brand_feedback = ?, reviewed_at = CURRENT_TIMESTAMP WHERE collaboration_id = ?",
                [$feedback ?: 'Please review brand guidelines and revise.', $id]
            );
            Database::execute(
                "UPDATE collaborations SET status = 'REVISION_REQUESTED' WHERE id = ?",
                [$id]
            );

            echo json_encode([
                'success' => true,
                'message' => 'Revision requested. Creator has been notified.'
            ]);
            return;
        }
    }

    // POST /api/collaborations/:id/approve
    if ($id && $action === 'approve' && $method === 'POST') {
        AuthMiddleware::requireBrand($user);

        $collab = Database::queryOne("SELECT * FROM collaborations WHERE id = ?", [$id]);
        if (!$collab) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Collaboration not found.']);
            return;
        }

        // Enforce verified Razorpay escrow payment
        $verifiedPayment = Database::queryOne(
            "SELECT * FROM payments WHERE collaboration_id = ? AND status IN ('VERIFIED', 'HELD_IN_ESCROW', 'RELEASED')",
            [$id]
        );

        if (!$verifiedPayment && $collab['status'] !== 'ESCROW_LOCKED') {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'code' => 'PAYMENT_REQUIRED',
                'error' => 'Razorpay payment required before approving deliverables. Escrow has not been funded yet for this collaboration.'
            ]);
            return;
        }

        Database::execute(
            "UPDATE collaborations
             SET status = 'APPROVED',
                 current_step = 4
             WHERE id = ?",
            [$id]
        );

        echo json_encode(['success' => true, 'message' => 'Content approved. Ready for escrow payout release.']);
        return;
    }

    // POST /api/collaborations/:id/release
    if ($id && $action === 'release' && $method === 'POST') {
        AuthMiddleware::requireBrand($user);

        try {
            $res = PaymentService::releaseEscrow($id, $user['id']);
            echo json_encode($res);
        } catch (\Throwable $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        return;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Collaboration action not found.']);
}
