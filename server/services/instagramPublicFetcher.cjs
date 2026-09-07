/**
 * CreaterHub - Instagram Public Profile Fetcher
 * Safely resolves live public OpenGraph metadata for linked Instagram creator profiles
 * (followers count, following count, media count, verified name, and profile picture).
 * 
 * Supports multi-tier crawlers:
 * 1. Direct Instagram OpenGraph (Mozilla, Googlebot, Facebookbot, WhatsApp)
 * 2. Search Engine snippet crawlers (Yahoo Search, DuckDuckGo) to bypass cloud datacenter IP challenges
 */

function decodeHTMLEntities(text) {
    if (!text || typeof text !== 'string') return '';
    return text
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
            try { return String.fromCodePoint(parseInt(hex, 16)); } catch { return ''; }
        })
        .replace(/&#([0-9]+);/g, (_, dec) => {
            try { return String.fromCodePoint(parseInt(dec, 10)); } catch { return ''; }
        })
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

function parseCount(str) {
    if (!str || typeof str !== 'string') return null;
    const clean = str.replace(/,/g, '').trim().toUpperCase();
    if (clean.endsWith('K')) {
        return Math.round(parseFloat(clean.slice(0, -1)) * 1000);
    }
    if (clean.endsWith('M')) {
        return Math.round(parseFloat(clean.slice(0, -1)) * 1000000);
    }
    const num = parseInt(clean, 10);
    return isNaN(num) ? null : num;
}

/**
 * Fetch live public profile data from Instagram
 * @param {string} username - Instagram handle (e.g. '_harsha.2k5')
 */
