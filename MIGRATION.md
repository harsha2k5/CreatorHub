# 🐘 CreatorHub Backend Migration: Node.js to PHP 8.2+

This document details the complete architectural migration of the **CreatorHub** backend from Node.js / Express to a modern, robust **PHP 8.2+** REST API architecture.

---

## 🎯 Migration Objectives & Fulfillment Status

| Objective | Requirement | Status | Verification |
|---|---|---|---|
| **Make PHP Primary Backend** | PHP must be the active, working backend; not a secondary implementation | ✅ Completed | `package.json` and `index.js` launch PHP; Vite proxies `/api` to PHP port 5000 |
| **Deprecate Node.js Backend** | Keep `server/` temporarily for rollback safety; mark as deprecated | ✅ Completed | Deprecation notices in `server/index.cjs`, `README.md`, and `package.json` |
| **Zero Frontend Rewrites** | Preserve 100% frontend API contracts in `src/services/api.ts` | ✅ Completed | All 22+ API client methods map 1:1 to PHP endpoints |
| **Database Preservation** | Retain existing SQLite relational database (`server/data/creatorhub.db`) via PDO | ✅ Completed | PHP PDO SQLite WAL mode with foreign key enforcement; no mock/fake database |
| **Authentication & RBAC** | JWT authentication with `password_hash()` and `password_verify()` | ✅ Completed | AES/HMAC JWT service; Creator, Brand, and Admin role enforcement |
| **Collaboration State Machine** | `APPLIED` → `ACCEPTED` → `ESCROW_LOCKED` → `PROOF_SUBMITTED` → `APPROVED` → `ESCROW_RELEASED` | ✅ Completed | State transitions strictly verified in unit and live HTTP tests |
| **Razorpay Escrow Safety** | Strict server-side order creation, HMAC-SHA256 verification, unfunded approval blocking | ✅ Completed | Block deliverable approval with 400 (`PAYMENT_REQUIRED`) if unfunded |
| **Instagram Graph API** | Port OAuth, sync, metrics, media; fallback scraper; "Not Available" for missing | ✅ Completed | Zero fake numbers; strict provenance tracking |
| **Gemini AI Analysis** | Port structured creator intelligence using `GEMINI_API_KEY` | ✅ Completed | Returns exact JSON schema: `overallScore`, `engagementHealth`, `consistency`, etc. |
| **Location & Matching** | Haversine distance calculation and geo-radius filtering | ✅ Completed | Native spherical trigonometric formulas in PHP |
| **Messaging & Notifications** | Real-time message threads, read receipts, and system alerts | ✅ Completed | Full SQLite conversation and message schema alignment |
| **Health Check Spec** | `GET /api/health` returning exact JSON with `success`, `backend: "php"`, `version: "1.0.0"` | ✅ Completed | Verified over live HTTP |

---

## 📂 Source Code Mapping: Node.js to PHP

### 1. Controllers & Routes
| Node.js Source (`server/`) | PHP 8.2 Target (`server-php/`) | Responsibility |
|---|---|---|
| `server/routes/auth.cjs` | `server-php/controllers/AuthController.php`<br>`server-php/routes/auth.php` | User registration, bcrypt verification, JWT generation, `/api/auth/me` |
| `server/routes/campaigns.cjs` | `server-php/controllers/CampaignController.php`<br>`server-php/routes/campaigns.php` | Campaign creation, status lifecycle, creator candidate discovery |
| `server/routes/applications.cjs` | `server-php/controllers/ApplicationController.php`<br>`server-php/routes/applications.php` | Campaign applications, accept/decline actions, collaboration spawning |
| `server/routes/collaborations.cjs` | `server-php/controllers/CollaborationController.php`<br>`server-php/routes/collaborations.php` | Deliverable submission, proof review, collaboration state transitions |
| `server/routes/creators.cjs` | `server-php/controllers/CreatorController.php`<br>`server-php/routes/creators.php` | Creator directory, profiles, direct pitches, Haversine geo radius search |
| `server/routes/brands.cjs` | `server-php/controllers/BrandController.php`<br>`server-php/routes/brands.php` | Brand profile management, company analytics, spending summaries |
| `server/routes/instagram.cjs` | `server-php/controllers/InstagramController.php`<br>`server-php/routes/instagram.php` | Meta OAuth callback, sync triggers, metrics, media inspection, sandbox |
| `server/routes/payments.cjs` | `server-php/controllers/PaymentController.php`<br>`server-php/routes/payments.php` | Razorpay order creation, payment verification, escrow release, webhooks |
| `server/routes/subscriptions.cjs` | `server-php/controllers/SubscriptionController.php`<br>`server-php/routes/subscriptions.php` | Creator tier subscription plans, ₹1 order gating, tier activation |
| `server/routes/ai.cjs` | `server-php/controllers/AIController.php`<br>`server-php/routes/ai.php` | Gemini creator intelligence generation, AI campaign brief creator |
| `server/routes/messages.cjs` | `server-php/controllers/MessageController.php`<br>`server-php/routes/messages.php` | In-app brand-creator chat conversations, messaging, read receipts |
| `server/routes/reviews.cjs` | `server-php/controllers/ReviewController.php`<br>`server-php/routes/reviews.php` | Post-collaboration ratings, feedback submission, creator averages |
| `server/routes/notifications.cjs` | `server-php/controllers/NotificationController.php`<br>`server-php/routes/notifications.php` | User alerts, milestone notifications, mark all as read |
| `server/routes/admin.cjs` | `server-php/controllers/AdminController.php`<br>`server-php/routes/admin.php` | System telemetry, user suspensions, creator badge verification |

