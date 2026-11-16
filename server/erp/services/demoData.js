import bcrypt from 'bcryptjs';
import { User, Settings } from '../models/core.js';
import { ensureDefaultAccounts } from './ledger.js';

export async function seedDemoData() {
  // 1. Settings
  await Settings.findOneAndUpdate(
    { key: 'main' },
    {
      $setOnInsert: {
        key: 'main',
        companyName: 'EPI UPS Bangladesh Limited',
        address: 'House #12, Road #4, Dhanmondi, Dhaka-1205, Bangladesh',
        phone: '+880 2 9876543, +880 1711 000000',
        email: 'info@epiups.com.bd',
        bin: '001234567-0101',
        tin: '123456789012',
        defaultVatRate: 15,
        vatRates: [0, 5, 7.5, 10, 15],
        fiscalYearStartMonth: 7,
        currency: 'BDT',
      },
    },
    { upsert: true }
  );

  // 2. Admin User
  let admin = await User.findOne({ role: 'admin' });
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@epiups.com.bd';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe#2026';

  if (!admin) {
    admin = await User.create({
      name: 'EPI Administrator',
      email: adminEmail.toLowerCase(),
      role: 'admin',
      passwordHash: await bcrypt.hash(adminPassword, 12),
      active: true,
    });
    console.log(`Demo admin created: ${admin.email}`);
  }

  // 3. Ensure Default Chart of Accounts with zero initial balances
  await ensureDefaultAccounts();

  // No fake business transactions are seeded so the user has a clean environment for manual data entry.
}
