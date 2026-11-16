import assert from 'assert';
import http from 'http';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import app from '../server/app.js';
import { connectToDatabase, closeDatabase, getDb } from '../server/db.js';

async function runAuthTests() {
  console.log('====================================================');
  console.log('AUTHENTICATION & PASSWORD SECURITY TEST SUITE');
  console.log('====================================================');

  const { status, db } = await connectToDatabase();
  assert(status.connected, 'MongoDB Atlas should be connected');
  console.log('✓ Connected to MongoDB Atlas');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running at ${baseUrl}\n`);

  try {
    // 1. Verify user account exists in MongoDB Atlas with proper bcrypt hash
    console.log('--- Test 1: Verify Account in MongoDB Atlas ---');
    const user = await db.collection('users').findOne({ username: 'rifathabibullah' });
    assert(user, 'User "rifathabibullah" must exist in users collection');
    assert(user.passwordHash, 'User must have a passwordHash field');
    assert(
      user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$'),
      'Password must be hashed with bcrypt ($2a$ or $2b$ prefix)'
    );
    assert.notStrictEqual(user.passwordHash, 'rifat@660844', 'Password must NEVER be stored as plain text');
    const isBcryptMatch = await bcrypt.compare('rifat@660844', user.passwordHash);
    assert(isBcryptMatch, 'bcrypt.compare("rifat@660844", hash) must return true');
    console.log('✓ Account exists in MongoDB Atlas with cryptographically verified bcrypt hash!');

    // 2. Test Login with Correct Credentials
    console.log('\n--- Test 2: Test Login Endpoint with Valid Credentials ---');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'rifathabibullah',
        password: 'rifat@660844',
      }),
    });
    assert.strictEqual(loginRes.status, 200, 'Valid credentials must return HTTP 200');
    const loginData = await loginRes.json();
    assert(loginData.success, 'Login response must indicate success: true');
    assert.strictEqual(loginData.username, 'rifathabibullah');
    assert(loginData.token, 'Login response must return a session token');
    assert(loginData.token.includes('.'), 'Session token must be an HMAC signed token with payload and signature');
    const sessionToken = loginData.token;
    console.log('✓ Login succeeded with valid credentials. Received session token.');

    // 3. Test Login with Incorrect Credentials
    console.log('\n--- Test 3: Test Login Endpoint with Invalid Credentials ---');
    const wrongPassRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'rifathabibullah',
        password: 'wrong_password_xyz',
      }),
    });
    assert.strictEqual(wrongPassRes.status, 401, 'Wrong password must return HTTP 401 Unauthorized');
    const wrongPassData = await wrongPassRes.json();
    assert.strictEqual(wrongPassData.success, false);

    const wrongUserRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'unknown_admin',
        password: 'rifat@660844',
      }),
    });
    assert.strictEqual(wrongUserRes.status, 401, 'Wrong username must return HTTP 401 Unauthorized');

    const emptyRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: '', password: '' }),
    });
    assert.strictEqual(emptyRes.status, 400, 'Empty credentials must return HTTP 400');
    console.log('✓ Invalid login attempts correctly rejected with 401 / 400.');

    // 4. Test Session Token Verification
    console.log('\n--- Test 4: Test Session Token Verification ---');
    const verifyRes = await fetch(`${baseUrl}/api/auth/verify`, {
      headers: { 'x-crm-auth': sessionToken },
    });
    assert.strictEqual(verifyRes.status, 200, 'Valid session token must return HTTP 200 on verify');
    const verifyData = await verifyRes.json();
    assert(verifyData.valid, 'Session token verified successfully');

    // 5. Test Access to Protected Endpoints using Session Token
    console.log('\n--- Test 5: Protected Endpoint Access using Session Token ---');
    const protectedRes = await fetch(`${baseUrl}/api/bootstrap`, {
      headers: { 'x-crm-auth': sessionToken },
    });
    assert.strictEqual(protectedRes.status, 200, 'Protected endpoint must accept session token');
    const protectedData = await protectedRes.json();
    assert(protectedData.success, 'Protected endpoint returns expected CRM bootstrap data');

    // Access without token
    const unauthRes = await fetch(`${baseUrl}/api/bootstrap`, {
      headers: { 'x-crm-auth': '' },
    });
    assert.strictEqual(unauthRes.status, 401, 'Protected endpoint without token returns HTTP 401');

    // Access with forged token
    const forgedRes = await fetch(`${baseUrl}/api/bootstrap`, {
      headers: { 'x-crm-auth': 'fake.token.signature' },
    });
    assert.strictEqual(forgedRes.status, 401, 'Protected endpoint with forged token returns HTTP 401');
    console.log('✓ Protected endpoints correctly authorize session token and reject unauthorized calls.');

    // 6. Test Change Password Flow
    console.log('\n--- Test 6: Test Change Password with Bcrypt Verification ---');
    // Wrong current password
    const badChange = await fetch(`${baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-crm-auth': sessionToken,
      },
      body: JSON.stringify({
        currentPassword: 'incorrect_current',
        newPassword: 'tempNewPassword@123',
      }),
    });
    assert.strictEqual(badChange.status, 400, 'Incorrect current password must return HTTP 400');

    // Correct current password
    const goodChange = await fetch(`${baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-crm-auth': sessionToken,
      },
      body: JSON.stringify({
        currentPassword: 'rifat@660844',
        newPassword: 'tempPassword@999',
      }),
    });
    assert.strictEqual(goodChange.status, 200, 'Valid password change must succeed');

    // Verify temp password in DB is hashed
    const tempUser = await db.collection('users').findOne({ username: 'rifathabibullah' });
    assert(await bcrypt.compare('tempPassword@999', tempUser.passwordHash), 'New temp password must be hashed in DB');

    // Restore original password 'rifat@660844'
    const restoreChange = await fetch(`${baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-crm-auth': goodChange.token || sessionToken,
      },
      body: JSON.stringify({
        currentPassword: 'tempPassword@999',
        newPassword: 'rifat@660844',
      }),
    });
    assert.strictEqual(restoreChange.status, 200, 'Restoring original password must succeed');

    // Confirm original password 'rifat@660844' is restored and hashed
    const restoredUser = await db.collection('users').findOne({ username: 'rifathabibullah' });
    assert(await bcrypt.compare('rifat@660844', restoredUser.passwordHash), 'Restored password must match rifat@660844');
    console.log('✓ Change password flow tested: bcrypt verification and update verified!');

    // 7. Verify No Hardcoded Credentials in Frontend Code
    console.log('\n--- Test 7: Verify Frontend Codebase Has No Hardcoded Passwords ---');
    const srcDir = path.resolve('src');
    function scanDir(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
          scanDir(full);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
          const content = fs.readFileSync(full, 'utf8');
          assert(!content.includes('rifat@660844'), `Frontend file ${file} must NOT contain hardcoded password!`);
          assert(!content.includes('epi123'), `Frontend file ${file} must NOT contain old default password!`);
        }
      }
    }
    scanDir(srcDir);
    console.log('✓ Verified: No plaintext passwords found in any frontend source files!');

    console.log('\n====================================================');
    console.log('ALL AUTHENTICATION & SECURITY TESTS PASSED! 🎉');
    console.log('====================================================');
  } finally {
    server.close();
    await closeDatabase();
    process.exit(0);
  }
}

runAuthTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
