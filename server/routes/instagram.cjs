/**
 * CreaterHub - Production Instagram API Routes
 * 
 * Implements official Meta Instagram Graph API endpoints:
 * - OAuth 2.0 connection & CSRF state verification
 * - Resilient synchronization preserving valid historical data
 * - Strict null-preservation for all metrics & interactions
 * - Server-side token protection (zero token leakage to clients)
 * - Transparent Data Source labeling (Source: Instagram / CreaterHub Analytics / DEMO DATA)
 */

const express = require('express');
const router = express.Router();
const { queryOne, run } = require('../db/database.cjs');
const { authenticateToken, requireCreator } = require('../middleware/auth.cjs');
const InstagramService = require('../services/InstagramService.cjs');
const InstagramValidationService = require('../services/InstagramValidationService.cjs');
const InstagramInsightsService = require('../services/InstagramInsightsService.cjs');
const InstagramMediaSyncService = require('../services/InstagramMediaSyncService.cjs');
const { fetchPublicInstagramProfile } = require('../services/instagramPublicFetcher.cjs');
const { getOrCreateCreatorProfile } = require('../services/profileHelper.cjs');

/**
 * Helper to map Meta API errors to friendly production messages
 */
function mapInstagramError(err) {
    const message = err.message || '';
    if (message.includes('OAuthException') || message.includes('token expired') || message.includes('code 190')) {
        return {
            status: 401,
            code: 'TOKEN_EXPIRED',
            error: 'Instagram authorization expired. Please reconnect your account.'
        };
    }
    if (message.includes('rate limit') || message.includes('calls to this api have exceeded') || message.includes('code 4') || message.includes('code 17') || message.includes('code 32')) {
        return {
            status: 429,
            code: 'RATE_LIMITED',
            error: 'Instagram API rate limit reached. Showing cached data. Please try again later.'
        };
    }
    if (message.includes('eligible professional Instagram account') || message.includes('cannot currently be connected')) {
        return {
            status: 400,
            code: 'INELIGIBLE_ACCOUNT',
            error: "Your Instagram account cannot currently be connected through Meta's Instagram API. Please make sure you are using an eligible professional Instagram account."
        };
    }
    if (message.includes('already connected to another')) {
        return {
            status: 409,
            code: 'DUPLICATE_ACCOUNT',
            error: message
        };
    }
    if (message.includes('Invalid OAuth state') || message.includes('expired')) {
        return {
            status: 400,
            code: 'INVALID_STATE',
            error: message
        };
    }
    return {
        status: 500,
        code: 'INSTAGRAM_API_ERROR',
        error: message || 'An error occurred while communicating with Instagram API.'
    };
}

/**
 * GET /api/instagram/connect & GET /api/instagram/connect-url
 * Generates official Meta OAuth URL with cryptographic state parameter
 */
const handleConnectUrl = (req, res) => {
    try {
        const creator = getOrCreateCreatorProfile(req.user.id, req.user);
        if (!creator) {
            return res.status(404).json({ success: false, error: 'Creator profile not found.' });
        }

        // Dynamically compute redirectUri if running in cloud/production and META_REDIRECT_URI points to localhost
        let redirectUri = process.env.META_REDIRECT_URI;
        const host = req.get('host');
        const origin = req.headers.origin || (host ? `${req.protocol}://${host}` : null);
        if (!redirectUri || redirectUri.includes('localhost') || redirectUri.includes('127.0.0.1')) {
            if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
                redirectUri = `${origin}/creator/dashboard`;
            }
        }

        const result = InstagramService.getAuthorizationUrl(creator.id, redirectUri);
        return res.json({
            success: true,
            is_configured: result.configured,
            is_mock_available: result.is_mock_available || false,
            auth_url: result.url,
            state_token: result.stateToken || null,
            redirect_uri: redirectUri,
            message: result.message
        });
    } catch (err) {
        console.error('Error generating Instagram connect URL:', err);
        const mapped = mapInstagramError(err);
        return res.status(mapped.status).json({ success: false, error: mapped.error, error_code: mapped.code });
    }
};

router.get('/connect', authenticateToken, requireCreator, handleConnectUrl);
router.get('/connect-url', authenticateToken, requireCreator, handleConnectUrl);

