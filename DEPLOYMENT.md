# EPI Centralized Management System — Unified Deployment Guide

This guide provides concrete, step-by-step instructions for running and deploying the **EPI Centralized Management System** as **ONE unified application**.

---

## 1. System Architecture Overview

The system has been transformed from four independent sub-applications into **ONE integrated enterprise application**:

- **Frontend**: One unified React 18 + Vite application in `src/` compiled into `dist/`.
- **Backend**: One unified Express 5 REST API in `server/` with centralized JWT auth, bcrypt password hashing, and role-based access control (RBAC).
- **Departments Integrated**:
  - `EPI Central Admin` (`/admin`) — Employee management, department assignments, audit logs.
  - `EPI Sales` (`/sales`) — Client directories, daily work schedules, follow-up reports.
  - `EPI Service` (`/service`) — Warranty tracking, dispatch calendar, servicing & maintenance contracts.
  - `EPI Accounts / ERP` (`/accounts`) — Double-entry accounting ledgers, invoices, vouchers, cash/bank, VAT Mushak-9.1, payroll, financial balance sheets.
- **Persistence**: Dual Browser-Local (`localStorage`) and Server Local (`data/*.json`), with optional cloud MongoDB support. Runs 100% offline or online with zero external database dependencies.

---

## 2. Local Windows / macOS / Linux Execution

### Prerequisites
- Node.js v18.0.0 or higher (v20+ recommended).
- Git installed.

### Option A: Development Mode (Hot Reloading)
Runs both the Express API (Port 5050) and Vite UI (Port 5173 with proxy) simultaneously:
```bash
# 1. Install dependencies (once)
npm install

# 2. Start unified dev servers
npm run dev
```
Open your browser at: `http://localhost:5173` (or `http://localhost:5050`).

### Option B: Production Server Mode
Compiles the React frontend into `dist/` and serves both the API and SPA from a single port:
```bash
# 1. Build frontend
npm run build

# 2. Start unified server
npm start
```
Open your browser at: `http://localhost:5050`.

---

## 3. Vercel Single-Project Deployment

The entire project deploys as **ONE single project** on Vercel:

1. Push your latest code to the GitHub repository:
   ```bash
   git add .
   git commit -m "EPI Unified Architecture complete"
   git push origin main
   ```
2. Log into the [Vercel Dashboard](https://vercel.com).
3. Click **"Add New..."** $\rightarrow$ **"Project"**.
4. Import repository: `hasibul-dev/Epi-ups-`.
5. Keep default settings:
   - **Framework Preset**: Other (Vite will be detected from `package.json`).
   - **Root Directory**: `./` (Leave root blank).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. (Optional) Configure Environment Variables in Vercel settings:
   - `JWT_SECRET`: Any secure 32+ character random string.
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: (Optional) MongoDB Atlas connection string. If omitted, the system automatically uses browser-local persistence.
7. Click **"Deploy"**.

Vercel will build the frontend assets using `@vercel/static-build` and deploy the backend API via `@vercel/node` at `/api/*` using the included `vercel.json`.

---

## 4. Hostinger hPanel Node.js Application Setup

1. Log into your **Hostinger hPanel**.
2. Navigate to **Websites** $\rightarrow$ **Manage** $\rightarrow$ **Node.js** (under Advanced or Applications).
3. Click **"Create Application"**:
   - **Node.js version**: Choose `v20.x` (or `v18.x`).
   - **Application mode**: `Production`.
   - **Application root**: `public_html` (or the folder where you uploaded the repository files).
   - **Application startup file**: `server/index.js`
4. Upload files via Git or File Manager (ensure `package.json`, `server/`, `src/`, `public/`, `vite.config.js`, and `index.html` are uploaded).
5. Open the Web Terminal or SSH into your Hostinger server and run:
   ```bash
   # Install dependencies
   npm install --production=false

   # Build frontend assets
   npm run build
   ```
6. Click **"Restart"** on the Node.js application in hPanel.
7. Your unified application is now live on your domain.

---

## 5. Linux VPS Deployment (Ubuntu / Debian / CentOS with PM2 & Nginx)

### Step 1: Clone & Build
```bash
cd /var/www
git clone https://github.com/hasibul-dev/Epi-ups-.git epi-management
cd epi-management
npm install
npm run build
```

### Step 2: Start with PM2 Process Manager
```bash
# Install PM2 globally
npm install -g pm2

# Start unified server
pm2 start server/index.js --name "epi-unified"

# Save PM2 process list to start automatically on system reboot
pm2 save
pm2 startup
```

### Step 3: Configure Nginx Reverse Proxy
Edit `/etc/nginx/sites-available/epi.yourdomain.com`:
```nginx
server {
    listen 80;
    server_name epi.yourdomain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:5050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable the configuration and reload Nginx:
```bash
ln -s /etc/nginx/sites-available/epi.yourdomain.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 6. Verification and Automated Test Commands

Run the built-in automated test suite at any time to verify system integrity:
```bash
# Verify RBAC rules & bcrypt authentication
npm test

# Verify Browser-Local Storage & Zero-Database engine
npm run test:storage

# Verify Unified Express Server endpoints
npm run test:server
```

---

## 7. Initial Super Admin Access

Upon first visiting the application:
1. If no Super Admin exists, the system automatically redirects to `/setup` to initialize the root Super Administrator.
2. The Super Administrator can log into `/admin` and create employees with departmental assignments (`sales`, `service`, `accounts`).
3. Employees only see and can only access the specific departments they have been authorized for by the Super Administrator.
