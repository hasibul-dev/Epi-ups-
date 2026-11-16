import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { initDatabase } from './db/centralDb.js';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import salesRoutes from './routes/sales.js';
import serviceRoutes from './routes/service.js';
import erpRoutes from './routes/erp.js';
import erpReportsRoutes from './routes/erpReports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distPath = path.join(rootDir, 'dist');

const app = express();

// Security & Logging middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Central Database DAO
initDatabase().catch((err) => {
  console.warn('[Server DB] Central Database init warning:', err.message);
});

// Mount Modular API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/erp/reports', erpReportsRoutes);
app.use('/api/erp', erpRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'EPI Centralized Management System',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Serve compiled frontend assets if dist folder exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback: send index.html for any unhandled non-API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 404 for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found', code: 'NOT_FOUND' });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR',
  });
});

// Start listening if running directly
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`\n============================================================`);
    console.log(`  EPI CENTRALIZED MANAGEMENT SYSTEM — UNIFIED SERVER LIVE  `);
    console.log(`============================================================`);
    console.log(`  URL: http://localhost:${config.port}`);
    console.log(`  Port: ${config.port}`);
    console.log(`  Mode: ${config.nodeEnv}`);
    console.log(`============================================================\n`);
  });
}

export default app;