/**
 * POST /api/instagram/callback
 * Exchanges OAuth authorization code with Meta Graph API, binds account,
 * performs initial media and insights synchronization.
 */
router.post('/callback', authenticateToken, requireCreator, async (req, res) => {
    try {
        const creator = getOrCreateCreatorProfile(req.user.id, req.user);
        if (!creator) {
            return res.status(404).json({ success: false, error: 'Creator profile not found.' });
        }

        const { code, state } = req.body;
        if (!code) {
            return res.status(400).json({ success: false, error: 'OAuth authorization code is required.' });
        }

        const syncResult = await InstagramService.connectAccount({
            creatorId: creator.id,
            userId: req.user.id,
            code,
            stateToken: state || null
        });

        return res.json({
            success: true,
            message: 'Instagram Professional account connected successfully via Meta Graph API.',
            data: syncResult
        });
    } catch (err) {
        console.error('Instagram OAuth callback error:', err);
        const mapped = mapInstagramError(err);
        return res.status(mapped.status).json({ success: false, error: mapped.error, error_code: mapped.code });
    }
});

/**
 * GET /api/instagram/callback
 * Direct redirect target for Meta OAuth authorization redirect
 */
router.get('/callback', async (req, res) => {
    const { code, state, error, error_description } = req.query;
    
    if (error) {
        return res.redirect(`/creator/dashboard?ig_error=${encodeURIComponent(error_description || error)}`);
    }

    if (!code) {
        return res.redirect('/creator/dashboard?ig_error=Missing+authorization+code');
    }

    // Redirect to creator dashboard with code & state so the authenticated frontend client handles the POST
    return res.redirect(`/creator/dashboard?ig_code=${encodeURIComponent(code)}&ig_state=${encodeURIComponent(state || '')}`);
});

/**
 * POST /api/instagram/disconnect
 * Disconnects the linked Instagram account and revokes access token
 */
router.post('/disconnect', authenticateToken, requireCreator, (req, res) => {
    try {
        const creator = getOrCreateCreatorProfile(req.user.id, req.user);
        if (!creator) {
            return res.status(404).json({ success: false, error: 'Creator profile not found.' });
        }

        const result = InstagramService.disconnect(creator.id);
        return res.json(result);
    } catch (err) {
        console.error('Error disconnecting Instagram account:', err);
        const mapped = mapInstagramError(err);
        return res.status(mapped.status).json({ success: false, error: mapped.error, error_code: mapped.code });
    }
});

/**
 * GET /api/instagram/status
 * Returns authoritative connection status, linked account profile, latest metrics, and media
 */
router.get('/status', authenticateToken, requireCreator, async (req, res) => {
    try {
        const creator = getOrCreateCreatorProfile(req.user.id, req.user);
        if (!creator) {
            return res.status(404).json({ success: false, error: 'Creator profile not found.' });
        }

        let status = InstagramService.getStatus(creator.id);
        const currentFollowers = status.metrics?.followers?.value;
        if (status.is_connected && status.account?.account_type === 'DIRECT_LINK' && (!currentFollowers || currentFollowers === 0)) {
            try {
                await InstagramService.syncAccount(creator.id);
                status = InstagramService.getStatus(creator.id);
            } catch (healErr) {
                console.warn('[AutoHeal IG Status] Auto-heal sync attempt:', healErr.message);
            }
        }

        return res.json({ success: true, ...status });
    } catch (err) {
        console.error('Error retrieving Instagram status:', err);
        const mapped = mapInstagramError(err);
        return res.status(mapped.status).json({ success: false, error: mapped.error, error_code: mapped.code });
    }
});

/**
 * GET /api/instagram/profile
 * Returns detailed Instagram profile information for connected creator
 */
router.get('/profile', authenticateToken, requireCreator, (req, res) => {
    try {
        const creator = getOrCreateCreatorProfile(req.user.id, req.user);
        if (!creator) {
            return res.status(404).json({ success: false, error: 'Creator profile not found.' });
        }

        const status = InstagramService.getStatus(creator.id);
        if (!status.is_connected || !status.account) {
            return res.status(404).json({ success: false, error: 'No active Instagram account connected.' });
        }

        return res.json({
            success: true,
            profile: status.account,
            connection_status: status.connection_status,
            is_mock: status.is_mock,
            mock_badge: status.mock_badge
        });
    } catch (err) {
        console.error('Error retrieving Instagram profile:', err);
        const mapped = mapInstagramError(err);
        return res.status(mapped.status).json({ success: false, error: mapped.error, error_code: mapped.code });
    }
});

