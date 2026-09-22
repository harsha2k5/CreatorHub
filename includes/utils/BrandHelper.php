<?php
/**
 * CreatorHub PHP Backend - BrandHelper
 * Intelligent Official Brand Logo & Domain Resolver
 */

namespace CreatorHub\Utils;

class BrandHelper {
    /**
     * Map of known brand keywords to official brand logos & domains
     */
    private static array $brandDomainMap = [
        // Beauty & Skincare / Wellness
        'himalaya' => 'https://www.google.com/s2/favicons?domain=himalayawellness.in&sz=256',
        'himalayan' => 'https://www.google.com/s2/favicons?domain=himalayawellness.in&sz=256',
        'mamaearth' => 'https://www.google.com/s2/favicons?domain=mamaearth.in&sz=256',
        'mama' => 'https://www.google.com/s2/favicons?domain=mamaearth.in&sz=256',
        'plum' => 'https://www.google.com/s2/favicons?domain=plumgoodness.com&sz=256',
        'sugar' => 'https://www.google.com/s2/favicons?domain=sugarcosmetics.com&sz=256',
        'minimalist' => 'https://www.google.com/s2/favicons?domain=beminimalist.co&sz=256',
        'nykaa' => 'https://www.google.com/s2/favicons?domain=nykaa.com&sz=256',
        'nyka' => 'https://www.google.com/s2/favicons?domain=nykaa.com&sz=256',
        'lakme' => 'https://www.google.com/s2/favicons?domain=lakmeindia.com&sz=256',
        'lakmé' => 'https://www.google.com/s2/favicons?domain=lakmeindia.com&sz=256',
        'wow skin' => 'https://www.google.com/s2/favicons?domain=buywow.in&sz=256',
        'forest essentials' => 'https://www.google.com/s2/favicons?domain=forestessentialsindia.com&sz=256',
        'kama ayurveda' => 'https://www.google.com/s2/favicons?domain=kamaayurveda.com&sz=256',
        'dot & key' => 'https://www.google.com/s2/favicons?domain=dotandkey.com&sz=256',
        'dot and key' => 'https://www.google.com/s2/favicons?domain=dotandkey.com&sz=256',
        'mcaffeine' => 'https://www.google.com/s2/favicons?domain=mcaffeine.com&sz=256',
        'biotique' => 'https://www.google.com/s2/favicons?domain=biotique.com&sz=256',
        'derma co' => 'https://www.google.com/s2/favicons?domain=thedermaco.com&sz=256',
        'cetaphil' => 'https://www.google.com/s2/favicons?domain=cetaphil.com&sz=256',
        'loreal' => 'https://www.google.com/s2/favicons?domain=lorealparis.co.in&sz=256',
        'body shop' => 'https://www.google.com/s2/favicons?domain=thebodyshop.in&sz=256',

        // Food & Beverage / Cafes
        'blue tokai' => 'https://www.google.com/s2/favicons?domain=bluetokaicoffee.com&sz=256',
        'bluetokai' => 'https://www.google.com/s2/favicons?domain=bluetokaicoffee.com&sz=256',
        'third wave' => 'https://www.google.com/s2/favicons?domain=thirdwavecoffeeroasters.com&sz=256',
        'thirdwave' => 'https://www.google.com/s2/favicons?domain=thirdwavecoffeeroasters.com&sz=256',
        'starbucks' => 'https://www.google.com/s2/favicons?domain=starbucks.in&sz=256',
        'cafe coffee day' => 'https://www.google.com/s2/favicons?domain=cafecoffeeday.com&sz=256',
        'ccd' => 'https://www.google.com/s2/favicons?domain=cafecoffeeday.com&sz=256',
        'chai point' => 'https://www.google.com/s2/favicons?domain=chaipoint.com&sz=256',
        'chaayos' => 'https://www.google.com/s2/favicons?domain=chaayos.com&sz=256',
        'zomato' => 'https://www.google.com/s2/favicons?domain=zomato.com&sz=256',
        'swiggy' => 'https://www.google.com/s2/favicons?domain=swiggy.com&sz=256',
        'mcdonald' => 'https://www.google.com/s2/favicons?domain=mcdonaldsindia.com&sz=256',
        'kfc' => 'https://www.google.com/s2/favicons?domain=kfc.co.in&sz=256',
        'domino' => 'https://www.google.com/s2/favicons?domain=dominos.co.in&sz=256',
        'subway' => 'https://www.google.com/s2/favicons?domain=subway.com&sz=256',
        'burger king' => 'https://www.google.com/s2/favicons?domain=burgerking.in&sz=256',
        'pizza hut' => 'https://www.google.com/s2/favicons?domain=pizzahut.co.in&sz=256',
        'amul' => 'https://www.google.com/s2/favicons?domain=amul.com&sz=256',
        'blinkit' => 'https://www.google.com/s2/favicons?domain=blinkit.com&sz=256',
        'zepto' => 'https://www.google.com/s2/favicons?domain=zeptonow.com&sz=256',

        // Fitness & Sports
        'cult.fit' => 'https://www.google.com/s2/favicons?domain=cult.fit&sz=256',
        'cultfit' => 'https://www.google.com/s2/favicons?domain=cult.fit&sz=256',
        'cult' => 'https://www.google.com/s2/favicons?domain=cult.fit&sz=256',
        'decathlon' => 'https://www.google.com/s2/favicons?domain=decathlon.in&sz=256',
        'muscleblaze' => 'https://www.google.com/s2/favicons?domain=muscleblaze.com&sz=256',
        'gymshark' => 'https://www.google.com/s2/favicons?domain=gymshark.com&sz=256',
        'nike' => 'https://www.google.com/s2/favicons?domain=nike.com&sz=256',
        'puma' => 'https://www.google.com/s2/favicons?domain=puma.com&sz=256',
        'adidas' => 'https://www.google.com/s2/favicons?domain=adidas.co.in&sz=256',

        // Technology & Gadgets
        'boat' => 'https://www.google.com/s2/favicons?domain=boat-lifestyle.com&sz=256',
        'noise' => 'https://www.google.com/s2/favicons?domain=gonoise.com&sz=256',
        'fire-boltt' => 'https://www.google.com/s2/favicons?domain=fireboltt.com&sz=256',
        'fireboltt' => 'https://www.google.com/s2/favicons?domain=fireboltt.com&sz=256',
        'lenskart' => 'https://www.google.com/s2/favicons?domain=lenskart.com&sz=256',
        'apple' => 'https://www.google.com/s2/favicons?domain=apple.com&sz=256',
        'samsung' => 'https://www.google.com/s2/favicons?domain=samsung.com&sz=256',
        'oneplus' => 'https://www.google.com/s2/favicons?domain=oneplus.in&sz=256',
        'sony' => 'https://www.google.com/s2/favicons?domain=sony.co.in&sz=256',

        // Fashion & Apparel
        'myntra' => 'https://www.google.com/s2/favicons?domain=myntra.com&sz=256',
        'souled store' => 'https://www.google.com/s2/favicons?domain=thesouledstore.com&sz=256',
        'souled' => 'https://www.google.com/s2/favicons?domain=thesouledstore.com&sz=256',
        'snitch' => 'https://www.google.com/s2/favicons?domain=snitch.co.in&sz=256',
        'zara' => 'https://www.google.com/s2/favicons?domain=zara.com&sz=256',
        'h&m' => 'https://www.google.com/s2/favicons?domain=hm.com&sz=256',
        'ajio' => 'https://www.google.com/s2/favicons?domain=ajio.com&sz=256',
        'urbanic' => 'https://www.google.com/s2/favicons?domain=urbanic.com&sz=256',
        'bewakoof' => 'https://www.google.com/s2/favicons?domain=bewakoof.com&sz=256',
        'fabindia' => 'https://www.google.com/s2/favicons?domain=fabindia.com&sz=256',
    ];

