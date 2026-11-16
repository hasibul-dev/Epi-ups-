import 'dotenv/config';
import mongoose from 'mongoose';
import app, { connectDB, isDemoMode, getMemServer } from './app.js';

const port = process.env.PORT || 5000;

await connectDB();

const server = app.listen(port, () => {
  console.log(`EPI ERP API listening on :${port}`);
  if (isDemoMode) {
    console.log(`Demo credentials: ${process.env.ADMIN_EMAIL || 'admin@epiups.com.bd'} / ${process.env.ADMIN_PASSWORD || 'ChangeMe#2026'}`);
  }
});

const cleanup = async () => {
  try {
    server.close();
    await mongoose.disconnect();
    const mem = getMemServer();
    if (mem) await mem.stop();
  } catch (_) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