/**
 * POST /api/instagram/sync
 * Refreshes and synchronizes Instagram metrics and data
 */
router.post('/sync', authenticateToken, requireCreator, async (req, res) => {
    try {
        const creator = getOrCreateCreatorProfile(req.user.id, req.user);
        if (!creator) {
            return res.status(404).json({ success: false, error: 'Creator profile not found.' });
        }

        await InstagramService.syncAccount(creator.id);
        const status = InstagramService.getStatus(creator.id);
        return res.json({
            success: true,
            message: 'Instagram data synchronized successfully.',
            ...status
        });
    } catch (err) {
        console.error('Instagram sync error:', err);
        const mapped = mapInstagramError(err);
        return res.status(mapped.status).json({ success: false, error: mapped.error, error_code: mapped.code });
    }
});

/**
 * GET /api/instagram/metrics
 * Returns authoritative latest metrics, preserved nulls, and trends
 */
router.get('/metrics', authenticateToken, requireCreator, (req, res) => {
    try {
        const creator = getOrCreateCreatorProfile(req.user.id, req.user);
        if (!creator) {
            return res.status(404).json({ success: false, error: 'Creator profile not found.' });
        }

        const status = InstagramService.getStatus(creator.id);
        return res.json({
            success: true,
            is_connected: status.is_connected,
            connection_status: status.connection_status,
            account: status.account,
            metrics: status.metrics,
            trends: status.trends,
            media: status.media,
            snapshots: status.snapshots,
            is_mock: status.is_mock,
            mock_badge: status.mock_badge
        });
    } catch (err) {
        console.error('Error retrieving Instagram metrics:', err);
        const mapped = mapInstagramError(err);
        return res.status(mapped.status).json({ success: false, error: mapped.error, error_code: mapped.code });
    }
});

/**
 * GET /api/instagram/media
 * Returns synchronized recent media items with null-preserved interactions
 */
router.get('/media', authenticateToken, requireCreator, (req, res) => {
    try {
        const creator = getOrCreateCreatorProfile(req.user.id, req.user);
        if (!creator) {
            return res.status(404).json({ success: false, error: 'Creator profile not found.' });
        }

        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
        const media = InstagramMediaSyncService.getCreatorMedia(creator.id, limit);

        return res.json({
            success: true,
            media,
            count: media.length
        });
    } catch (err) {
        console.error('Error retrieving Instagram media:', err);
        const mapped = mapInstagramError(err);
        return res.status(mapped.status).json({ success: false, error: mapped.error, error_code: mapped.code });
    }
});

/**
 * GET /api/instagram/insights
 * Returns reach, impressions, profile views, and historical snapshots
 */
router.get('/insights', authenticateToken, requireCreator, (req, res) => {
    try {
        const creator = getOrCreateCreatorProfile(req.user.id, req.user);
        if (!creator) {
            return res.status(404).json({ success: false, error: 'Creator profile not found.' });
        }

        const account = queryOne('SELECT id FROM instagram_accounts WHERE creator_id = ? AND is_connected = 1', [creator.id]);
        if (!account) {
            return res.status(404).json({ success: false, error: 'No active Instagram account connected.' });
        }

        const historical = InstagramInsightsService.getHistoricalTrends(account.id);
        return res.json({
            success: true,
            trends: historical.trends,
            snapshots: historical.snapshots,
            has_sufficient_chart_data: historical.trends.hasSufficientHistory
        });
    } catch (err) {
        console.error('Error retrieving Instagram insights:', err);
        const mapped = mapInstagramError(err);
        return res.status(mapped.status).json({ success: false, error: mapped.error, error_code: mapped.code });
    }
});


/**
 * Helper to safely extract Instagram username from URLs or @handles
 */
