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
 * Crawl single agent with strict timeout
 */
async function crawlSingleAgent(cleanUsername, ua, timeoutMs = 3500) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(`https://www.instagram.com/${encodeURIComponent(cleanUsername)}/`, {
            headers: {
                'User-Agent': ua,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) return null;

        const text = await res.text();

        // Check if challenged / login redirected
        if (text.includes('<title>Login • Instagram</title>') || text.includes('Accounts • Instagram')) {
            return null;
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
        return null;
    } catch {
        return null;
    }
}

/**
 * Fallback crawler: Yahoo search snippet with strict timeout
 */
async function crawlYahooSearch(cleanUsername, timeoutMs = 3500) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const yahooRes = await fetch(`https://search.yahoo.com/search?p=${encodeURIComponent('site:instagram.com/' + cleanUsername)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

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
    } catch {
        // Fallback aborted or failed
    }
    return null;
}

/**
 * Fallback crawler: DuckDuckGo search snippet with strict timeout
 */
async function crawlDuckDuckGo(cleanUsername, timeoutMs = 3500) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const ddgRes = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent('site:instagram.com/' + cleanUsername)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

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
    } catch {
        // Fallback aborted or failed
    }
    return null;
}

/**
 * Fetch live public profile data from Instagram with rapid parallel racing
 * @param {string} username - Instagram handle (e.g. 'crazy__rider__84')
 */
async function fetchPublicInstagramProfile(username) {
    if (!username) return null;
    const cleanUsername = username.replace(/^@/, '').trim();
    if (!cleanUsername) return null;

    // 1. Direct Crawl: Run top agents in parallel (3.5s timeout)
    const directAgents = [
        'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'WhatsApp/2.21.4.13 A'
    ];

    const directResults = await Promise.all(directAgents.map(ua => crawlSingleAgent(cleanUsername, ua, 3500)));
    const validDirect = directResults.find(r => r && (r.followers_count !== null || r.following_count !== null));
    if (validDirect) {
        console.log(`[PublicIG] Resolved @${cleanUsername} via direct crawl:`, {
            followers: validDirect.followers_count,
            following: validDirect.following_count,
            mediaCount: validDirect.media_count,
            fullName: validDirect.full_name
        });
        return validDirect;
    }

    // 2. Search Engine snippet crawlers in parallel (3.5s timeout)
    const searchResults = await Promise.all([
        crawlYahooSearch(cleanUsername, 3500),
        crawlDuckDuckGo(cleanUsername, 3500)
    ]);
    const validSearch = searchResults.find(r => r && (r.followers_count !== null || r.following_count !== null));
    if (validSearch) {
        console.log(`[PublicIG] Resolved @${cleanUsername} via search snippet:`, {
            followers: validSearch.followers_count,
            following: validSearch.following_count,
            fullName: validSearch.full_name
        });
        return validSearch;
    }

    // 3. Return clean partial structure if cloud IP was challenged/shielded by Instagram
    console.warn(`[PublicIG] Cloud datacenter IP challenged or stats restricted for @${cleanUsername}.`);
    return {
        username: cleanUsername,
        followers_count: null,
        following_count: null,
        media_count: null,
        full_name: cleanUsername,
        avatar_url: null,
        bio: null,
        profile_url: `https://instagram.com/${cleanUsername}`,
        is_datacenter_restricted: true
    };
}

module.exports = {
    fetchPublicInstagramProfile,
    decodeHTMLEntities,
    parseCount
};
