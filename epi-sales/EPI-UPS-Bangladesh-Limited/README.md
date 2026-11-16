# EPI UPS (Bangladesh) Ltd. — CRM & Business Development Assistant

A full-stack Business Development Assistant and Customer Relationship Management (CRM) platform engineered for **EPI UPS (Bangladesh) Limited**. Built with **React 18 + Vite** on the frontend, a **Node.js + Express** REST API on the backend, and powered by **MongoDB Atlas Free (M0 Cluster0)** for permanent, multi-device cloud persistence.

---

## 1. Project Architecture

```
├── api/                      # Vercel Serverless Function entry point
│   └── index.js              # Serverless bridge routing /api/* to Express on Vercel
├── server/                   # Node.js + Express backend
│   ├── app.js                # Express app, REST routes, CORS, rate limiting & error handlers
│   ├── db.js                 # Official MongoDB driver connection pool & index management
│   ├── index.js              # Standalone Node.js server entry point (port 5001)
│   └── retention.js          # Configurable 3-month retention engine with dry-run protection
├── src/                      # React frontend
│   ├── components/           # UI views (Dashboard, TodayWork, ClientsMaster, MongoStatusModal, etc.)
│   ├── hooks/useDb.js        # React hook communicating with MongoDB backend API
│   ├── utils/helpers.js      # Date formatting, follow-up rules & categorization helpers
│   ├── App.jsx               # Application root, routing, modal management
│   └── main.jsx              # Vite React entry point
├── tests/                    # Automated backend & API test suite
│   └── test_backend.js       # Health checks, status code validation, retention & Unicode tests
├── vercel.json               # Vercel routing configuration for full-stack serverless deployment
├── .env.example              # Environment variable template with security notes
├── vite.config.js            # Vite config with /api proxy to localhost:5001 in development
└── package.json              # Scripts and project dependencies
```

---

## 2. Dependencies

* **Frontend**: `react` (^18.3.1), `react-dom` (^18.3.1), `vite` (^5.4.0)
* **Backend**:
  * `mongodb` (^6.14.0) — Official MongoDB Node.js driver (high-performance connection pooling)
  * `express` (^4.21.2) — Fast, unopinionated web framework
  * `dotenv` (^16.4.7) — Zero-dependency environment variable loader
  * `cors` (^2.8.5) — Cross-Origin Resource Sharing middleware
* **Development**: `concurrently` (^9.1.2) — Run backend and frontend simultaneously with one command

---