### 2. Services & Utilities
| Node.js Source (`server/`) | PHP 8.2 Target (`server-php/`) | Responsibility |
|---|---|---|
| `server/services/paymentService.cjs` | `server-php/services/PaymentService.php` | Razorpay orders, HMAC-SHA256 signature verification, escrow state machine |
| `server/services/instagramService.cjs` | `server-php/services/InstagramService.php` | Meta Graph API v19.0 client, cURL HTTP requests, public fallback parser |
| `server/services/geminiService.cjs` | `server-php/services/AIAnalysisService.php` | Google Gemini 2.0 Flash REST integration, fallback heuristic analysis |
| `server/services/tokenEncryptionService.cjs` | `server-php/services/TokenEncryptionService.php` | OpenSSL AES-256-GCM authenticated encryption for OAuth access tokens |
| Custom JWT in Node | `server-php/services/JWTService.php` | Cryptographic JWT signing and decoding with HMAC-SHA256 |
| Express response helpers | `server-php/utils/Response.php` | Standardized JSON envelopes: `json()`, `error()`, `unauthorized()`, etc. |
| Express CORS middleware | `server-php/middleware/CorsMiddleware.php` | Strict credentials-aware dynamic CORS headers for localhost & Netlify |
| Express Auth middleware | `server-php/middleware/auth.php` | Bearer token extractor, role guard middleware (`requireRole`) |

### 3. Models
- `server-php/models/User.php`: Authentication, user lookup, profile join queries.
- `server-php/models/Campaign.php`: Campaign CRUD, status updates, brand scoping.
- `server-php/models/Collaboration.php`: Deliverable tracking, escrow milestones, lifecycle management.
- `server-php/models/Deliverable.php`: Proof URLs, submission notes, approval status.
- `server-php/models/Payment.php`: Transaction records, Razorpay order IDs, escrow payment state.
- `server-php/models/Subscription.php`: Tier definitions (Free, Silver ₹1, Gold ₹1, Diamond ₹1), expiry tracking.

---

## 🌐 API Endpoint Migration Catalog

Every endpoint expected by `src/services/api.ts` has been implemented and tested:

### 1. System & Health Check
- `GET /api/health`: Health status endpoint returning `{ success: true, backend: "php", version: "1.0.0", ... }`.

### 2. Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new creator or brand account with bcrypt password hashing.
- `POST /api/auth/login`: Authenticate and issue JWT token with full profile payload.
- `GET /api/auth/me`: Validate JWT token and return active user session.

### 3. Campaigns (`/api/campaigns`)
- `GET /api/campaigns`: List active campaigns with filters (category, city, budget, search).
- `GET /api/campaigns/:id`: Get detailed campaign information including deliverables and criteria.
- `POST /api/campaigns`: Brand creates a new campaign.
- `PATCH /api/campaigns/:id/status`: Update campaign status (`DRAFT`, `ACTIVE`, `PAUSED`, `COMPLETED`).
- `GET /api/campaigns/:id/matches`: Haversine-powered algorithmic matching with creators.

