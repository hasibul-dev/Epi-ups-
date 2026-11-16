import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import authRoutes, { users } from './routes/auth.js';
import api from './routes/api.js';
import reports from './routes/reports.js';
import { errorHandler } from './middleware/auth.js';
import { ensureDefaultAccounts } from './services/ledger.js';
import {
  demoUser,
  demoUsers,
  demoSettings,
  demoAccounts,
  demoParties,
  demoItems,
  demoInvoices,
  demoExpenses,
  demoJournal,
  demoEmployees,
  demoPayrollRuns,
  demoAssets,
  demoStockMovements,
  demoPayments,
  demoAuditLogs,
  handleDemoAuth,
  getMockParties,
  getMockParty,
  createMockParty,
  updateMockParty,
  deleteMockParty,
  getMockPartyStatement,
  getMockItems,
  getMockItem,
  createMockItem,
  updateMockItem,
  deleteMockItem,
  getMockStockMovements,
  adjustMockStock,
  getMockInvoices,
  getMockInvoice,
  createMockInvoice,
  voidMockInvoice,
  getMockPayments,
  createMockPayment,
  voidMockPayment,
  getMockExpenses,
  createMockExpense,
  voidMockExpense,
  postMockJournalEntry,
  voidMockJournalEntry,
  getMockAccounts,
  createMockAccount,
  updateMockAccount,
  deleteMockAccount,
  getMockEmployees,
  createMockEmployee,
  updateMockEmployee,
  deleteMockEmployee,
  getMockPayroll,
  processMockPayroll,
  payMockPayroll,
  voidMockPayroll,
  getMockAssets,
  createMockAsset,
  runMockDepreciation,
  disposeMockAsset,
  getDemoVatSummary,
  getDemoVatRegister,
  settleMockVat,
  getDemoTrialBalance,
  getDemoProfitLoss,
  getDemoBalanceSheet,
  getDemoCashFlow,
  getDemoLedger,
  getDemoBanking,
  getDemoStockValuation,
  getDemoAgeing,
  getDemoDashboard,
} from './services/demoMock.js';

export const isDemoMode = process.env.DEMO_MODE === 'true' ||
  !process.env.MONGODB_URI ||
  process.env.MONGODB_URI === 'demo' ||
  process.env.MONGODB_URI === 'memory';

if (isDemoMode) {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'epi-erp-local-demo-jwt-secret-key-32-chars-minimum';
} else {
  for (const k of ['MONGODB_URI', 'JWT_SECRET']) {
    if (!process.env[k]) { console.error(`Missing ${k}. Copy .env.example to .env and fill it in.`); }
  }
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
  process.env.JWT_SECRET = 'epi-erp-local-demo-jwt-secret-key-32-chars-minimum';
}

const app = express();
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: false,
  frameguard: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('tiny'));

let dbPromise = null;
let memServer = null;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    // If real MongoDB Atlas connection string is provided, connect to it
    if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'demo' && process.env.MONGODB_URI !== 'memory') {
      try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');
        await ensureDefaultAccounts();
      } catch (err) {
        console.error('MongoDB connection error:', err.message);
      }
      return;
    }

    // Local environment demo mode using in-memory MongoDB
    if (!process.env.VERCEL && isDemoMode) {
      try {
        const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
        process.env.MONGOMS_DOWNLOAD_DIR = path.resolve(serverDir, 'node_modules/.cache/mongodb-memory-server');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memServer = await MongoMemoryServer.create();
        const uri = memServer.getUri();
        await mongoose.connect(uri);
        console.log('⚡ Running in DEMO MODE with in-memory MongoDB');
        await ensureDefaultAccounts();
        const { seedDemoData } = await import('./services/demoData.js');
        await seedDemoData();
      } catch (err) {
        console.error('In-memory MongoDB startup failed, falling back to instant demo mode:', err.message);
      }
    }
  })();

  return dbPromise;
}

export function getMemServer() {
  return memServer;
}

