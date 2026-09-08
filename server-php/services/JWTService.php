<?php
/**
 * CreatorHub PHP Backend - Native JWT Service (HMAC-SHA256)
 * Zero external dependencies. Fully compatible with Node jsonwebtoken.
 */

class JWTService {
    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4 === 0 ? strlen($data) : strlen($data) + (4 - strlen($data) % 4), '=', STR_PAD_RIGHT));
    }

    public static function sign(array $payload, string $secret, int $expiresIn = 604800): string {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        
        $payload['iat'] = time();
        $payload['exp'] = time() + $expiresIn;

        $encodedHeader = self::base64UrlEncode(json_encode($header));
        $encodedPayload = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $secret, true);
        $encodedSignature = self::base64UrlEncode($signature);

        return "{$encodedHeader}.{$encodedPayload}.{$encodedSignature}";
    }

    public static function verify(string $token, string $secret): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

        $expectedSig = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $secret, true);
        $actualSig = self::base64UrlDecode($encodedSignature);

        if (!hash_equals($expectedSig, $actualSig)) {
            return null;
        }

        $payload = json_decode(self::base64UrlDecode($encodedPayload), true);
        if (!$payload || !is_array($payload)) {
            return null;
        }

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null; // Expired
        }

        return $payload;
    }
}
