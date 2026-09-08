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

        Database::execute(
            "UPDATE collaborations
             SET status = 'SUBMITTED',
                 current_step = 3,
                 live_url = ?,
                 submission_notes = ?,
                 submitted_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?",
            [$liveUrl, $notes, $id]
        );

        echo json_encode(['success' => true, 'message' => 'Deliverable proof submitted for brand review.']);
        return;
    }

    // POST /api/collaborations/:id/approve
    if ($id && $action === 'approve' && $method === 'POST') {
        AuthMiddleware::requireBrand($user);

        Database::execute(
            "UPDATE collaborations
             SET status = 'APPROVED',
                 current_step = 4,
                 approved_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
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
