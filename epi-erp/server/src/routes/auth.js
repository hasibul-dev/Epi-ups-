import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { User, ROLES } from '../models/core.js';
import { authenticate, guard, audit, validate, PERMISSIONS } from '../middleware/auth.js';
import { ensureDefaultAccounts } from '../services/ledger.js';
import { demoUser } from '../services/demoMock.js';

const r = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, message: { error: 'Too many attempts. Try again in 15 minutes.' } });

const secret = () => process.env.JWT_SECRET || 'epi-erp-local-demo-jwt-secret-key-32-chars-minimum';
const sign = (u) => jwt.sign(
  { sub: String(u._id || u.id), role: u.role, email: u.email, name: u.name },
  secret(),
  { expiresIn: '8h' }
);
const signRefresh = (u) => jwt.sign(
  { sub: String(u._id || u.id), role: u.role, type: 'refresh' },
  secret(),
  { expiresIn: '7d' }
);
const pub = (u) => ({
  id: u._id || u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  permissions: PERMISSIONS[u.role] || PERMISSIONS.admin,
});
const pw = z.string().min(8, 'Password must be at least 8 characters');

r.get('/status', async (_req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ needsSetup: count === 0 });
  } catch {
    res.json({ needsSetup: false });
  }
});

// Refresh token endpoint: renews session without interrupting user activity
r.post('/refresh', async (req, res) => {
  const h = req.headers.authorization || '';
  const token = req.body?.refreshToken || (h.startsWith('Bearer ') ? h.slice(7) : null);
  if (!token) return res.status(401).json({ error: 'Refresh token required', code: 'REFRESH_REQUIRED' });

  try {
    const payload = jwt.verify(token, secret());
    let u;
    if (payload.sub === String(demoUser._id) || payload.email === demoUser.email) {
      u = demoUser;
    } else {
      u = await User.findById(payload.sub);
      if (!u || !u.active) return res.status(401).json({ error: 'Account disabled or not found', code: 'ACCOUNT_DISABLED' });
    }
    res.json({ token: sign(u), refreshToken: signRefresh(u), user: pub(u) });
  } catch {
    res.status(401).json({ error: 'Invalid or expired session', code: 'SESSION_EXPIRED' });
  }
});

// First-run: creates the first admin only when no users exist
r.post('/setup', limiter, validate(z.object({ name: z.string().min(2), email: z.email(), password: pw })), async (req, res) => {
  if ((await User.countDocuments()) > 0) return res.status(403).json({ error: 'Setup is already complete' });
  await ensureDefaultAccounts();
  const u = await User.create({ name: req.body.name, email: req.body.email, role: 'admin', passwordHash: await bcrypt.hash(req.body.password, 12) });
  req.user = u;
  await audit(req, 'create', 'User', u._id, `First admin created: ${u.email}`);
  res.status(201).json({ token: sign(u), refreshToken: signRefresh(u), user: pub(u) });
});

r.post('/login', limiter, validate(z.object({ email: z.string().min(3), password: z.string().min(1) })), async (req, res) => {
  const u = await User.findOne({ email: req.body.email.toLowerCase() }).select('+passwordHash');
  if (!u || !u.active || !(await bcrypt.compare(req.body.password, u.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  u.lastLogin = new Date();
  await u.save();
  req.user = u;
  await audit(req, 'login', 'User', u._id, `${u.email} signed in`);
  res.json({ token: sign(u), refreshToken: signRefresh(u), user: pub(u) });
});

r.get('/me', authenticate, (req, res) => res.json({ user: pub(req.user) }));

r.post('/change-password', authenticate, validate(z.object({ current: z.string(), next: pw })), async (req, res) => {
  const u = await User.findById(req.user._id).select('+passwordHash');
  if (!(await bcrypt.compare(req.body.current, u.passwordHash))) return res.status(400).json({ error: 'Current password is incorrect' });
  u.passwordHash = await bcrypt.hash(req.body.next, 12);
  await u.save();
  await audit(req, 'update', 'User', u._id, 'Password changed');
  res.json({ ok: true });
});

// ---- user management (admin) ----
export const users = Router();
users.use(authenticate);
users.get('/', guard('users', 'read'), async (_req, res) => res.json(await User.find().sort({ name: 1 })));
users.post('/', guard('users', 'write'), validate(z.object({ name: z.string().min(2), email: z.email(), role: z.enum(ROLES), password: pw })), async (req, res) => {
  const u = await User.create({ name: req.body.name, email: req.body.email, role: req.body.role, passwordHash: await bcrypt.hash(req.body.password, 12) });
  await audit(req, 'create', 'User', u._id, `Created user ${u.email} (${u.role})`);
  res.status(201).json(u);
});
users.put('/:id', guard('users', 'write'), validate(z.object({ name: z.string().min(2).optional(), role: z.enum(ROLES).optional(), active: z.boolean().optional(), password: pw.optional() })), async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) return res.status(404).json({ error: 'User not found' });
  const { password, ...rest } = req.body;
  if (String(u._id) === String(req.user._id) && (rest.active === false || (rest.role && rest.role !== 'admin'))) {
    return res.status(400).json({ error: 'You cannot disable or demote your own account' });
  }
  if ((rest.active === false || (rest.role && rest.role !== 'admin')) && u.role === 'admin') {
    const admins = await User.countDocuments({ role: 'admin', active: true });
    if (admins <= 1) return res.status(400).json({ error: 'At least one active admin is required' });
  }
  Object.assign(u, rest);
  if (password) u.passwordHash = await bcrypt.hash(password, 12);
  await u.save();
  await audit(req, 'update', 'User', u._id, `Updated user ${u.email}${password ? ' (password reset)' : ''}`);
  res.json(u);
});

export default r;