    /**
     * Resolve the authentic brand logo (clean, square, centered)
     */
    public static function resolveLogo(?string $companyName, ?string $category = '', ?string $email = '', ?string $providedLogo = ''): string {
        $cName = strtolower(trim($companyName ?? ''));
        $cat = strtolower(trim($category ?? ''));
        $em = strtolower(trim($email ?? ''));
        $prov = trim($providedLogo ?? '');

        // If user explicitly provided a custom valid direct image URL
        if (!empty($prov) && !str_contains($prov, 'photo-1490481651871-ab68de25d43d') && !str_contains($prov, 'photo-1501339847302')) {
            return $prov;
        }

        $fullSearch = "{$cName} {$em}";

        // 1. Check known brand domains/logos
        foreach (self::$brandDomainMap as $keyword => $url) {
            if (str_contains($fullSearch, $keyword)) {
                return $url;
            }
        }

        // 2. If business email has a real custom company domain (e.g. user@indiranagarcoffee.in)
        if (!empty($em) && str_contains($em, '@')) {
            $domain = explode('@', $em)[1] ?? '';
            $domain = trim(strtolower($domain));
            if (!empty($domain) && !in_array($domain, ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'proton.me', 'example.com'])) {
                return "https://www.google.com/s2/favicons?domain={$domain}&sz=256";
            }
        }

