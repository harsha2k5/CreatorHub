<?php
/**
 * CreatorHub PHP Backend - Deliverable Model
 */

namespace CreatorHub\Models;

use Database;

class Deliverable {
    public static function findById(string $id): ?array {
        return Database::queryOne("SELECT * FROM deliverables WHERE id = ?", [$id]);
    }

    public static function findByCollabId(string $collabId): array {
        return Database::query("SELECT * FROM deliverables WHERE collaboration_id = ? ORDER BY submitted_at DESC", [$collabId]);
    }

    public static function create(array $data): string {
        $id = $data['id'] ?? ('del_' . time() . '_' . bin2hex(random_bytes(3)));
        Database::execute(
            "INSERT INTO deliverables (
                id, collaboration_id, live_post_url, platform, caption,
                screenshot_url, notes, status, submitted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', datetime('now'))",
            [
                $id,
                $data['collaboration_id'],
                trim($data['live_post_url']),
                $data['platform'] ?? 'instagram',
                $data['caption'] ?? '',
                $data['screenshot_url'] ?? '',
                $data['notes'] ?? ''
            ]
        );
        return $id;
    }

    public static function updateStatus(string $id, string $status, ?string $feedback = null): bool {
        return Database::execute(
            "UPDATE deliverables SET status = ?, review_notes = ?, reviewed_at = datetime('now') WHERE id = ?",
            [$status, $feedback, $id]
        ) > 0;
    }
}