### 4. Applications (`/api/applications`)
- `POST /api/applications/apply`: Creator applies to a campaign with custom pitch and proposed rate.
- `GET /api/applications`: List applications filtered by campaign, brand, or creator.
- `PATCH /api/applications/:id/status`: Update application status (`ACCEPTED`, `SHORTLISTED`, `REJECTED`).
- `POST /api/applications/:id/accept`: Accept application and automatically instantiate a collaboration record.
- `POST /api/applications/:id/decline`: Decline application.

### 5. Collaborations & Escrow (`/api/collaborations`)
- `GET /api/collaborations`: Retrieve collaborations for authenticated user (brand or creator).
- `GET /api/collaborations/:id`: Retrieve single collaboration with deliverables and payment status.
- `POST /api/collaborations/:id/submit`: Creator submits content links / proof of work.
- `POST /api/collaborations/:id/review`: Brand approves deliverables or requests revisions. **Strictly blocks approval if escrow is not funded.**

### 6. Payments & Escrow (`/api/payments`)
- `GET /api/payments/config`: Return Razorpay public key ID and mode.
- `POST /api/payments/create-order`: Generate Razorpay order for collaboration escrow.
- `POST /api/payments/verify`: Cryptographically verify Razorpay payment signature and transition to `ESCROW_LOCKED`.
- `POST /api/payments/release/:collabId`: Release locked escrow funds to creator upon deliverable completion.
- `GET /api/payments/earnings`: Creator earnings summary.
- `POST /api/payments/webhook`: Handle asynchronous Razorpay webhook events with signature verification.

### 7. Creator Subscriptions (`/api/subscriptions`)
- `GET /api/subscriptions/plans`: List Silver, Gold, and Diamond plans (configured at ₹1).
- `GET /api/subscriptions/current`: Return creator's current subscription tier and perks.
- `POST /api/subscriptions/create-order`: Generate ₹1 Razorpay order for tier upgrade.
- `POST /api/subscriptions/upgrade`: Verify payment and activate upgraded tier.

### 8. Creators & Brands (`/api/creators`, `/api/brands`)
- `GET /api/creators`: Filter and search creators by niche, location, radius (Haversine), follower tier.
- `GET /api/creators/:id`: Creator public profile with verified metrics.
- `POST /api/creators/profile`: Update creator profile bio, location, rate card, and niches.
- `POST /api/creators/:id/pitch`: Brand sends a direct pitch to creator.
- `GET /api/brands`: Directory of registered brands.
- `GET /api/brands/:id`: Public brand profile.
- `GET /api/brands/analytics`: Brand spending, active campaigns, and collaboration statistics.
- `PUT /api/brands/profile`: Update brand profile.

### 9. Instagram Integration (`/api/instagram`)
- `GET /api/instagram/connect`: Generate Meta OAuth authorization URL.
- `POST /api/instagram/callback`: Exchange authorization code for 60-day long-lived token.
- `GET /api/instagram/status`: Return connection status, handle, and verification state.
- `GET /api/instagram/metrics`: Follower count, engagement rate, media count (no fake numbers).
- `GET /api/instagram/media`: Recent media posts, likes, comments, permalinks.
- `POST /api/instagram/sync`: Trigger on-demand sync from Meta Graph API.
- `POST /api/instagram/disconnect`: Disconnect Instagram account and wipe tokens.
- `POST /api/instagram/connect-by-link`: Connect via profile URL using public metadata extraction.
- `POST /api/instagram/sandbox-connect`: Development sandbox connect (explicitly watermarked).

### 10. AI Creator Intelligence (`/api/ai`)
- `POST /api/ai/analyze-creator`: Trigger Gemini AI evaluation of creator metrics.
- `GET /api/ai/creator-analysis/:creatorId`: Retrieve cached AI analysis report.
- `POST /api/ai/generate-campaign-brief`: Generate structured campaign briefs using AI.

### 11. Messaging, Reviews, Notifications, Admin
- `GET /api/messages/conversations`, `GET /api/messages/:id`, `POST /api/messages/:id`
- `POST /api/reviews`, `GET /api/reviews/collaboration/:id`
- `GET /api/notifications`, `PUT /api/notifications/read-all`
- `GET /api/admin/stats`, `GET /api/admin/users`, `PUT /api/admin/users/:id/suspend`, `PUT /api/admin/creators/:id/verify`, `GET /api/admin/instagram-health`