function extractInstagramUsername(input) {
    if (!input || typeof input !== 'string') return null;
    let str = input.trim();
    str = str.split('?')[0].split('#')[0].replace(/\/+$/, '');
    const matchUrl = str.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)/i);
    if (matchUrl && matchUrl[1]) {
        const forbidden = ['p', 'explore', 'reels', 'stories', 'direct', 'accounts', 'about'];
        if (!forbidden.includes(matchUrl[1].toLowerCase())) {
            return matchUrl[1];
        }
    }
    const cleanHandle = str.replace(/^@/, '').trim();
    if (/^[a-zA-Z0-9_.]{1,30}$/.test(cleanHandle)) {
        return cleanHandle;
    }
    return null;
}

/**
 * POST /api/instagram/verify-link
 * Crawls and verifies live public Instagram stats (followers, following, posts, full name, avatar, bio)
 * before connecting or updating link.
 */
router.post('/verify-link', authenticateToken, requireCreator, async (req, res) => {
    try {
        const rawInput = req.body.profileUrl || req.body.link || req.body.username;
        if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
            return res.status(400).json({ success: false, error: 'Please enter an Instagram profile link or handle.' });
        }

        const username = extractInstagramUsername(rawInput);
        if (!username) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Instagram link. Please enter a valid profile link like https://instagram.com/your_handle or @your_handle'
            });
        }

        console.log(`[VerifyIG] Crawling live public profile for: @${username}`);
        const liveProfile = await fetchPublicInstagramProfile(username);

        if (liveProfile && (liveProfile.followers_count !== null || liveProfile.following_count !== null || liveProfile.media_count !== null)) {
            return res.json({
                success: true,
                profile: {
                    username: liveProfile.username || username,
                    followers_count: liveProfile.followers_count,
                    following_count: liveProfile.following_count,
                    media_count: liveProfile.media_count,
                    full_name: liveProfile.full_name || username,
                    avatar_url: liveProfile.avatar_url,
                    bio: liveProfile.bio,
                    profile_url: `https://instagram.com/${username}`
                }
            });
        }

        // Return partial account info if private / bot-shielded
        return res.json({
            success: true,
            partial: true,
            profile: {
                username,
                followers_count: null,
                following_count: null,
                media_count: null,
                full_name: username,
                avatar_url: null,
                bio: null,
                profile_url: `https://instagram.com/${username}`,
                is_datacenter_restricted: Boolean(liveProfile && liveProfile.is_datacenter_restricted)
            },
            message: `Account @${username} detected. Instagram bot shield is active for cloud datacenters; please confirm your follower count below to connect.`
        });
    } catch (err) {
        console.error('Error verifying Instagram link:', err);
        return res.status(500).json({
            success: false,
            error: err.message || 'Failed to verify Instagram profile.'
        });
    }
});

/**
 * POST /api/instagram/connect-by-link
 * Effortlessly links an Instagram account by pasting an Instagram profile URL or handle.
 */
router.post('/connect-by-link', authenticateToken, requireCreator, async (req, res) => {
    try {
        const creator = getOrCreateCreatorProfile(req.user.id, req.user);
        if (!creator) {
            return res.status(404).json({ success: false, error: 'Creator profile not found.' });
        }

        const rawInput = req.body.profileUrl || req.body.link || req.body.username;
        if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
            return res.status(400).json({ success: false, error: 'Please enter or paste your Instagram profile link or handle.' });
        }

        const username = extractInstagramUsername(rawInput);
        if (!username) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Instagram link. Please enter a valid profile link like https://instagram.com/your_handle or @_your_handle'
            });
        }

        const result = await InstagramService.connectByProfileLink({
            creatorId: creator.id,
            userId: req.user.id,
            creator,
            username,
            profileUrl: `https://instagram.com/${username}`,
            followersCount: req.body.followersCount !== undefined && req.body.followersCount !== '' && req.body.followersCount !== null ? Number(req.body.followersCount) : null,
            followingCount: req.body.followingCount !== undefined && req.body.followingCount !== '' && req.body.followingCount !== null ? Number(req.body.followingCount) : null,
            mediaCount: req.body.mediaCount !== undefined && req.body.mediaCount !== '' && req.body.mediaCount !== null ? Number(req.body.mediaCount) : null,
            engagementRate: req.body.engagementRate !== undefined && req.body.engagementRate !== '' && req.body.engagementRate !== null ? Number(req.body.engagementRate) : null,
            bio: req.body.bio || null
        });

        const status = InstagramService.getStatus(creator.id);

        return res.json({
            success: true,
            message: `Instagram account @${username} connected and verified successfully!`,
            account: result,
            ...status
        });
    } catch (err) {
        console.error('Error connecting Instagram by link:', err);
        return res.status(400).json({
            success: false,
            error: err.message || 'Failed to connect Instagram account.'
        });
    }
});

