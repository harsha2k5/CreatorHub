# CreatorHub — Hostinger Deployment Guide

This package contains everything needed to deploy **CreatorHub** directly to **Hostinger** (Shared Hosting, Cloud Hosting, or VPS with cPanel / hPanel).

---

## 🚀 Quick 4-Step Deployment to Hostinger

### Step 1: Upload & Extract Files in Hostinger File Manager
1. Log in to your **Hostinger hPanel** or **cPanel**.
2. Go to **File Manager** → navigate into `public_html/` (or your subdomain folder).
3. Click **Upload** and upload `CreatorHub_Hostinger_Production.zip`.
4. Right-click the uploaded ZIP file and click **Extract** into `public_html/`.

---

### Step 2: Create a MySQL Database on Hostinger
1. In Hostinger hPanel, go to **Databases** → **Management** → **Create a MySQL Database & User**.
2. Enter:
   - **Database Name**: e.g., `u123456789_creatorhub`
   - **Username**: e.g., `u123456789_creator`
   - **Password**: e.g., `YourSecurePassword123!`
3. Click **Create**. Note down the Database Name, Username, and Password.

---

### Step 3: Import `database.sql`
1. Next to your new database, click **Enter phpMyAdmin**.
2. Select your database from the left menu.
3. Click the **Import** tab at the top.
4. Click **Choose File** → select `database.sql` (found in the extracted files).
5. Click **Go** / **Import** at the bottom.
   > ✓ All 24 tables, indexes, demo accounts, and sample campaigns will be created automatically!

---

### Step 4: Configure Database Connection
1. In **File Manager**, edit `.env` (or `config/config.php`):
```env
APP_ENV=production
APP_URL=https://yourdomain.com

DB_HOST=localhost
DB_PORT=3306
DB_NAME=u123456789_creatorhub
DB_USER=u123456789_creator
DB_PASS=YourSecurePassword123!
```
2. Save the file.
3. Open `https://yourdomain.com` in your browser. **Your site is live!** 🎉

---

## 🔑 Pre-Configured Ready Login Credentials

| Role | Email Address | Password | Description |
| :--- | :--- | :--- | :--- |
| **Creator (Your Account)** | `chandanap234@gmail.com` | `Creator@123` *(or `123456`)* | Full Creator studio, verified Instagram handle, live score |
| **Creator (Demo)** | `creator@creatorhub.com` | `Creator@123` | Demo Creator with Gold tier and portfolio briefs |
| **Brand (Himalaya)** | `himalayacare@gmail.com` | `Brand@123` | Official Himalaya brand account with live campaigns |
| **Brand (Third Wave Coffee)**| `contact@thirdwave.in` | `Brand@123` | Indiranagar roastery brand with active campaigns |
| **Brand (Demo)** | `brand@creatorhub.com` | `Brand@123` | Demo brand studio & campaign manager |
| **Super Admin** | `admin@creatorhub.com` | `Admin@123` | Access `/admin/` portal to manage creators, brands & escrow |

---

## 🛡️ Hostinger Architecture & URL Structure

- **Main Frontend SPA**: `https://yourdomain.com/`
- **Creator Portal**: `https://yourdomain.com/creator/dashboard`
- **Brand Portal**: `https://yourdomain.com/brand/dashboard`
- **Admin Portal**: `https://yourdomain.com/admin/login.php`
- **Backend API Endpoints**: `https://yourdomain.com/api/*`
- **API Health Check**: `https://yourdomain.com/api/health`

The `.htaccess` file is pre-configured for Hostinger LiteSpeed/Apache servers to seamlessly handle both the React SPA routing and PHP REST API dispatching.
