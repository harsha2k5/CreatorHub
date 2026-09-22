<?php
/**
 * CreatorHub - AES-256-GCM Cryptographic Token Encryption Service
 * Used for secure storage of Meta Instagram long-lived access tokens.
 */

declare(strict_types=1);

class TokenEncryptionService {
    private static function getKey(): string {
        $config = require dirname(__DIR__) . '/config/config.php';
        $rawKey = $config['jwt_secret'] ?? 'creatorhub_default_secret_key_32bytes_len';
        return hash('sha256', $rawKey, true); // 32-byte binary key
    }

    public static function encrypt(string $plaintext): string {
        if (empty($plaintext)) {
            return '';
        }

        $cipher = 'aes-256-gcm';
        $ivLen = openssl_cipher_iv_length($cipher);
        $iv = openssl_random_pseudo_bytes($ivLen);
        $tag = '';

        $ciphertext = openssl_encrypt(
            $plaintext,
            $cipher,
            self::getKey(),
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '',
            16
        );

        if ($ciphertext === false) {
            throw new \RuntimeException('Encryption failed');
        }

        return base64_encode($iv) . ':' . base64_encode($tag) . ':' . base64_encode($ciphertext);
    }

    public static function decrypt(string $payload): ?string {
        if (empty($payload)) {
            return null;
        }

        $parts = explode(':', $payload);
        if (count($parts) !== 3) {
            return null;
        }

        [$ivB64, $tagB64, $cipherB64] = $parts;
        $iv = base64_decode($ivB64);
        $tag = base64_decode($tagB64);
        $ciphertext = base64_decode($cipherB64);

        $plaintext = openssl_decrypt(
            $ciphertext,
            'aes-256-gcm',
            self::getKey(),
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        return $plaintext !== false ? $plaintext : null;
    }
}