/**
 * POST /api/instagram/sandbox-connect
 * Developer Mock Mode for local testing and demonstration.
 * STRICT PRODUCTION BARRIER: Throws immediately if NODE_ENV === 'production'
 */
router.post('/sandbox-connect', authenticateToken, requireCreator, (req, res) => {
    try {
        const creator = getOrCreateCreatorProfile(req.user.id, req.user);
        if (!creator) {
            return res.status(404).json({ success: false, error: 'Creator profile not found.' });
        }

        const result = InstagramService.connectSandboxAccount(creator.id, req.body);
        return res.json({ success: true, ...result });
    } catch (err) {
        console.error('Error connecting sandbox/mock Instagram account:', err);
        return res.status(400).json({
            success: false,
            error: err.message || 'Failed to connect sandbox mode.'
        });
    }
});

/**
 * GET /api/instagram/config-status
 * Developer / Admin diagnostics (never exposes app secret or access tokens)
 */
router.get('/config-status', (req, res) => {
    return res.json({
        success: true,
        meta_app_id_configured: Boolean(process.env.META_APP_ID),
        meta_app_secret_configured: Boolean(process.env.META_APP_SECRET),
        mock_mode_available: process.env.NODE_ENV !== 'production' && process.env.USE_INSTAGRAM_MOCK === 'true',
        environment: process.env.NODE_ENV || 'development'
    });
});

/**
 * GET /api/instagram/debug-ig/:username
 * Diagnostic endpoint to test crawler connectivity in cloud environment
 */
router.get('/debug-ig/:username', async (req, res) => {
    const cleanUsername = req.params.username.replace(/^@/, '').trim();
    const results = {};

    // 1. Googlebot
    try {
        const r1 = await fetch(`https://www.instagram.com/${cleanUsername}/`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }
        });
        const t1 = await r1.text();
        const m1 = t1.match(/content="([^"]*followers[^"]*)"/i);
        results.googlebot = { status: r1.status, match: m1 ? m1[1] : null, len: t1.length, title: (t1.match(/<title>([^<]*)<\/title>/i) || [])[1] };
    } catch (e) {
        results.googlebot = { error: e.message };
    }

    // 2. Facebookbot
    try {
        const r2 = await fetch(`https://www.instagram.com/${cleanUsername}/`, {
            headers: { 'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' }
        });
        const t2 = await r2.text();
        const m2 = t2.match(/content="([^"]*followers[^"]*)"/i);
        results.facebookbot = { status: r2.status, match: m2 ? m2[1] : null, len: t2.length };
    } catch (e) {
        results.facebookbot = { error: e.message };
    }

    // 3. DuckDuckGo search snippet
    try {
        const r3 = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent('site:instagram.com/' + cleanUsername)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const t3 = await r3.text();
        const m3 = t3.match(/([\d,.]+[KMkm]?\s+Followers[^\n<]*)/i);
        results.duckduckgo = { status: r3.status, match: m3 ? m3[0] : null };
    } catch (e) {
        results.duckduckgo = { error: e.message };
    }

    // 4. Yahoo search snippet
    try {
        const r4 = await fetch(`https://search.yahoo.com/search?p=${encodeURIComponent('site:instagram.com/' + cleanUsername)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' }
        });
        const t4 = await r4.text();
        const m4 = t4.match(/([\d,.]+[KMkm]?\s+Followers[^\n<]*)/i);
        results.yahoo = { status: r4.status, match: m4 ? m4[0] : null };
    } catch (e) {
        results.yahoo = { error: e.message };
    }

    return res.json({ username: cleanUsername, results });
});

module.exports = router;
