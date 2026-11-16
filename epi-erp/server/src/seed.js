import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, Settings } from './models/core.js';
import { ensureDefaultAccounts } from './services/ledger.js';

const isDemo = process.env.DEMO_MODE === 'true' || !process.env.MONGODB_URI || process.env.MONGODB_URI === 'demo' || process.env.MONGODB_URI === 'memory';
let memServer = null;

if (isDemo) {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memServer = await MongoMemoryServer.create();
  await mongoose.connect(memServer.getUri());
  console.log('⚡ Running seed in demo mode (in-memory MongoDB)...');
} else {
  await mongoose.connect(process.env.MONGODB_URI);
}
const created = await ensureDefaultAccounts();
console.log(`Chart of accounts ready (${created} new accounts).`);
await Settings.findOneAndUpdate({ key: 'main' }, { $setOnInsert: { key: 'main' } }, { upsert: true });
if ((await User.countDocuments()) === 0) {
  const email = process.env.ADMIN_EMAIL, password = process.env.ADMIN_PASSWORD;
  if (!email || !password) console.log('No users yet. Set ADMIN_EMAIL / ADMIN_PASSWORD or use the Create Admin screen on first login.');
  else {
    await User.create({ name: 'Administrator', email, role: 'admin', passwordHash: await bcrypt.hash(password, 12) });
    console.log(`Admin created: ${email}`);
  }
}
await mongoose.disconnect();
if (memServer) await memServer.stop();
