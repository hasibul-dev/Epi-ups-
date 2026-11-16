import dotenv from 'dotenv';
import app from './app.js';
import { initDatabase } from './db.js';

dotenv.config();

const PORT = process.env.PORT || 5050;

async function start() {
  console.log('====================================================');
  console.log('EPI CENTRALIZED MANAGEMENT SYSTEM — ADMIN BACKEND');
  console.log('====================================================');

  await initDatabase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] EPI Central Admin API running on http://localhost:${PORT}`);
    console.log(`[Health] Status available at http://localhost:${PORT}/api/health`);
  });
}

start().catch((err) => {
  console.error('[Server Fatal]', err);
  process.exit(1);
});
