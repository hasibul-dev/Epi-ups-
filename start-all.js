#!/usr/bin/env node
/**
 * EPI CENTRALIZED MANAGEMENT SYSTEM — UNIFIED START SCRIPT
 * Launches the unified application (Express Backend + Vite Dev Server or Production Server).
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const modeText = isProduction ? 'PRODUCTION' : 'DEVELOPMENT';

console.log(`\n============================================================`);
console.log(`  EPI CENTRALIZED MANAGEMENT SYSTEM — UNIFIED APPLICATION   `);
console.log(`============================================================`);
console.log(`  Mode: ${modeText}`);
console.log(`  Application Entry: http://localhost:5050 (or Vite http://localhost:5173)`);
console.log(`  Architecture: Unified React + Express (Admin, Sales, Service, Accounts ERP)`);
console.log(`============================================================\n`);

const command = isProduction ? 'node' : 'npm';
const args = isProduction ? ['server/index.js'] : ['run', 'dev'];

const child = spawn(command, args, {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('error', (err) => {
  console.error('[EPI Start Error]', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
