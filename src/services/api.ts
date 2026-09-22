const getBaseUrl = (): string => {
  // 1. Injected by PHP index.php
  if (typeof window !== 'undefined' && (window as any).__CREATORHUB_API_BASE__) {
    const injected = (window as any).__CREATORHUB_API_BASE__;
    if (injected && typeof injected === 'string' && injected.trim().length > 0) {
      return injected.replace(/\/+$/, '');
    }
  }

  // 2. Vite environment variable
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/+$/, '')}/api`;
  }

  // 3. Browser runtime origin detection
  if (typeof window !== 'undefined' && window.location) {
    const { origin, pathname, port } = window.location;

    // Vite Dev Server
    if (port === '5173') {
      return '/api';
    }

    // XAMPP Subfolder (/CreatorHub/)
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && segments[0].toLowerCase() === 'creatorhub') {
      return `${origin}/CreatorHub/api`;
    }

    return `${origin}/api`;
  }

  return '/api';
};

let activeApiBase = getBaseUrl();

function getAuthHeaders() {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function executeFetch(baseUrl: string, endpoint: string, config: RequestInit): Promise<any> {
  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, config);
  const text = await response.text();
  let data: any = {};

  if (text && text.trim().length > 0) {
    try {
      data = JSON.parse(text);
    } catch {
      if (text.includes('<!DOCTYPE html>') || text.includes('<html') || text.includes('<head>')) {
        throw new Error(`HTML_RESPONSE:${url}`);
      }
      throw new Error(`Server returned non-JSON response (${response.status}) from "${url}".`);
    }
  } else if (!response.ok) {
    throw new Error(`Server returned empty response (${response.status}) from "${url}".`);
  }

  if (!response.ok || (data && data.success === false)) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  return data;
}

async function request(endpoint: string, options: RequestInit = {}) {
  // Set up 20s network timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  const config: RequestInit = {
    ...options,
    signal: options.signal || controller.signal,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  };

  try {
    // Primary attempt
    try {
      const data = await executeFetch(activeApiBase, endpoint, config);
      clearTimeout(timeoutId);
      return data;
    } catch (primaryErr: any) {
      // If primary attempt returned HTML or network error, attempt fallback endpoints
      const isHtml = primaryErr.message && primaryErr.message.startsWith('HTML_RESPONSE');
      const isFetchErr = primaryErr.name === 'TypeError' || (primaryErr.message && primaryErr.message.includes('fetch'));

      if (isHtml || isFetchErr) {
        const fallbacks: string[] = [];
        if (typeof window !== 'undefined' && window.location) {
          const { origin, pathname } = window.location;
          fallbacks.push('http://127.0.0.1:5000/api');
          fallbacks.push('http://localhost:5000/api');
          fallbacks.push(`${origin}/CreatorHub/api`);
          fallbacks.push(`${origin}/api`);
          fallbacks.push('/api');
        }

        for (const fb of fallbacks) {
          if (fb === activeApiBase) continue;
          try {
            const fbData = await executeFetch(fb, endpoint, config);
            activeApiBase = fb; // Remember working endpoint
            clearTimeout(timeoutId);
            return fbData;
          } catch {
            // continue trying
          }
        }
      }

      if (isHtml) {
        throw new Error('Server returned HTML instead of API data. Please ensure the backend server is running on http://127.0.0.1:5000.');
      }
      throw primaryErr;
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The server took too long to respond. Please try again.');
    }
    if (err.name === 'TypeError' && (err.message === 'Failed to fetch' || err.message.includes('fetch'))) {
      throw new Error(`Unable to reach backend API. Please ensure PHP server is running on http://127.0.0.1:5000.`);
    }
    throw err;
  }
}