// Automatic Live In-Memory / Fallback CRUD Handler when MongoDB is not active
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1 && (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'demo' || process.env.MONGODB_URI === 'memory')) {
    if (req.path === '/api/health') {
      return res.json({ ok: true, db: true, demo: true, vercel: Boolean(process.env.VERCEL) });
    }

    if (req.path.startsWith('/api/auth/')) {
      const handled = handleDemoAuth(req, res);
      if (handled !== false) return;
    }

    // For protected API endpoints, if an authorization header is supplied, validate it
    const h = req.headers.authorization || '';
    if (h) {
      const tok = h.startsWith('Bearer ') ? h.slice(7) : null;
      if (!tok) {
        return res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
      }
      try {
        const secret = process.env.JWT_SECRET || 'epi-erp-local-demo-jwt-secret-key-32-chars-minimum';
        jwt.verify(tok, secret);
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Session expired. Please sign in again.', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ error: 'Invalid authentication token', code: 'TOKEN_INVALID' });
      }
    }

    try {
      // 1. Parties (Customers & Suppliers)
      if (req.path === '/api/parties' || req.path.startsWith('/api/parties/')) {
        const parts = req.path.split('/');
        const partyId = parts[3];
        const isStatement = parts[4] === 'statement';

        if (req.method === 'GET') {
          if (partyId && isStatement) return res.json(getMockPartyStatement(partyId));
          if (partyId) {
            const p = getMockParty(partyId);
            return p ? res.json(p) : res.status(404).json({ error: 'Party not found' });
          }
          return res.json(getMockParties(req.query.type, req.query.q));
        }
        if (req.method === 'POST') {
          return res.status(201).json(createMockParty(req.body));
        }
        if (req.method === 'PUT' && partyId) {
          return res.json(updateMockParty(partyId, req.body));
        }
        if (req.method === 'DELETE' && partyId) {
          return res.json(deleteMockParty(partyId));
        }
      }

      // 2. Inventory Items & Stock
      if (req.path === '/api/items' || req.path.startsWith('/api/items/')) {
        const parts = req.path.split('/');
        const itemId = parts[3];

        if (req.method === 'GET') {
          if (itemId) {
            const it = getMockItem(itemId);
            return it ? res.json(it) : res.status(404).json({ error: 'Item not found' });
          }
          return res.json(getMockItems(req.query.q, req.query.category));
        }
        if (req.method === 'POST') {
          return res.status(201).json(createMockItem(req.body));
        }
        if (req.method === 'PUT' && itemId) {
          return res.json(updateMockItem(itemId, req.body));
        }
        if (req.method === 'DELETE' && itemId) {
          return res.json(deleteMockItem(itemId));
        }
      }

      if (req.path === '/api/stock-movements') {
        return res.json(getMockStockMovements(req.query));
      }
      if (req.path === '/api/stock-adjustments' && req.method === 'POST') {
        return res.status(201).json(adjustMockStock(req.body));
      }

      // 3. Sales Invoices
      if (req.path === '/api/sales-invoices' || req.path.startsWith('/api/sales-invoices/')) {
        const parts = req.path.split('/');
        const invId = parts[3];
        const isVoid = parts[4] === 'void';

        if (req.method === 'GET') {
          if (invId) {
            const inv = getMockInvoice(invId);
            return inv ? res.json(inv) : res.status(404).json({ error: 'Invoice not found' });
          }
          return res.json(getMockInvoices('sale', req.query));
        }
        if (req.method === 'POST' && isVoid) {
          return res.json(voidMockInvoice(invId, req.body?.reason));
        }
        if (req.method === 'POST') {
          return res.status(201).json(createMockInvoice('sale', req.body));
        }
      }

      // 4. Purchase Bills
      if (req.path === '/api/purchase-bills' || req.path.startsWith('/api/purchase-bills/')) {
        const parts = req.path.split('/');
        const billId = parts[3];
        const isVoid = parts[4] === 'void';

        if (req.method === 'GET') {
          if (billId) {
            const bill = getMockInvoice(billId);
            return bill ? res.json(bill) : res.status(404).json({ error: 'Bill not found' });
          }
          return res.json(getMockInvoices('purchase', req.query));
        }
        if (req.method === 'POST' && isVoid) {
          return res.json(voidMockInvoice(billId, req.body?.reason));
        }
        if (req.method === 'POST') {
          return res.status(201).json(createMockInvoice('purchase', req.body));
        }
      }

      // 5. Payments & Receipts
      if (req.path === '/api/payments' || req.path.startsWith('/api/payments/')) {
        const parts = req.path.split('/');
        const actionOrId = parts[3];
        const isVoid = parts[4] === 'void';

        if (req.method === 'GET') {
          return res.json(getMockPayments(req.query));
        }
        if (req.method === 'POST') {
          if (actionOrId === 'receipt' || actionOrId === 'payment') {
            return res.status(201).json(createMockPayment(actionOrId, req.body));
          }
          if (isVoid) {
            return res.json(voidMockPayment(actionOrId, req.body?.reason));
          }
        }
      }

      // 6. Expenses
      if (req.path === '/api/expenses' || req.path.startsWith('/api/expenses/')) {
        const parts = req.path.split('/');
        const expId = parts[3];
        const isVoid = parts[4] === 'void';

        if (req.method === 'GET') {
          return res.json(getMockExpenses(req.query));
        }
        if (req.method === 'POST') {
          if (isVoid) return res.json(voidMockExpense(expId, req.body?.reason));
          return res.status(201).json(createMockExpense(req.body));
        }
      }

      // 7. Journal Vouchers
      if (req.path === '/api/journal' || req.path.startsWith('/api/journal/')) {
        const parts = req.path.split('/');
        const jvId = parts[3];
        const isVoid = parts[4] === 'void';

        if (req.method === 'GET') {
          let list = demoJournal;
          if (req.query.voucherType) list = list.filter((j) => j.voucherType === req.query.voucherType);
          if (req.query.status) list = list.filter((j) => j.status === req.query.status);
          if (req.query.q) {
            const s = req.query.q.toLowerCase();
            list = list.filter((j) => j.entryNo.toLowerCase().includes(s) || j.narration.toLowerCase().includes(s));
          }
          return res.json(list);
        }
        if (req.method === 'POST') {
          if (isVoid) return res.json(voidMockJournalEntry(jvId, req.body?.reason));
          return res.status(201).json(postMockJournalEntry(req.body));
        }
      }

      // 8. Accounts (Chart of Accounts)
      if (req.path === '/api/accounts' || req.path.startsWith('/api/accounts/')) {
        const parts = req.path.split('/');
        const accId = parts[3];

        if (req.method === 'GET') {
          return res.json(getMockAccounts(req.query));
        }
        if (req.method === 'POST') {
          return res.status(201).json(createMockAccount(req.body));
        }
        if (req.method === 'PUT' && accId) {
          return res.json(updateMockAccount(accId, req.body));
        }
        if (req.method === 'DELETE' && accId) {
          return res.json(deleteMockAccount(accId));
        }
      }

      // 9. Employees & Payroll
      if (req.path === '/api/employees' || req.path.startsWith('/api/employees/')) {
        const parts = req.path.split('/');
        const empId = parts[3];

        if (req.method === 'GET') {
          let list = getMockEmployees();
          if (req.query.q) {
            const s = req.query.q.toLowerCase();
            list = list.filter((e) => e.name.toLowerCase().includes(s) || e.empId.toLowerCase().includes(s));
          }
          return res.json(list);
        }
        if (req.method === 'POST') {
          return res.status(201).json(createMockEmployee(req.body));
        }
        if (req.method === 'PUT' && empId) {
          return res.json(updateMockEmployee(empId, req.body));
        }
        if (req.method === 'DELETE' && empId) {
          return res.json(deleteMockEmployee(empId));
        }
      }

      if (req.path === '/api/payroll' || req.path.startsWith('/api/payroll/')) {
        const parts = req.path.split('/');
        const actionOrId = parts[3];
        const isVoid = parts[4] === 'void';
        const isPay = parts[4] === 'pay';

        if (req.method === 'GET') return res.json(getMockPayroll());
        if (req.method === 'POST') {
          if (actionOrId === 'process') return res.status(201).json(processMockPayroll(req.body.month));
          if (isPay) return res.json(payMockPayroll(actionOrId, req.body));
          if (isVoid) return res.json(voidMockPayroll(actionOrId, req.body?.reason));
        }
      }

      // 10. Fixed Assets
      if (req.path === '/api/assets' || req.path.startsWith('/api/assets/')) {
        const parts = req.path.split('/');
        const actionOrId = parts[3];
        const isDispose = parts[4] === 'dispose';

        if (req.method === 'GET') {
          let list = getMockAssets();
          if (req.query.q) {
            const s = req.query.q.toLowerCase();
            list = list.filter((a) => a.name.toLowerCase().includes(s) || a.code.toLowerCase().includes(s));
          }
          return res.json(list);
        }
        if (req.method === 'POST') {
          if (actionOrId === 'depreciate') return res.status(201).json(runMockDepreciation(req.body.month));
          if (isDispose) return res.json(disposeMockAsset(actionOrId, req.body));
          return res.status(201).json(createMockAsset(req.body));
        }
      }

      // 11. VAT & Tax
      if (req.path === '/api/vat/summary') {
        return res.json(getDemoVatSummary(req.query.from, req.query.to));
      }
      if (req.path === '/api/vat/register') {
        return res.json(getDemoVatRegister());
      }
      if (req.path === '/api/vat/settle') {
        return res.status(201).json(settleMockVat(req.body));
      }

      // 12. Financial Reports (Live Dynamic Calculations)
      if (req.path === '/api/reports/dashboard') {
        return res.json(getDemoDashboard());
      }
      if (req.path === '/api/reports/banking') {
        return res.json(getDemoBanking());
      }
      if (req.path === '/api/reports/stock-valuation') {
        return res.json(getDemoStockValuation());
      }
      if (req.path === '/api/reports/trial-balance') {
        return res.json(getDemoTrialBalance(req.query.asOf));
      }
      if (req.path === '/api/reports/profit-loss') {
        return res.json(getDemoProfitLoss(req.query.from, req.query.to));
      }
      if (req.path === '/api/reports/balance-sheet') {
        return res.json(getDemoBalanceSheet(req.query.asOf));
      }
      if (req.path === '/api/reports/cash-flow') {
        return res.json(getDemoCashFlow(req.query.from, req.query.to));
      }
      if (req.path === '/api/reports/ledger') {
        return res.json(getDemoLedger(req.query.account, req.query.from, req.query.to));
      }
      if (req.path === '/api/reports/ageing') {
        return res.json(getDemoAgeing(req.query.type, req.query.asOf));
      }

      // 13. Settings, Users, and Audit
      if (req.path === '/api/settings') {
        if (req.method === 'PUT') {
          Object.assign(demoSettings, req.body);
          return res.json(demoSettings);
        }
        return res.json(demoSettings);
      }
      if (req.path === '/api/users' || req.path.startsWith('/api/users/')) {
        const parts = req.path.split('/');
        const uid = parts[3];
        if (req.method === 'GET') return res.json(demoUsers);
        if (req.method === 'POST') {
          const u = {
            _id: `user-${Date.now()}`,
            name: req.body.name,
            email: req.body.email,
            role: req.body.role || 'viewer',
            active: req.body.active !== false,
            permissions: req.body.permissions || {},
          };
          demoUsers.push(u);
          return res.status(201).json(u);
        }
        if (req.method === 'PUT' && uid) {
          const u = demoUsers.find((x) => x._id === uid);
          if (u) Object.assign(u, req.body);
          return res.json(u);
        }
        if (req.method === 'DELETE' && uid) {
          const idx = demoUsers.findIndex((x) => x._id === uid);
          if (idx !== -1) demoUsers.splice(idx, 1);
          return res.json({ ok: true });
        }
      }
      if (req.path.startsWith('/api/audit-logs') || req.path.startsWith('/api/audit')) {
        return res.json(demoAuditLogs);
      }

      if (req.method !== 'GET') {
        return res.status(200).json({ ok: true });
      }
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
  next();
});

// For normal database mode: ensure DB is connected before processing API requests
app.use(async (req, res, next) => {
  if (req.path === '/api/health') return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: err.message, code: 'DB_CONNECTION_ERROR' });
  }
});

app.get('/api/health', (_req, res) => res.json({
  ok: true,
  db: mongoose.connection.readyState === 1,
  demo: isDemoMode,
  vercel: Boolean(process.env.VERCEL),
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', users);
app.use('/api/reports', reports);
app.use('/api', api);

// Serve frontend static build files if present
const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use(errorHandler);

export default app;