---

## 🔒 Security & State Machine Architecture

### 1. Collaboration State Machine
```
[APPLIED]
   │ (Brand Accepts Application)
   ▼
[ACCEPTED]
   │ (Brand Funds Escrow via Razorpay)
   ▼
[ESCROW_LOCKED]
   │ (Creator Submits Content Proof)
   ▼
[SUBMITTED / PROOF_SUBMITTED]
   │ (Brand Reviews & Approves Proof)
   ▼
[APPROVED / COMPLETED]
   │ (Escrow Released to Creator)
   ▼
[ESCROW_RELEASED]
```
> **Security Barrier**: In `server-php/controllers/CollaborationController.php` and `server-php/services/PaymentService.php`, approving deliverables is **strictly prohibited** if the collaboration's escrow payment is unfunded. The API returns HTTP 400 with `{"error": "PAYMENT_REQUIRED", "message": "Escrow payment must be funded before approving deliverables"}`.

### 2. Cryptographic Security
- **Passwords**: Hashed with PHP `password_hash($password, PASSWORD_BCRYPT)`.
- **OAuth Tokens**: Encrypted at rest using OpenSSL AES-256-GCM with authenticated verification tags.
- **Payment Signatures**: Validated with `hash_hmac('sha256', $orderId . '|' . $paymentId, $secret)`.

---

## 💻 How to Run the PHP Backend

### Standard Development (Local)
To start the primary PHP backend on port 5000:
```bash
npm run server
# or: npm run server:php
```
*Behind the scenes, this executes `node server-php/run.cjs -S localhost:5000 -t server-php server-php/router.php`, which automatically detects your PHP 8.2+ runtime across Windows, Linux, and macOS.*

### Direct PHP CLI
If PHP is in your system PATH:
```bash
php -S 0.0.0.0:5000 -t server-php server-php/router.php
```

### Running the Frontend
In a separate terminal:
```bash
npm run dev
```
The Vite development server runs at `http://localhost:5173` and proxies all `/api` requests to the PHP backend at `http://127.0.0.1:5000`.

### Running Tests
```bash
# Run full PHP backend test suite (unit, escrow, live HTTP):
npm test

# Run legacy Node test suite for rollback validation:
npm run test:node:deprecated
```

---

## 🚀 Deployment Instructions

### 1. Deploying Backend to Render (Docker)
1. In your Render Dashboard, create a **New Web Service** connected to your repository.
2. Select **Runtime: Docker**.
3. Set the **Dockerfile Path** to:
   ```
   ./server-php/Dockerfile
   ```
4. Configure Environment Variables in Render:
   - `APP_ENV`: `production`
   - `JWT_SECRET`: `[random 32+ character string]`
   - `RAZORPAY_KEY_ID`: `rzp_live_...` (or test key)
   - `RAZORPAY_KEY_SECRET`: `[your secret]`
   - `RAZORPAY_WEBHOOK_SECRET`: `[your webhook secret]`
   - `GEMINI_API_KEY`: `[your gemini key]`
   - `META_APP_ID`: `[your meta app id]`
   - `META_APP_SECRET`: `[your meta secret]`
   - `META_REDIRECT_URI`: `https://your-frontend.netlify.app/creator/dashboard`
5. Render will automatically build the Alpine PHP 8.2 container with SQLite PDO, BCrypt, and OpenSSL, and expose the service.

### 2. Deploying Frontend to Netlify
1. Connect your repository to Netlify.
2. Set **Build Command**: `npm run build`
3. Set **Publish Directory**: `dist`
4. Set Environment Variable:
   - `VITE_API_URL`: `https://your-php-backend.onrender.com`
5. Netlify will build and deploy the React application.

---

## 🛡️ Node.js Rollback Safety
The original Express backend remains preserved in the `server/` directory. If an unexpected emergency rollback is required:
1. Run `npm run server:node:deprecated` to start the Node.js backend on port 5000.
2. Both implementations share the exact same SQLite database file (`server/data/creatorhub.db`), ensuring zero data loss during transitions.
