import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const isVercel = Boolean(process.env.VERCEL);
const BUNDLED_DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_DIR = isVercel ? '/tmp' : BUNDLED_DATA_DIR;

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Gracefully handle read-only environments
}

const USERS_FILE = path.join(DATA_DIR, 'central_users.json');
const AUDIT_FILE = path.join(DATA_DIR, 'central_audit_logs.json');

// Local file storage helpers
function readJson(file, fallback = []) {
  try {
    if (!fs.existsSync(file)) {
      if (isVercel) {
        const bundledFile = path.join(BUNDLED_DATA_DIR, path.basename(file));
        if (fs.existsSync(bundledFile)) {
          const content = fs.readFileSync(bundledFile, 'utf8');
          try {
            const data = JSON.parse(content || '[]');
            writeJson(file, data);
            return data;
          } catch {}
        }
      }
      writeJson(file, fallback);
      return fallback;
    }
    const content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`[DB File] Error reading ${file}:`, err.message);
    return fallback;
  }
}

function writeJson(file, data) {
  try {
    const temp = `${file}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(temp, file);
    return true;
  } catch (err) {
    console.error(`[DB File] Error writing ${file}:`, err.message);
    return false;
  }
}

let mongoClient = null;
let mongoDb = null;
let isUsingMongo = false;
let dbError = null;
let dbInitPromise = null;

export async function initDatabase() {
  if (isUsingMongo && mongoDb) {
    return { isUsingMongo: true, mode: 'mongodb' };
  }
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'epi_central';

    if (uri && (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'))) {
      try {
        console.log(`[Database] Attempting connection to MongoDB (${dbName})...`);
        mongoClient = new MongoClient(uri, {
          serverSelectionTimeoutMS: 4000,
          connectTimeoutMS: 5000,
          maxPoolSize: 10,
        });
        await mongoClient.connect();
        mongoDb = mongoClient.db(dbName);
        await mongoDb.command({ ping: 1 });
        isUsingMongo = true;
        dbError = null;
        console.log(`[Database] Successfully connected to MongoDB: ${dbName}`);
        return { isUsingMongo: true, mode: 'mongodb' };
      } catch (err) {
        dbError = err.message;
        isUsingMongo = false;
        console.log(`[Database] MongoDB not available (${err.message}). Using local storage in ${DATA_DIR}.`);
      }
    } else {
      isUsingMongo = false;
      console.log(`[Database] Operating with local storage in ${DATA_DIR}.`);
    }

    // Ensure JSON files exist
    readJson(USERS_FILE, []);
    readJson(AUDIT_FILE, []);

    return { isUsingMongo: false, mode: 'file-storage' };
  })();

  return dbInitPromise;
}

export function getDbStatus() {
  return {
    isUsingMongo,
    mode: isUsingMongo ? 'mongodb' : 'file-storage',
    error: dbError,
    usersFile: USERS_FILE,
  };
}

// -------------------------------------------------------------
// Unified User Data Access Object (DAO)
// -------------------------------------------------------------
export const UsersDAO = {
  async count() {
    if (isUsingMongo && mongoDb) {
      return await mongoDb.collection('central_users').countDocuments();
    }
    const users = readJson(USERS_FILE, []);
    return users.length;
  },

  async countSuperAdmins() {
    if (isUsingMongo && mongoDb) {
      return await mongoDb.collection('central_users').countDocuments({ role: 'superadmin' });
    }
    const users = readJson(USERS_FILE, []);
    return users.filter((u) => u.role === 'superadmin').length;
  },

  async findAll() {
    if (isUsingMongo && mongoDb) {
      const list = await mongoDb.collection('central_users').find({}).sort({ createdAt: -1 }).toArray();
      return list.map((u) => ({ ...u, id: String(u._id) }));
    }
    return readJson(USERS_FILE, []);
  },

  async findById(id) {
    if (isUsingMongo && mongoDb) {
      let q = { id: String(id) };
      if (ObjectId.isValid(id)) {
        q = { $or: [{ _id: new ObjectId(id) }, { id: String(id) }] };
      }
      const u = await mongoDb.collection('central_users').findOne(q);
      return u ? { ...u, id: String(u._id) } : null;
    }
    const users = readJson(USERS_FILE, []);
    return users.find((u) => String(u.id) === String(id) || String(u.userId) === String(id)) || null;
  },

  async findByUserId(userId) {
    const cleanId = String(userId || '').trim().toLowerCase();
    if (isUsingMongo && mongoDb) {
      const u = await mongoDb.collection('central_users').findOne({
        userId: { $regex: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });
      return u ? { ...u, id: String(u._id) } : null;
    }
    const users = readJson(USERS_FILE, []);
    return users.find((u) => String(u.userId || '').trim().toLowerCase() === cleanId) || null;
  },

  async findByEmail(email) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (isUsingMongo && mongoDb) {
      const u = await mongoDb.collection('central_users').findOne({
        email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });
      return u ? { ...u, id: String(u._id) } : null;
    }
    const users = readJson(USERS_FILE, []);
    return users.find((u) => String(u.email || '').trim().toLowerCase() === cleanEmail) || null;
  },

  async create(userData) {
    const now = new Date().toISOString();
    const doc = {
      id: userData.id || `emp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: String(userData.userId).trim(),
      name: String(userData.name).trim(),
      email: String(userData.email || '').trim().toLowerCase(),
      passwordHash: userData.passwordHash,
      role: userData.role || 'employee', // 'superadmin' | 'employee'
      departments: Array.isArray(userData.departments) ? userData.departments : [], // ['service', 'sales', 'accounts']
      departmentRoles: userData.departmentRoles || {},
      status: userData.status || 'active', // 'active' | 'inactive'
      createdAt: now,
      updatedAt: now,
      createdBy: userData.createdBy || 'system',
      lastLogin: null,
      loginHistory: [],
    };

    if (isUsingMongo && mongoDb) {
      const res = await mongoDb.collection('central_users').insertOne(doc);
      return { ...doc, id: String(res.insertedId), _id: res.insertedId };
    }

    const users = readJson(USERS_FILE, []);
    users.unshift(doc);
    writeJson(USERS_FILE, users);
    return doc;
  },

  async update(id, updates) {
    const now = new Date().toISOString();
    updates.updatedAt = now;

    if (isUsingMongo && mongoDb) {
      let q = { id: String(id) };
      if (ObjectId.isValid(id)) {
        q = { $or: [{ _id: new ObjectId(id) }, { id: String(id) }] };
      }
      await mongoDb.collection('central_users').updateOne(q, { $set: updates });
      return await this.findById(id);
    }

    const users = readJson(USERS_FILE, []);
    const idx = users.findIndex((u) => String(u.id) === String(id) || String(u.userId) === String(id));
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    writeJson(USERS_FILE, users);
    return users[idx];
  },

  async recordLogin(id, { ip, userAgent }) {
    const now = new Date().toISOString();
    const historyItem = { timestamp: now, ip: ip || '127.0.0.1', userAgent: userAgent || 'Unknown' };

    if (isUsingMongo && mongoDb) {
      let q = { id: String(id) };
      if (ObjectId.isValid(id)) {
        q = { $or: [{ _id: new ObjectId(id) }, { id: String(id) }] };
      }
      await mongoDb.collection('central_users').updateOne(q, {
        $set: { lastLogin: now },
        $push: { loginHistory: { $each: [historyItem], $slice: -30 } },
      });
      return;
    }

    const users = readJson(USERS_FILE, []);
    const idx = users.findIndex((u) => String(u.id) === String(id) || String(u.userId) === String(id));
    if (idx !== -1) {
      users[idx].lastLogin = now;
      if (!Array.isArray(users[idx].loginHistory)) users[idx].loginHistory = [];
      users[idx].loginHistory.unshift(historyItem);
      if (users[idx].loginHistory.length > 30) {
        users[idx].loginHistory = users[idx].loginHistory.slice(0, 30);
      }
      writeJson(USERS_FILE, users);
    }
  },

  async delete(id) {
    if (isUsingMongo && mongoDb) {
      let q = { id: String(id) };
      if (ObjectId.isValid(id)) {
        q = { $or: [{ _id: new ObjectId(id) }, { id: String(id) }] };
      }
      const res = await mongoDb.collection('central_users').deleteOne(q);
      return res.deletedCount > 0;
    }

    const users = readJson(USERS_FILE, []);
    const filtered = users.filter((u) => String(u.id) !== String(id) && String(u.userId) !== String(id));
    if (filtered.length !== users.length) {
      writeJson(USERS_FILE, filtered);
      return true;
    }
    return false;
  },
};

// -------------------------------------------------------------
// Unified Audit Log DAO
// -------------------------------------------------------------
export const AuditDAO = {
  async log({ action, performedBy, targetUserId, details, ip }) {
    const entry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      performedBy: performedBy || 'system',
      targetUserId: targetUserId || null,
      details: details || '',
      ip: ip || '127.0.0.1',
    };

    if (isUsingMongo && mongoDb) {
      try {
        await mongoDb.collection('central_audit_logs').insertOne(entry);
      } catch (e) {
        console.error('[Audit] Failed to insert mongo audit log:', e.message);
      }
      return entry;
    }

    const logs = readJson(AUDIT_FILE, []);
    logs.unshift(entry);
    // Keep last 1000 logs
    if (logs.length > 1000) logs.splice(1000);
    writeJson(AUDIT_FILE, logs);
    return entry;
  },

  async getRecent(limit = 20) {
    if (isUsingMongo && mongoDb) {
      return await mongoDb
        .collection('central_audit_logs')
        .find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
    }
    const logs = readJson(AUDIT_FILE, []);
    return logs.slice(0, limit);
  },
};
