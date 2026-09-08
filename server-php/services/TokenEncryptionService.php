<?php
/**
 * CreatorHub PHP Backend - AES-256-GCM Token Encryption Service
 * 100% interoperable with Node.js TokenEncryptionService.cjs
 */

require_once dirname(__DIR__) . '/config/config.php';

class TokenEncryptionService {
    private static function getKey(): string {
        $secret = env('TOKEN_ENCRYPTION_KEY', env('JWT_SECRET', 'createrhub_secure_token_encryption_key_2026'));
        return hash('sha256', $secret, true); // 32 raw bytes
    }

    public static function encrypt(string $plainText): string {
        if (empty($plainText)) {
            return '';
        }

        $key = self::getKey();
        $iv = openssl_random_pseudo_bytes(12); // 96-bit IV
        $authTag = '';

        $cipherText = openssl_encrypt(
            $plainText,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $authTag
        );

        if ($cipherText === false) {
            return '';
        }

        return bin2hex($iv) . ':' . bin2hex($authTag) . ':' . bin2hex($cipherText);
    }

    public static function decrypt(string $cipherTextString): ?string {
        if (empty($cipherTextString)) {
            return null;
        }

        $parts = explode(':', $cipherTextString);
        if (count($parts) !== 3) {
            return null;
        }

        [$ivHex, $authTagHex, $encryptedHex] = $parts;
        $iv = hex2bin($ivHex);
        $authTag = hex2bin($authTagHex);
        $cipherText = hex2bin($encryptedHex);

        if ($iv === false || $authTag === false || $cipherText === false) {
            return null;
        }

        $key = self::getKey();
        $decrypted = openssl_decrypt(
            $cipherText,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $authTag
        );

        return $decrypted !== false ? $decrypted : null;
    }
}