        // 3. Dynamic crisp SVG Monogram Logo Badge for any arbitrary new brand
        $displayName = !empty($companyName) ? $companyName : 'Brand';
        $bgColors = [
            'beauty & skincare' => '0d9488', // Teal
            'beauty' => '0d9488',
            'skincare' => '0d9488',
            'food & beverage' => 'ea580c', // Orange Amber
            'food' => 'ea580c',
            'fitness & sports' => '6366f1', // Indigo
            'fitness & wellness' => '6366f1',
            'technology' => '0284c7', // Sky Blue
            'software & saas' => '0284c7',
            'fashion & apparel' => '18181b', // Luxe Charcoal
            'fashion' => '18181b',
            'lifestyle' => '8b5cf6', // Violet
        ];

        $color = '0d9488';
        foreach ($bgColors as $k => $c) {
            if (str_contains($cat, $k)) {
                $color = $c;
                break;
            }
        }

        $encoded = urlencode(ucwords($displayName));
        return "https://api.dicebear.com/7.x/initials/svg?seed={$encoded}&backgroundColor={$color}&textColor=ffffff&fontSize=42&fontWeight=800";
    }

    /**
     * Auto-heal brand profile in database with authentic official logo
     */
    public static function autoHealProfile(array &$brandProf, string $email = ''): bool {
        if (empty($brandProf)) return false;

        $cName = strtolower($brandProf['company_name'] ?? '');
        $logo = $brandProf['logo_url'] ?? '';
        $cat = strtolower($brandProf['category'] ?? '');
        $em = strtolower($email);

        $isOutdated = empty($logo)
            || str_contains($logo, 'photo-1490481651871-ab68de25d43d')
            || str_contains($logo, 'photo-1501339847302')
            || (str_contains($cName, 'himalaya') && str_contains($logo, 'photo-1556228720-195a672e8a03'));

        if ($isOutdated || str_contains($cName, 'himalaya') || str_contains($cName, 'mamaearth') || str_contains($cName, 'boat') || str_contains($cName, 'starbucks')) {
            $newLogo = self::resolveLogo($brandProf['company_name'] ?? '', $brandProf['category'] ?? '', $em, $logo);
            if ($newLogo !== $logo) {
                $brandProf['logo_url'] = $newLogo;
                if (!empty($brandProf['id'])) {
                    \Database::execute("UPDATE brand_profiles SET logo_url = ? WHERE id = ?", [$newLogo, $brandProf['id']]);
                }
                return true;
            }
        }

        return false;
    }
}
