import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './auth.js';
import adminRoutes from './admin.js';
import { getDbStatus, initDatabase } from './db.js';
import { authenticateToken, requireDepartment } from './middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');

const app = express();
app.set('trust proxy', 1);

// Serverless DB initialization middleware for API routes
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    try {
      await initDatabase();
    } catch (e) {
      console.warn('[DB Init Warning]', e.message);
    }
  }
  next();
});

// CORS configuration
app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-central-token', 'x-crm-auth', 'Accept'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health and Diagnostics
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: 'ok',
    system: 'EPI Centralized Management System',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Mount Central Auth and Admin routers
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Department Authorization Verification Gateway
// Used by Sales, Service, and Accounts to verify active employee permissions
app.get('/api/departments/verify/:dept', authenticateToken, (req, res, next) => {
  const dept = String(req.params.dept || '').toLowerCase();
  const validDepts = ['service', 'sales', 'accounts'];
  
  if (!validDepts.includes(dept)) {
    return res.status(400).json({ success: false, error: `Invalid department: ${dept}` });
  }

  // Check department permission
  requireDepartment(dept)(req, res, () => {
    res.json({
      success: true,
      authorized: true,
      department: dept,
      user: {
        id: req.user.id,
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        departments: req.user.departments,
      },
    });
  });
});

// Serve built frontend assets
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('[Central Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

export default app;