## 3. Getting Started & Startup Commands

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **MongoDB Atlas Free M0 Cluster**: Cluster0 created at [cloud.mongodb.com](https://cloud.mongodb.com/)

### Installation
```bash
npm install
```

### Development (Frontend + Backend concurrently)
```bash
npm run dev
```
* **Frontend UI**: `http://localhost:5173` (or `5174`)
* **Backend API**: `http://localhost:5001`
* **API Health Check**: `http://localhost:5001/api/health`

### Individual Service Commands
```bash
npm run server       # Start Express backend server only (port 5001)
npm run dev:client   # Start Vite frontend dev server only
npm test             # Run automated backend test suite
npm run build        # Compile production frontend bundle into dist/
npm run preview      # Preview compiled production build
```

---

## 4. Environment Variables Setup

Create a `.env` file in the project root by copying `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# MongoDB Atlas Connection URI (from your Free M0 Cluster0)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/epi_ups_crm?retryWrites=true&w=majority

# Database Name (Default: epi_ups_crm)
MONGODB_DB_NAME=epi_ups_crm

# Backend Server Port (For local dev: 5001)
PORT=5001

# Frontend Origin for CORS (e.g. in production: https://your-crm.vercel.app)
FRONTEND_URL=http://localhost:5173

# Automatic 3-Month Retention Scheduler (Default: false)
AUTO_RETENTION_ENABLED=false
```

> **Security Note:** Never commit `.env` or paste database passwords into chat or public repositories. Both `.env` and `server/.env` are strictly excluded in `.gitignore`.

---

## 5. MongoDB Atlas Configuration Guide

### Step 1: Database Access (Create User)
1. In [MongoDB Atlas](https://cloud.mongodb.com/), navigate to **Security** → **Database Access**.
2. Click **Add New Database User**.
3. Choose **Password** authentication.
4. Set a Username (e.g. `epi_admin`) and a secure Password.
5. In **Database User Privileges**, select **Read and write to any database** (or built-in `readWrite`).
6. Click **Add User**.
   > *Tip: If your password contains special characters like `@`, `#`, or `/`, URL-encode them (e.g., `@` becomes `%40`).*

### Step 2: Network Access (IP Access List)
1. Navigate to **Security** → **Network Access**.
2. Click **Add IP Address**.
3. **For Local Development**: Click **Add Current IP Address** to whitelist your development machine.
4. **For Vercel Deployment**: Vercel uses dynamic serverless IP ranges. In Atlas, you can add `0.0.0.0/0` (Allow Access from Anywhere) with strong password authentication, or configure Atlas peering if using dedicated cloud instances.
5. Click **Confirm**.

### Step 3: Get Connection String
1. Go to **Deployments** → **Database**.
2. Click **Connect** on your **Cluster0**.
3. Choose **Drivers** (Node.js).
4. Copy the connection string and paste it into your `MONGODB_URI` in `.env` (or Vercel Environment Variables).
5. Specify the database name: `...mongodb.net/epi_ups_crm?retryWrites=true&w=majority`.

---

## 6. Local Storage Migration Utility

The CRM includes a **safe, idempotent migration tool** to transfer legacy browser data into MongoDB Atlas:

1. Open the website and click the **MongoDB Setup / MongoDB Atlas** pill in the top header or **MongoDB Hub** on the Dashboard.
2. The modal automatically scans the browser's `localStorage` and reports existing records.
3. Click **"📦 Migrate Local Storage to MongoDB Atlas"**.
4. The backend normalizes records, runs duplicate-safe upserts (`updateOne` with `$set` on `id`), and verifies record counts in MongoDB.
5. **Data Protection Guarantee**: Your browser `localStorage` is **never** deleted automatically. It remains as an offline safety backup until you verify the live data and choose to click **"Clear Local Storage"**.

---

## 7. Automatic Three-Month Retention Policy

To keep database storage optimized within MongoDB Atlas Free M0 limits, a configurable 3-month retention engine is built into `server/retention.js`:

* **Retention Rule**: Cleans up completed historical activity records (`history`) and office attendance logs (`office`) older than 3 calendar months (90 days).
* **Strict Protections**:
  * **Active Clients**: Master client records in `clients` are **never deleted**.
  * **Pending Work**: Unfinished tasks in `work` and `newWork` are **never deleted**.
  * **Referential Integrity**: All client relationships remain intact.
* **Dry-Run / Audit Mode**:
  * You can test the policy anytime without deleting any data by clicking **"🔍 Preview Retention Cleanup (Dry-Run)"** in the MongoDB Hub modal or querying `GET /api/retention/preview`.
* **Execution**:
  * Automatic scheduled deletion is **disabled by default** (`AUTO_RETENTION_ENABLED=false`).
  * Destructive cleanup requires explicit confirmation (`POST /api/retention/execute` with `{ confirm: true }`).

---

## 8. Deployment Guide

### Option A: Vercel (Recommended — 100% Free & Automated)
The project is configured so both the React frontend and Express API run together on Vercel without needing a separate backend host:

1. Push your repository to GitHub (`git push origin main`).
2. Go to your project settings in the [Vercel Dashboard](https://vercel.com/).
3. Navigate to **Settings** → **Environment Variables**.
4. Add:
   * **Key**: `MONGODB_URI`
   * **Value**: Your MongoDB Atlas connection string
   * **Target**: Production, Preview, Development
5. Trigger a redeploy.
6. The `vercel.json` rewrites automatically direct `/api/*` requests to `api/index.js` (Vercel Serverless Function) and all page routes to `index.html`.

### Option B: Standalone Node.js Host (Render / Railway / VPS)
If you prefer running the backend as a permanent standalone service:
1. Deploy `server/index.js` on Render (Free Web Service) or Railway.
2. Build command: `npm install`
3. Start command: `node server/index.js`
4. Set `MONGODB_URI` and `FRONTEND_URL` in environment variables.

---

## 9. Troubleshooting & Common Connection Errors

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| `bad auth : Authentication failed` | Incorrect Atlas username or password | Verify user under Atlas **Database Access**. If password contains special characters, URL-encode them (e.g. `@` → `%40`). |
| `IP not whitelisted / MongooseServerSelectionError` | Client IP is blocked by Atlas firewall | Go to Atlas **Network Access** and add your current IP address (or `0.0.0.0/0` for Vercel). |
| `MONGODB_URI is not defined` | Environment variable not loaded | Ensure `.env` exists in root and contains `MONGODB_URI=...`. In Vercel, check **Settings → Environment Variables**. |
| `Cannot reach CRM backend server` | Backend server not running in dev | Start the backend using `npm run dev` (starts both client and server) or `npm run server`. |
| Port 5001 already in use | Previous Node.js process is active | Run `PORT=5002 npm run server` or stop existing background process on port 5001. |

---

## 10. License

Confidential & Proprietary — Developed for **EPI UPS (Bangladesh) Limited**.
All rights reserved.