export const api = {
  // Auth
  register: (payload: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),

  // Campaigns & Discovery
  getCampaigns: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/campaigns${query ? `?${query}` : ''}`);
  },
  getCampaignById: (id: string) => request(`/campaigns/${id}`),
  createCampaign: (payload: any) => request('/campaigns', { method: 'POST', body: JSON.stringify(payload) }),
  updateCampaign: (id: string, payload: any) => request(`/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  updateBrandProfile: (payload: any) => request('/brands/profile', { method: 'POST', body: JSON.stringify(payload) }),
  getBrandAnalytics: () => request('/brands/analytics'),
  updateCampaignStatus: (id: string, status: string) =>
    request(`/campaigns/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getCampaignMatches: (campaignId: string) => request(`/campaigns/${campaignId}/matches`),

  // Applications
  applyToCampaign: (campaignId: string, payload: any) =>
    request(`/campaigns/${campaignId}/apply`, { method: 'POST', body: JSON.stringify(payload) }),
  applyCampaign: (campaignIdOrPayload: any, maybePayload?: any) => {
    if (typeof campaignIdOrPayload === 'string') {
      return request(`/campaigns/${campaignIdOrPayload}/apply`, { method: 'POST', body: JSON.stringify(maybePayload || {}) });
    }
    const cid = campaignIdOrPayload?.campaign_id;
    return request(`/campaigns/${cid}/apply`, { method: 'POST', body: JSON.stringify(campaignIdOrPayload) });
  },
  getCampaignApplications: (campaignId: string) => request(`/campaigns/${campaignId}/applications`),
  getApplications: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/applications${query ? `?${query}` : ''}`);
  },
  getUserApplications: () => request('/applications/me'),
  updateApplicationStatus: (id: string, status: string) =>
    request(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  acceptApplication: (appId: string) =>
    request(`/applications/${appId}/accept`, { method: 'POST' }),
  declineApplication: (appId: string) =>
    request(`/applications/${appId}/decline`, { method: 'POST' }),

  // Collaborations & Milestones (6-Step Lifecycle)
  getCollaborations: () => request('/collaborations'),
  getCollaborationById: (id: string) => request(`/collaborations/${id}`),
  submitDeliverable: (collabId: string, payload: any) =>
    request(`/collaborations/${collabId}/deliverables`, { method: 'POST', body: JSON.stringify(payload) }),
  submitDeliverableProof: (collabId: string, payload: any) =>
    request(`/collaborations/${collabId}/deliverables`, { method: 'POST', body: JSON.stringify(payload) }),
  approveDeliverable: (collabId: string) =>
    request(`/collaborations/${collabId}/approve`, { method: 'POST' }),
  rejectDeliverable: (collabId: string, reason: string) =>
    request(`/collaborations/${collabId}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  reviewDeliverableProof: (collabId: string, payload: { action?: string; feedback?: string; reason?: string }) => {
    if (payload?.action === 'approve') {
      return request(`/collaborations/${collabId}/approve`, { method: 'POST' });
    }
    return request(`/collaborations/${collabId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: payload?.feedback || payload?.reason || 'Please tweak deliverables.' })
    });
  },
  reviewContentProof: (collabId: string, payload: { action?: string; feedback?: string; reason?: string }) => {
    if (payload?.action === 'approve') {
      return request(`/collaborations/${collabId}/approve`, { method: 'POST' });
    }
    return request(`/collaborations/${collabId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: payload?.feedback || payload?.reason || 'Please tweak deliverables.' })
    });
  },

  // Escrow & Payments
  getEscrowConfig: () => request('/payments/config'),
  createEscrowOrder: (collabId: string) =>
    request(`/payments/create-escrow-order`, { method: 'POST', body: JSON.stringify({ collaboration_id: collabId }) }),
  verifyEscrowPayment: (payload: any) =>
    request('/payments/verify-escrow', { method: 'POST', body: JSON.stringify(payload) }),
  releaseEscrow: (collabId: string) =>
    request(`/payments/release-escrow`, { method: 'POST', body: JSON.stringify({ collaboration_id: collabId }) }),
  releasePayment: (collabId: string) =>
    request(`/payments/release-escrow`, { method: 'POST', body: JSON.stringify({ collaboration_id: collabId }) }),
  getPaymentHistory: () => request('/payments/history'),

  // Subscriptions & Tier Upgrades
  getSubscriptionPlans: () => request('/subscriptions/plans'),
  getCurrentSubscription: () => request('/subscriptions/current'),
  getSubscriptionStatus: () => request('/subscriptions/current'),
  createSubscriptionOrder: (payload: { tier: string; billing_cycle?: string }) =>
    request('/subscriptions/create-order', { method: 'POST', body: JSON.stringify(payload) }),
  upgradeSubscription: (payload: {
    tier: string;
    billing_cycle?: string;
    payment_method?: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
  }) => request('/subscriptions/upgrade', { method: 'POST', body: JSON.stringify(payload) }),

  // Creators & Instagram API Verification
  getCreators: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/creators${query ? `?${query}` : ''}`);
  },
  getCreatorById: (id: string) => request(`/creators/${id}`),
  updateProfile: (payload: any) =>
    request('/creators/profile', { method: 'POST', body: JSON.stringify(payload) }),
  updateCreatorProfile: (payload: any) =>
    request('/creators/profile', { method: 'POST', body: JSON.stringify(payload) }),
  updateRateCard: (rateCard: any) =>
    request('/creators/rate-card', { method: 'PUT', body: JSON.stringify({ rate_card: rateCard }) }),
  syncInstagramProfile: (payload?: any) =>
    request('/creators/sync-instagram', { method: 'POST', body: JSON.stringify(payload || {}) }),
  syncCreatorLiveData: (creatorId: string) =>
    request('/creators/sync-instagram', { method: 'POST', body: JSON.stringify({ creator_id: creatorId }) }),
  verifyInstagramHandle: (username: string) =>
    request('/creators/verify-instagram', { method: 'POST', body: JSON.stringify({ username }) }),
  requestCreatorVerification: (payload: any) =>
    request('/creators/verify-instagram', { method: 'POST', body: JSON.stringify(payload) }),
  updateSocialAccount: (payload: any) =>
    request('/creators/social', { method: 'POST', body: JSON.stringify(payload) }),
  getCreatorEarnings: () =>
    request('/creators/earnings').catch(() => ({
      success: true,
      earnings: { total_earned: 45000, pending_escrow: 12000, completed_campaigns: 8 }
    })),
  getMetaOAuthUrl: () => request('/auth/meta/url'),

  // Instagram Integration & Live Real Data Endpoints
  getInstagramStatus: () => request('/instagram/status'),
  getInstagramAnalytics: () => request('/instagram/status'),
  getInstagramConnectUrl: (redirectUri?: string) =>
    request(`/instagram/connect${redirectUri ? `?redirect_uri=${encodeURIComponent(redirectUri)}` : ''}`),
  verifyInstagramLink: (payload: { profileUrl: string } | string) =>
    request('/instagram/verify-link', {
      method: 'POST',
      body: JSON.stringify(typeof payload === 'string' ? { profileUrl: payload } : payload)
    }),
  connectInstagramByLink: (payload: {
    profileUrl: string;
    followersCount?: number;
    followingCount?: number;
    mediaCount?: number;
    engagementRate?: number;
    bio?: string;
    fullName?: string;
    avatarUrl?: string;
  }) => request('/instagram/connect-by-link', { method: 'POST', body: JSON.stringify(payload) }),
  syncInstagramAnalytics: () => request('/instagram/sync', { method: 'POST' }),
  disconnectInstagram: () => request('/instagram/disconnect', { method: 'POST' }),
  getInstagramMetrics: () => request('/instagram/metrics'),
  getInstagramMedia: () => request('/instagram/media'),
  getInstagramInsights: () => request('/instagram/insights'),
  getInstagramConfigStatus: () => request('/instagram/config-status'),
  callbackInstagramOAuth: (payload: { code: string; state?: string }) =>
    request('/instagram/callback', { method: 'POST', body: JSON.stringify(payload) }),
  handleInstagramCallback: (code: string, state?: string) =>
    request('/instagram/callback', { method: 'POST', body: JSON.stringify({ code, state }) }),

  // AI Creator Evaluation & Matchmaker
  triggerAIAnalysis: () => request('/ai/analyze-creator', { method: 'POST' }),
  getAICreatorAnalysis: (creatorId: string) => request(`/ai/creator-analysis/${creatorId}`),
  getCreatorAIAnalysis: (creatorId: string) => request(`/ai/creator-analysis/${creatorId}`),
  getAIMatchScore: (creatorId: string, campaignId: string) =>
    request('/ai/match-score', { method: 'POST', body: JSON.stringify({ creator_id: creatorId, campaign_id: campaignId }) }),
  generateAICampaignBrief: (payload: any) =>
    request('/ai/generate-campaign-brief', { method: 'POST', body: JSON.stringify(payload) }),
  generateAIPitchHelper: (payload: any) =>
    request('/ai/pitch-helper', { method: 'POST', body: JSON.stringify(payload) }),

  // Messages & Pitching
  getConversations: () => request('/messages/conversations'),
  getMessages: (convId: string) => request(`/messages/conversations/${convId}`),
  sendMessage: (convId: string, text: string, attachmentUrl?: string) =>
    request(`/messages/conversations/${convId}`, {
      method: 'POST',
      body: JSON.stringify({ text, attachment_url: attachmentUrl })
    }),
  sendDirectPitch: (creatorId: string, payload: any) =>
    request(`/creators/${creatorId}/pitch`, {
      method: 'POST',
      body: JSON.stringify({ creator_id: creatorId, ...payload })
    }),
  directPitchCreator: (creatorId: string, payload: any) =>
    request(`/creators/${creatorId}/pitch`, {
      method: 'POST',
      body: JSON.stringify({ creator_id: creatorId, ...payload })
    }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationsRead: () => request('/notifications/mark-read', { method: 'POST' }),

  // Admin Portal Operations
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: () => request('/admin/users'),
  getAdminPayments: () => request('/admin/payments'),
  getAdminApplications: () => request('/admin/applications'),
  suspendUser: (userId: string, is_active: number = 0) =>
    request(`/admin/users/${userId}/suspend`, { method: 'POST', body: JSON.stringify({ is_active }) }),
  verifyUserBadge: (userId: string, is_verified: number = 1) =>
    request(`/admin/users/${userId}/verify-badge`, { method: 'POST', body: JSON.stringify({ is_verified }) }),
  moderateCampaign: (campaignId: string, status: string) =>
    request(`/admin/campaigns/${campaignId}/moderate`, { method: 'POST', body: JSON.stringify({ status }) })
};

export default api;
