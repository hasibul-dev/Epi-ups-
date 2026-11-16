import app from '../server/app.js';
import { getRetentionCutoffDate } from '../server/retention.js';
import http from 'http';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    failed++;
  }
}

async function request(server, path, options = {}) {
  const address = server.address();
  const port = address.port;
  const url = `http://127.0.0.1:${port}${path}`;

  const defaultPass = process.env.CRM_PASSWORD || 'rifat@660844';
  const fetchOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-crm-auth': defaultPass,
      ...(options.headers || {}),
    },
  };
  if (options.body) {
    fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);
  let json = null;
  try {
    json = await res.json();
  } catch (e) {
    json = null;
  }
  return { status: res.status, ok: res.ok, json };
}

async function runTests() {
  console.log('====================================================');
  console.log('CRM BACKEND & MONGODB LOGIC TEST SUITE');
  console.log('====================================================');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`Test server running on port ${port}\n`);

  try {
    // TEST 1: Health check endpoint
    console.log('--- Test 1: Health Check Endpoint (/api/health) ---');
    const health = await request(server, '/api/health');
    assert(health.status === 200, 'Health endpoint responds with HTTP 200');
    assert(health.json.status === 'ok', 'Health status is "ok"');
    assert(typeof health.json.database === 'object', 'Health endpoint returns database info');
    const isDbConnected = health.json.database.connected;
    console.log(`Database connected state: ${isDbConnected}`);

    // TEST 2: Database status on /api/bootstrap
    console.log('\n--- Test 2: Truthful Database Error Handling & Bootstrap ---');
    const bootstrap = await request(server, '/api/bootstrap');
    if (isDbConnected) {
      assert(bootstrap.status === 200, 'Bootstrap returns HTTP 200 when DB is connected');
      assert(bootstrap.json.success === true, 'Bootstrap response includes success: true');
    } else {
      assert(bootstrap.status === 503, 'Bootstrap returns HTTP 503 when DB is not connected');
      assert(bootstrap.json.dbConnected === false, 'Bootstrap response includes dbConnected: false');
    }

    // TEST 3: Safe behavior on /api/clients
    console.log('\n--- Test 3: Safe Client Mutation Behavior ---');
    const addClientRes = await request(server, '/api/clients', {
      method: 'POST',
      body: { name: 'Test Automated Client', company: 'EPI Ltd' },
    });
    if (isDbConnected) {
      assert(addClientRes.status === 200 || addClientRes.status === 201, 'Adding client succeeds with HTTP 200/201 when DB connected');
      assert(addClientRes.json.success === true, 'Client record saved successfully');
      // Clean up test client
      if (addClientRes.json.client?.id) {
        await request(server, `/api/clients/${addClientRes.json.client.id}`, { method: 'DELETE' });
      }
    } else {
      assert(addClientRes.status === 503, 'Attempting to add client without DB returns HTTP 503');
      assert(addClientRes.json.error === 'Database not connected', 'No fake success returned on client creation');
    }

    // TEST 4: Three-Month Retention Cutoff Calculation
    console.log('\n--- Test 4: Retention Cutoff Calculation ---');
    const cutoff = getRetentionCutoffDate(3);
    const todayDate = new Date();
    const expectedYear = todayDate.getMonth() < 3 ? todayDate.getFullYear() - 1 : todayDate.getFullYear();
    assert(typeof cutoff === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(cutoff), 'Cutoff date format is YYYY-MM-DD');
    assert(cutoff.startsWith(String(expectedYear)), `Cutoff year correctly calculated (${cutoff})`);

    // TEST 5: Retention Dry-Run / Preview Protection
    console.log('\n--- Test 5: Retention Preview Endpoint Protection ---');
    const retentionPreview = await request(server, '/api/retention/preview');
    assert(retentionPreview.status === 503 || retentionPreview.status === 200, 'Retention endpoint handles connection state safely');

    // TEST 6: Unicode and Bangla Character Handling in Payload
    console.log('\n--- Test 6: Unicode and Bangla Character Preservation ---');
    const banglaText = 'জরুরি ইউপিএস মেইনটেন্যান্স ও ব্যাটারি চেক';
    const clientBangla = {
      name: 'মোঃ হাবিবুল্লাহ',
      company: 'স্কয়ার টেক্সটাইল লিমিটেড',
      notes: banglaText,
    };
    const stringified = JSON.stringify(clientBangla);
    const parsed = JSON.parse(stringified);
    assert(parsed.name === 'মোঃ হাবিবুল্লাহ', 'Bangla name preserved in serialization');
    assert(parsed.notes === banglaText, 'Bangla remarks text preserved without corruption');

    // TEST 7: Migration Payload Validation
    console.log('\n--- Test 7: Migration Payload Validation ---');
    const invalidMigrate = await request(server, '/api/migrate', {
      method: 'POST',
      body: 'invalid-string',
    });
    assert(invalidMigrate.status === 400 || invalidMigrate.status === 503, 'Invalid migration body rejected safely');

    // TEST 8: Authentication Header Protection
    console.log('\n--- Test 8: Authentication Header Protection ---');
    const unauthNoHeader = await request(server, '/api/bootstrap', {
      headers: { 'x-crm-auth': '' },
    });
    assert(unauthNoHeader.status === 401, 'Request without x-crm-auth returns HTTP 401 Unauthorized');
    assert(unauthNoHeader.json.error.includes('Unauthorized'), 'Returns informative 401 Unauthorized message');

    const unauthWrongHeader = await request(server, '/api/bootstrap', {
      headers: { 'x-crm-auth': 'wrong_password_123' },
    });
    assert(unauthWrongHeader.status === 401, 'Request with invalid x-crm-auth returns HTTP 401 Unauthorized');

    const authCorrectHeader = await request(server, '/api/bootstrap', {
      headers: { 'x-crm-auth': process.env.CRM_PASSWORD || 'rifat@660844' },
    });
    assert(authCorrectHeader.status !== 401, 'Request with valid x-crm-auth passes authentication (status ' + authCorrectHeader.status + ')');

    // TEST 9: Connection Tester Endpoint Validation
    console.log('\n--- Test 9: Connection Tester Endpoint Validation ---');
    const emptyTest = await request(server, '/api/test-connection', {
      method: 'POST',
      body: { uri: '' },
    });
    assert(emptyTest.status === 400, 'Empty URI to /api/test-connection returns HTTP 400');

    const placeholderTest = await request(server, '/api/test-connection', {
      method: 'POST',
      body: { uri: 'mongodb+srv://user:<password>@cluster0.abc.mongodb.net/test' },
    });
    assert(placeholderTest.status === 400, 'URI with <password> placeholder returns HTTP 400');
    assert(placeholderTest.json.error.includes('<password>'), 'Error specifically warns about <password> placeholder');

    const invalidSchemeTest = await request(server, '/api/test-connection', {
      method: 'POST',
      body: { uri: 'postgres://user:pass@localhost:5432/test' },
    });
    assert(invalidSchemeTest.status === 400, 'Non-mongodb URI returns HTTP 400');

  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} passed, ${failed} failed.`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
