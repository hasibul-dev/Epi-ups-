import assert from 'assert';
import app from '../server/app.js';
import { connectToDatabase, closeDatabase, getDb } from '../server/db.js';
import { RULES, addDays, today, getTaskCategory } from '../src/utils/helpers.js';

async function runFollowUpDateTests() {
  console.log('Testing Client Follow-up Date Edit & Automatic Interval Override...\n');

  const { status } = await connectToDatabase();
  assert(status.connected, 'Database should be connected');
  const db = await getDb();

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  const testAuthPass = process.env.CRM_PASSWORD || 'rifat@660844';
  const authHeader = { 'Content-Type': 'application/json', 'x-crm-auth': testAuthPass };

  const testClientId = 'c-test-follow-' + Date.now();
  const tToday = today();

  try {
    // 1. Create a client with initial follow-up due today
    console.log('--- 1. Creating test client ---');
    const createRes = await fetch(`${baseUrl}/api/clients`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        id: testClientId,
        name: 'Rahim Chowdhury',
        desig: 'Managing Director',
        company: 'Chowdhury Garments Ltd',
        phone: '01711223344',
        email: 'rahim@chowdhury.com',
        notes: 'Interested in 20kVA Online UPS',
        category: 'Potential',
        nextDate: tToday,
      }),
    });
    assert.strictEqual(createRes.status, 201, 'Client creation should return 201');
    console.log('✓ Test client created with nextDate =', tToday);

    // Verify it is due today
    let clientInDb = await db.collection('clients').findOne({ id: testClientId });
    assert(clientInDb, 'Client must exist in DB');
    assert.strictEqual(clientInDb.nextDate, tToday);
    assert(clientInDb.nextDate <= tToday, 'Should be due today');

    // 2. Quick Edit Next Follow-up Date (e.g. callback in 4 days)
    console.log('\n--- 2. Testing Quick Edit Next Follow-up Date (4 days later) ---');
    const fourDaysLater = addDays(tToday, 4);
    const editDateRes = await fetch(`${baseUrl}/api/clients/${testClientId}`, {
      method: 'PUT',
      headers: authHeader,
      body: JSON.stringify({ nextDate: fourDaysLater }),
    });
    assert.strictEqual(editDateRes.status, 200, 'PUT /api/clients/:id should return 200');

    clientInDb = await db.collection('clients').findOne({ id: testClientId });
    assert.strictEqual(clientInDb.nextDate, fourDaysLater, 'nextDate must be updated to 4 days later');
    assert.strictEqual(clientInDb.name, 'Rahim Chowdhury', 'Client name must be preserved');
    assert.strictEqual(clientInDb.company, 'Chowdhury Garments Ltd', 'Company must be preserved');
    assert.strictEqual(clientInDb.notes, 'Interested in 20kVA Online UPS', 'Notes must be preserved');

    // Verify it moved from Due Today to Upcoming
    const isDueAfterEdit = clientInDb.nextDate && clientInDb.nextDate <= tToday;
    assert.strictEqual(isDueAfterEdit, false, 'Client should no longer be due today');
    const categoryAfterEdit = getTaskCategory(clientInDb.nextDate, '', 'Pending');
    assert.strictEqual(categoryAfterEdit, 'Upcoming', 'Client category must be Upcoming');
    console.log('✓ Quick Edit Next Follow-up Date successfully updated and moved client to Upcoming!');

    // 3. Quick Edit to past date to test Overdue reminder
    console.log('\n--- 3. Testing Quick Edit to past date (Overdue reminder) ---');
    const twoDaysAgo = addDays(tToday, -2);
    await fetch(`${baseUrl}/api/clients/${testClientId}`, {
      method: 'PUT',
      headers: authHeader,
      body: JSON.stringify({ nextDate: twoDaysAgo }),
    });
    clientInDb = await db.collection('clients').findOne({ id: testClientId });
    assert.strictEqual(clientInDb.nextDate, twoDaysAgo);
    assert.strictEqual(getTaskCategory(clientInDb.nextDate, '', 'Pending'), 'Overdue');
    console.log('✓ Overdue categorization works correctly based on edited date!');

    // 4. Test Follow-up Completion with Manual Override (e.g. client requested callback after 2 days)
    console.log('\n--- 4. Testing Follow-up Completion with Manual Date Override (2 days) ---');
    const twoDaysLater = addDays(tToday, 2);
    // Normally 'Potential' default interval is +3d, but client asked for 2 days
    const defaultIntervalDate = addDays(tToday, RULES['Potential'] ?? 3); // 3 days
    assert.notStrictEqual(twoDaysLater, defaultIntervalDate, 'Override date differs from default');

    const doneRes = await fetch(`${baseUrl}/api/follow-up/done`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        id: testClientId,
        cat: 'Potential',
        method: 'Phone Call',
        notes: 'Discussed 20kVA pricing; client requested callback in exactly 2 days',
        completedDate: tToday,
        nextDate: twoDaysLater, // Manual override date
        time: '11:00 AM',
      }),
    });
    assert.strictEqual(doneRes.status, 200, 'POST /api/follow-up/done should return 200');
    const doneJson = await doneRes.json();
    assert(doneJson.success, 'Follow-up done should succeed');

    clientInDb = await db.collection('clients').findOne({ id: testClientId });
    assert.strictEqual(clientInDb.nextDate, twoDaysLater, 'nextDate must match the manually selected override date');
    assert.strictEqual(clientInDb.category, 'Potential');
    assert.strictEqual(clientInDb.lastFollowType, 'Phone Call');

    // Check history entry
    const historyDoc = await db.collection('history').findOne({ clientId: testClientId });
    assert(historyDoc, 'History entry must be created');
    assert.strictEqual(historyDoc.nextDate, twoDaysLater, 'History entry must record the overridden next date');
    assert.strictEqual(historyDoc.status, 'Completed');
    console.log('✓ Manual override date properly overrode default interval and saved in DB and History!');

    // 5. Test Later Follow-up Completion with Default Automatic Interval (Quotation +7d)
    console.log('\n--- 5. Testing subsequent Follow-up with automatic default interval (Quotation +7d) ---');
    const sevenDaysLater = addDays(tToday, RULES['Quotation'] ?? 7);
    const quotDoneRes = await fetch(`${baseUrl}/api/follow-up/done`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        id: testClientId,
        cat: 'Quotation',
        method: 'Email',
        notes: 'Sent formal quotation for 20kVA UPS',
        completedDate: tToday,
        nextDate: sevenDaysLater, // automatic interval
        time: '03:00 PM',
      }),
    });
    assert.strictEqual(quotDoneRes.status, 200);

    clientInDb = await db.collection('clients').findOne({ id: testClientId });
    assert.strictEqual(clientInDb.nextDate, sevenDaysLater, 'Default interval must work normally when not overridden');
    assert.strictEqual(clientInDb.category, 'Quotation');
    assert.strictEqual(clientInDb.previousStatus, 'Potential');
    console.log('✓ Existing automatic intervals (Quotation +7d) continue working normally!');

    // 5b. Test General Option with Manually Selected Custom Date (15 days later)
    console.log('\n--- 5b. Testing General Option with Manually Selected Custom Date (15 days later) ---');
    const fifteenDaysLater = addDays(tToday, 15);
    const genDoneRes = await fetch(`${baseUrl}/api/follow-up/done`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        id: testClientId,
        cat: 'General',
        method: 'Visit',
        notes: 'General follow-up meeting scheduled',
        completedDate: tToday,
        nextDate: fifteenDaysLater, // custom calendar date
        time: '04:30 PM',
      }),
    });
    assert.strictEqual(genDoneRes.status, 200);

    clientInDb = await db.collection('clients').findOne({ id: testClientId });
    assert.strictEqual(clientInDb.nextDate, fifteenDaysLater, 'General option must save the manually selected date');
    assert.strictEqual(clientInDb.category, 'General');
    assert.strictEqual(clientInDb.previousStatus, 'Quotation');
    assert.strictEqual(getTaskCategory(clientInDb.nextDate, '', 'Pending'), 'Upcoming');
    console.log('✓ General option successfully saved manually selected date and moved to Upcoming!');

    // 6. Verify No Duplicate Clients or Lost Data
    console.log('\n--- 6. Verify No Duplicate Clients & Data Preservation ---');
    const clientsCount = await db.collection('clients').countDocuments({ id: testClientId });
    assert.strictEqual(clientsCount, 1, 'Never create duplicate client records');
    const historyCount = await db.collection('history').countDocuments({ clientId: testClientId });
    assert.strictEqual(historyCount, 3, 'History records must be preserved for each follow-up');
    console.log('✓ Zero duplicate clients, all historical entries preserved!');

    // Clean up
    console.log('\n--- Cleaning up test records ---');
    await db.collection('clients').deleteOne({ id: testClientId });
    await db.collection('history').deleteMany({ clientId: testClientId });
    console.log('✓ Clean up complete.');

    console.log('\n🎉 ALL CLIENT FOLLOW-UP DATE EDIT & INTERVAL OVERRIDE TESTS PASSED!');
  } finally {
    server.close();
    await closeDatabase();
  }
}

runFollowUpDateTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