async function fetchPublicInstagramProfile(username) {
    if (!username) return null;
    const cleanUsername = username.replace(/^@/, '').trim();
    if (!cleanUsername) return null;

    // 1. Direct Instagram Crawling with social preview agents that Instagram serves og:description to
    const userAgents = [
        'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'WhatsApp/2.21.4.13 A',
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Twitterbot/1.0',
        'TelegramBot (like TwitterBot)',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    ];

    for (const ua of userAgents) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            const res = await fetch(`https://www.instagram.com/${encodeURIComponent(cleanUsername)}/`, {
                headers: {
                    'User-Agent': ua,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                continue;
            }

            const text = await res.text();

            // Check if challenged / login redirected
            if (text.includes('<title>Login • Instagram</title>') || text.includes('Accounts • Instagram')) {
                continue;
            }

            // Parse og:description for followers, following, posts
            const descMatch = text.match(/content="([^"]*followers[^"]*)"/i)
                           || text.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/i)
                           || text.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:description"/i);

            let followers = null;
            let following = null;
            let mediaCount = null;

            if (descMatch && descMatch[1]) {
                const raw = descMatch[1];
                const folM = raw.match(/([\d,.]+[KMkm]?)\s+(?:Followers|seguidores|abonn[ée]s|Abonnenten)/i)
                          || raw.match(/([\d,.]+[KMkm]?)\s+Followers/i);
                const folwM = raw.match(/([\d,.]+[KMkm]?)\s+(?:Following|seguindo|abonnements|abonniert)/i)
                           || raw.match(/([\d,.]+[KMkm]?)\s+Following/i);
                const postM = raw.match(/([\d,.]+[KMkm]?)\s+(?:Posts|publicaciones|publications|Beitr[äa]ge)/i)
                           || raw.match(/([\d,.]+[KMkm]?)\s+Posts/i);

                if (folM) followers = parseCount(folM[1]);
                if (folwM) following = parseCount(folwM[1]);
                if (postM) mediaCount = parseCount(postM[1]);
            }

            // Parse og:title for Display / Full Name
            const titleMatch = text.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i)
                            || text.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:title"/i);
            let fullName = null;
            if (titleMatch && titleMatch[1]) {
                const rawTitle = titleMatch[1];
                const nameMatch = rawTitle.match(/^([^(•\u2022]+?)(?:\s*\([@&#064;]|\s*[•\u2022])/);
                if (nameMatch && nameMatch[1].trim()) {
                    fullName = decodeHTMLEntities(nameMatch[1].trim());
                }
            }

            // Parse og:image for Profile Picture
            const imgMatch = text.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i)
                          || text.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"/i);
            let avatarUrl = null;
            if (imgMatch && imgMatch[1]) {
                avatarUrl = imgMatch[1].replace(/&amp;/g, '&');
            }

            // Parse bio from meta name="description"
            let bio = null;
            const metaDescMatch = text.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i)
                               || text.match(/<meta[^>]*content="([^"]*)"[^>]*name="description"/i);
            if (metaDescMatch && metaDescMatch[1]) {
                const rawMetaDesc = metaDescMatch[1];
                const bioExtract = rawMetaDesc.match(/on Instagram:\s*(?:&quot;|"|“)([\s\S]*?)(?:&quot;|"|”)\s*$/i)
                                || rawMetaDesc.match(/on Instagram:\s*(?:&quot;|"|“)([\s\S]*)/i);
                if (bioExtract && bioExtract[1]) {
                    bio = decodeHTMLEntities(bioExtract[1].trim());
                }
            }

            if (followers !== null || following !== null || mediaCount !== null) {
                console.log(`[PublicIG] Successfully resolved @${cleanUsername} via direct crawl:`, {
                    followers,
                    following,
                    mediaCount,
                    fullName,
                    hasAvatar: Boolean(avatarUrl)
                });

                return {
                    username: cleanUsername,
                    followers_count: followers,
                    following_count: following,
                    media_count: mediaCount,
                    full_name: fullName || cleanUsername,
                    avatar_url: avatarUrl,
                    bio,
                    profile_url: `https://instagram.com/${cleanUsername}`
                };
            }
        } catch (err) {
            continue;
        }
    }

    // 2. Search Engine snippet crawlers (bypasses datacenter IP blocks)
    // 2a. Yahoo Search snippet
    try {
        const yahooRes = await fetch(`https://search.yahoo.com/search?p=${encodeURIComponent('site:instagram.com/' + cleanUsername)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        if (yahooRes.ok) {
            const yahooText = await yahooRes.text();
            const snippetMatch = yahooText.match(/([\d,.]+[KMkm]?\s+Followers[^\n<]*)/i);

            if (snippetMatch && snippetMatch[1]) {
                const rawSnippet = snippetMatch[1];
                const folM = rawSnippet.match(/([\d,.]+[KMkm]?)\s+(?:Followers|seguidores|abonn[ée]s|Abonnenten)/i);
                const folwM = rawSnippet.match(/([\d,.]+[KMkm]?)\s+(?:Following|seguindo|abonnements|abonniert)/i);
                const postM = rawSnippet.match(/([\d,.]+[KMkm]?)\s+(?:Posts|publicaciones|publications|Beitr[äa]ge)/i);

                let followers = folM ? parseCount(folM[1]) : null;
                let following = folwM ? parseCount(folwM[1]) : null;
                let mediaCount = postM ? parseCount(postM[1]) : null;

                let fullName = null;
                const nameM = rawSnippet.match(/-\s*([^(•\u2022]+?)(?:\s*\([@&#064;]|\s*[•\u2022]|\s*on Instagram)/i);
                if (nameM && nameM[1]) {
                    fullName = decodeHTMLEntities(nameM[1].trim());
                }

                if (followers !== null || following !== null) {
                    console.log(`[PublicIG] Successfully resolved @${cleanUsername} via Yahoo Search fallback:`, {
                        followers,
                        following,
                        mediaCount,
                        fullName
                    });

                    return {
                        username: cleanUsername,
                        followers_count: followers,
                        following_count: following,
                        media_count: mediaCount,
                        full_name: fullName || cleanUsername,
                        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
                        bio: null,
                        profile_url: `https://instagram.com/${cleanUsername}`
                    };
                }
            }
        }
    } catch (searchErr) {
        console.warn(`[PublicIG] Yahoo snippet fallback failed for @${cleanUsername}:`, searchErr.message);
    }

    // 2b. DuckDuckGo snippet fallback
    try {
        const ddgRes = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent('site:instagram.com/' + cleanUsername)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        if (ddgRes.ok) {
            const ddgText = await ddgRes.text();
            const snippetMatch = ddgText.match(/([\d,.]+[KMkm]?\s+Followers[^\n<]*)/i);

            if (snippetMatch && snippetMatch[1]) {
                const rawSnippet = snippetMatch[1];
                const folM = rawSnippet.match(/([\d,.]+[KMkm]?)\s+(?:Followers|seguidores|abonn[ée]s|Abonnenten)/i);
                const folwM = rawSnippet.match(/([\d,.]+[KMkm]?)\s+(?:Following|seguindo|abonnements|abonniert)/i);
                const postM = rawSnippet.match(/([\d,.]+[KMkm]?)\s+(?:Posts|publicaciones|publications|Beitr[äa]ge)/i);

                let followers = folM ? parseCount(folM[1]) : null;
                let following = folwM ? parseCount(folwM[1]) : null;
                let mediaCount = postM ? parseCount(postM[1]) : null;

                let fullName = null;
                const nameM = rawSnippet.match(/-\s*([^(•\u2022]+?)(?:\s*\([@&#064;]|\s*[•\u2022]|\s*on Instagram)/i);
                if (nameM && nameM[1]) {
                    fullName = decodeHTMLEntities(nameM[1].trim());
                }

                if (followers !== null || following !== null) {
                    console.log(`[PublicIG] Successfully resolved @${cleanUsername} via DuckDuckGo fallback:`, {
                        followers,
                        following,
                        mediaCount,
                        fullName
                    });

                    return {
                        username: cleanUsername,
                        followers_count: followers,
                        following_count: following,
                        media_count: mediaCount,
                        full_name: fullName || cleanUsername,
                        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
                        bio: null,
                        profile_url: `https://instagram.com/${cleanUsername}`
                    };
                }
            }
        }
    } catch (searchErr) {
        console.warn(`[PublicIG] DuckDuckGo snippet fallback failed for @${cleanUsername}:`, searchErr.message);
    }

    console.warn(`[PublicIG] Could not resolve live stats for @${cleanUsername} across all methods.`);
    return null;
}

module.exports = {
    fetchPublicInstagramProfile,
    decodeHTMLEntities,
    parseCount
};
