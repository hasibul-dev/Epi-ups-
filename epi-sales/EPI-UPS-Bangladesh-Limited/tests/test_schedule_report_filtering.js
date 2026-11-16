import assert from 'assert';
import app from '../server/app.js';
import { connectToDatabase, closeDatabase, getDb } from '../server/db.js';
import { formatTime12h, inRange, compareTimes } from '../src/utils/helpers.js';

// Replicate the exact buildRows function from src/components/Reports.jsx to test in node
const isCompleted = (status) => String(status || '').trim().toLowerCase() === 'completed';

function buildRows(db, type, from, to) {
  const rows = [];
  const historyWorkIds = new Set(
    (db.history || [])
      .flatMap((h) => [h.workId, h.id])
      .filter((v) => v !== null && v !== undefined && v !== '')
      .map(String)
  );
  const historyNewWorkIds = new Set(
    (db.history || [])
      .flatMap((h) => [h.newWorkId, h.id])
      .filter((v) => v !== null && v !== undefined && v !== '')
      .map(String)
  );
  const historyClientFollowUps = new Set(
    (db.history || [])
      .filter((h) => h.type === 'Follow-up' && h.clientId && h.date)
      .map((h) => `${String(h.clientId)}_${String(h.date)}`)
  );

  if (type === 'work') {
    (db.history || [])
      .filter((h) => inRange(h.date, from, to))
      .forEach((h) =>
        rows.push({
          key: 'h-' + h.id,
          rawId: h.id,
          source: 'history',
          date: h.date,
          time: h.time ? formatTime12h(h.time) : '',
          activity:
            h.text ||
            (h.client ? `${h.type} - ${h.client}${h.company ? ' - ' + h.company : ''}` : h.type || '') +
            (h.notes ? ` [Note: ${h.notes}]` : ''),
          notes: h.notes || '',
          status: h.status || 'Completed',
          isModified: false,
          isSaving: false,
        })
      );
    (db.work || [])
      .filter((w) => inRange(w.date, from, to) && (!isCompleted(w.status) || !historyWorkIds.has(String(w.id))))
      .forEach((w) =>
        rows.push({
          key: 'w-' + w.id,
          rawId: w.id,
          source: 'work',
          date: w.date,
          time: w.time ? formatTime12h(w.time) : '',
          activity: w.text + (w.notes ? ` [Note: ${w.notes}]` : ''),
          notes: w.notes || '',
          status: w.status || 'Pending',
          isModified: false,
          isSaving: false,
        })
      );
    (db.newWork || [])
      .filter((w) => inRange(w.date, from, to) && (!isCompleted(w.status) || !historyNewWorkIds.has(String(w.id))))
      .forEach((w) =>
        rows.push({
          key: 'n-' + w.id,
          rawId: w.id,
          source: 'new',
          date: w.date,
          time: w.time ? formatTime12h(w.time) : '',
          activity: w.text + (w.notes ? ` [Note: ${w.notes}]` : ''),
          notes: w.notes || '',
          status: w.status || 'Pending',
          isModified: false,
          isSaving: false,
        })
      );
    (db.clients || [])
      .filter(
        (c) =>
          c.nextDate &&
          inRange(c.nextDate, from, to) &&
          isCompleted(c.status) &&
          !historyClientFollowUps.has(`${String(c.id)}_${String(c.nextDate)}`)
      )
      .forEach((c) =>
        rows.push({
          key: 'fc-' + c.id,
          rawId: c.id,
          source: 'client',
          date: c.nextDate,
          time: '',
          activity: `Follow-up - ${c.name} - ${c.company}` + (c.notes ? ` [Note: ${c.notes}]` : ''),
          notes: c.notes || '',
          status: 'Completed',
          isModified: false,
          isSaving: false,
        })
      );
  } else if (type === 'schedule') {
    (db.clients || [])
      .filter((c) => c.nextDate && inRange(c.nextDate, from, to) && !isCompleted(c.status))
      .forEach((c) =>
        rows.push({
          key: 'f-' + c.id,
          rawId: c.id,
          source: 'client',
          date: c.nextDate,
          time: '',
          activity: `Follow-up - ${c.name} - ${c.company}` + (c.notes ? ` [Note: ${c.notes}]` : ''),
          notes: c.notes || '',
          status: c.status || 'Pending',
          isModified: false,
          isSaving: false,
        })
      );
    (db.work || [])
      .filter((w) => inRange(w.date, from, to) && !isCompleted(w.status))
      .forEach((w) =>
        rows.push({
          key: 'w-' + w.id,
          rawId: w.id,
          source: 'work',
          date: w.date,
          time: w.time ? formatTime12h(w.time) : '',
          activity: w.text + (w.notes ? ` [Note: ${w.notes}]` : ''),
          notes: w.notes || '',
          status: w.status || 'Pending',
          isModified: false,
          isSaving: false,
        })
      );
  } else {
    (db.history || [])
      .filter((h) => inRange(h.date, from, to))
      .forEach((h) =>
        rows.push({
          key: 'h-' + h.id,
          rawId: h.id,
          source: 'history',
          date: h.date,
          time: h.time ? formatTime12h(h.time) : '',
          activity:
            h.text ||
            (h.client ? `${h.type} - ${h.client}${h.company ? ' - ' + h.company : ''}` : h.type || '') +
            (h.notes ? ` [Note: ${h.notes}]` : ''),
          notes: h.notes || '',
          status: h.status || 'Completed',
          isModified: false,
          isSaving: false,
        })
      );
    (db.work || [])
      .filter(
        (w) =>
          inRange(w.date, from, to) &&
          isCompleted(w.status) &&
          !historyWorkIds.has(String(w.id))
      )
      .forEach((w) =>
        rows.push({
          key: 'w-' + w.id,
          rawId: w.id,
          source: 'work',
          date: w.date,
          time: w.time ? formatTime12h(w.time) : '',
          activity: w.text + (w.notes ? ` [Note: ${w.notes}]` : ''),
          notes: w.notes || '',
          status: 'Completed',
          isModified: false,
          isSaving: false,
        })
      );
    (db.newWork || [])
      .filter(
        (w) =>
          inRange(w.date, from, to) &&
          isCompleted(w.status) &&
          !historyNewWorkIds.has(String(w.id))
      )
      .forEach((w) =>
        rows.push({
          key: 'n-' + w.id,
          rawId: w.id,
          source: 'new',
          date: w.date,
          time: w.time ? formatTime12h(w.time) : '',
          activity: w.text + (w.notes ? ` [Note: ${w.notes}]` : ''),
          notes: w.notes || '',
          status: 'Completed',
          isModified: false,
          isSaving: false,
        })
      );
    (db.clients || [])
      .filter(
        (c) =>
          c.nextDate &&
          inRange(c.nextDate, from, to) &&
          isCompleted(c.status) &&
          !historyClientFollowUps.has(`${String(c.id)}_${String(c.nextDate)}`)
      )
      .forEach((c) =>
        rows.push({
          key: 'fc-' + c.id,
          rawId: c.id,
          source: 'client',
          date: c.nextDate,
          time: '',
          activity: `Follow-up - ${c.name} - ${c.company}` + (c.notes ? ` [Note: ${c.notes}]` : ''),
          notes: c.notes || '',
          status: 'Completed',
          isModified: false,
          isSaving: false,
        })
      );
  }

  return rows.sort((a, b) => {
    const dComp = (a.date || '').localeCompare(b.date || '');
    if (dComp !== 0) return dComp;
    return compareTimes(a.time, b.time);
  });
}

async function runScheduleReportTests() {
  console.log('Testing Schedule Report Filtering & Status Handling...\n');

  const { status } = await connectToDatabase();
  assert(status.connected, 'Database should be connected');
  const db = await getDb();

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  const testAuthPass = process.env.CRM_PASSWORD || 'rifat@660844';
  const authHeader = { 'Content-Type': 'application/json', 'x-crm-auth': testAuthPass };

  try {
    const testDate = '2026-10-25';
    const outsideDate = '2026-11-30';
    const pendingWorkId = 'w-test-pending-' + Date.now();
    const completedWorkId = 'w-test-completed-' + Date.now();
    const doneEndpointWorkId = 'w-test-done-' + Date.now();

    // 1. Create a pending planned work item
    console.log('--- Step 1: Create a Pending scheduled work item ---');
    const pRes = await fetch(`${baseUrl}/api/work`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        id: pendingWorkId,
        date: testDate,
        time: '10:00 AM',
        text: 'Scheduled Generator Inspection',
        notes: 'Check fuel lines',
        status: 'Pending',
      }),
    });
    assert.strictEqual(pRes.status, 201, 'POST /api/work should return 201');

    // 2. Create another work item that we will mark completed
    console.log('--- Step 2: Create a second scheduled work item to mark as Completed ---');
    const cRes = await fetch(`${baseUrl}/api/work`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        id: completedWorkId,
        date: testDate,
        time: '11:30 AM',
        text: 'Scheduled UPS Battery Check',
        notes: '12V battery test',
        status: 'Pending',
      }),
    });
    assert.strictEqual(cRes.status, 201, 'POST /api/work should return 201');

    // 3. Create a work item that will be completed via /done endpoint
    console.log('--- Step 3: Create a third work item completed via /done endpoint ---');
    const dRes = await fetch(`${baseUrl}/api/work`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        id: doneEndpointWorkId,
        date: testDate,
        time: '02:00 PM',
        text: 'Scheduled Inverter Calibration',
        notes: 'Calibration task',
        status: 'Pending',
      }),
    });
    assert.strictEqual(dRes.status, 201);

    // Complete the third item via /api/work/:id/done
    const doneRes = await fetch(`${baseUrl}/api/work/${doneEndpointWorkId}/done`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        completedDate: testDate,
        notes: 'Calibration finished successfully',
      }),
    });
    assert.strictEqual(doneRes.status, 200, 'POST /api/work/:id/done should return 200');

    // Mark the second item as Completed via PUT /api/work/:id
    console.log('--- Step 4: Mark second item as Completed via PUT /api/work/:id ---');
    const putRes = await fetch(`${baseUrl}/api/work/${completedWorkId}`, {
      method: 'PUT',
      headers: authHeader,
      body: JSON.stringify({
        date: testDate,
        time: '11:30 AM',
        text: 'Scheduled UPS Battery Check',
        notes: '12V battery test',
        status: 'Completed',
      }),
    });
    assert.strictEqual(putRes.status, 200, 'PUT /api/work/:id should return 200');

    // Fetch bootstrap state as frontend does
    const bootRes = await fetch(`${baseUrl}/api/bootstrap`, { headers: authHeader });
    const bootJson = await bootRes.json();
    assert(bootJson.success, 'Bootstrap must succeed');
    const dbState = bootJson.data;

    // Verify Schedule Report filtering
    console.log('\n--- Step 5: Verify Schedule Report filtering ---');
    const scheduleRows = buildRows(dbState, 'schedule', testDate, testDate);
    const scheduleIds = scheduleRows.map((r) => r.rawId);

    assert(
      scheduleIds.includes(pendingWorkId),
      'Pending item MUST appear in Schedule Report'
    );
    assert(
      !scheduleIds.includes(completedWorkId),
      'Completed item MUST NOT appear in Schedule Report'
    );
    assert(
      !scheduleIds.includes(doneEndpointWorkId),
      'Item completed via /done MUST NOT appear in Schedule Report'
    );
    console.log('✓ Schedule Report contains only pending/active items, completed items excluded!');

    // Verify Work Report
    console.log('\n--- Step 6: Verify Work Report includes pending and completed without duplicates ---');
    const workRows = buildRows(dbState, 'work', testDate, testDate);
    const workRawIds = workRows.map((r) => r.rawId);

    assert(
      workRawIds.includes(pendingWorkId),
      'Pending work item must appear in Work Report'
    );
    assert(
      workRawIds.includes(completedWorkId),
      'Completed work item must appear in Work Report'
    );
    // For doneEndpointWorkId, it may be under rawId: historyId with workId or work item
    const hasDoneItemInWork = workRows.some(
      (r) => r.rawId === doneEndpointWorkId || r.activity.includes('Inverter Calibration')
    );
    assert(hasDoneItemInWork, 'Done endpoint work item must appear in Work Report');

    // Verify NO duplicates in Work Report
    const pendingMatches = workRows.filter((r) => r.rawId === pendingWorkId);
    assert.strictEqual(pendingMatches.length, 1, 'Pending item must appear exactly once in Work Report');
    const completedMatches = workRows.filter((r) => r.rawId === completedWorkId);
    assert.strictEqual(completedMatches.length, 1, 'Completed item must appear exactly once in Work Report');
    const doneMatches = workRows.filter((r) => r.activity.includes('Inverter Calibration'));
    assert.strictEqual(doneMatches.length, 1, 'Done item must appear exactly once in Work Report (no duplicates)');
    console.log('✓ Work Report includes completed and pending items with ZERO duplicates!');

    // Verify History Report
    console.log('\n--- Step 7: Verify History Report includes completed items and excludes pending ---');
    const historyRows = buildRows(dbState, 'history', testDate, testDate);
    const historyRawIds = historyRows.map((r) => r.rawId);

    assert(
      !historyRawIds.includes(pendingWorkId),
      'Pending item must NOT appear in History Report'
    );
    assert(
      historyRawIds.includes(completedWorkId),
      'Completed work item MUST appear in History Report'
    );
    const hasDoneItemInHistory = historyRows.some(
      (r) => r.rawId === doneEndpointWorkId || r.activity.includes('Inverter Calibration')
    );
    assert(hasDoneItemInHistory, 'Done endpoint item MUST appear in History Report');

    const histCompletedMatches = historyRows.filter((r) => r.rawId === completedWorkId);
    assert.strictEqual(histCompletedMatches.length, 1, 'Completed item must appear exactly once in History Report');
    const histDoneMatches = historyRows.filter((r) => r.activity.includes('Inverter Calibration'));
    assert.strictEqual(histDoneMatches.length, 1, 'Done item must appear exactly once in History Report (no duplicates)');
    console.log('✓ History Report correctly displays completed items without duplicates!');

    // Verify Date Filters
    console.log('\n--- Step 8: Verify Date Filtering ---');
    const emptyDateRows = buildRows(dbState, 'schedule', outsideDate, outsideDate);
    assert.strictEqual(
      emptyDateRows.filter((r) => r.rawId === pendingWorkId).length,
      0,
      'Pending item must NOT appear outside its date range'
    );
    console.log('✓ Date filters accurately isolate records by range!');

    // Verify DB Persistence: records are NOT deleted
    console.log('\n--- Step 9: Verify Database Persistence ---');
    const pInDb = await db.collection('work').findOne({ id: pendingWorkId });
    assert(pInDb, 'Pending record must remain in DB');
    assert.strictEqual(pInDb.status, 'Pending');

    const cInDb = await db.collection('work').findOne({ id: completedWorkId });
    assert(cInDb, 'Completed record must remain in DB');
    assert.strictEqual(cInDb.status, 'Completed');

    const dInDb = await db.collection('work').findOne({ id: doneEndpointWorkId });
    assert(dInDb, 'Done record must remain in DB');
    assert.strictEqual(dInDb.status, 'Completed');
    console.log('✓ Database persistence verified: no completed records deleted!');

    // Step 10: Toggle status from Completed back to Pending
    console.log('\n--- Step 10: Toggle status back to Pending ---');
    await fetch(`${baseUrl}/api/work/${completedWorkId}`, {
      method: 'PUT',
      headers: authHeader,
      body: JSON.stringify({
        date: testDate,
        time: '11:30 AM',
        text: 'Scheduled UPS Battery Check',
        notes: '12V battery test',
        status: 'Pending',
      }),
    });
    const updatedBootRes = await fetch(`${baseUrl}/api/bootstrap`, { headers: authHeader });
    const updatedBootJson = await updatedBootRes.json();
    const updatedSchedule = buildRows(updatedBootJson.data, 'schedule', testDate, testDate);
    assert(
      updatedSchedule.some((r) => r.rawId === completedWorkId),
      'Re-opened pending item must reappear in Schedule Report'
    );
    console.log('✓ Status transition back to Pending verified!');

    // Clean up test data
    console.log('\n--- Cleaning up test records ---');
    await db.collection('work').deleteMany({
      id: { $in: [pendingWorkId, completedWorkId, doneEndpointWorkId] },
    });
    await db.collection('history').deleteMany({
      $or: [
        { workId: { $in: [pendingWorkId, completedWorkId, doneEndpointWorkId] } },
        { id: { $in: [pendingWorkId, completedWorkId, doneEndpointWorkId] } },
      ],
    });

    console.log('\n🎉 ALL SCHEDULE REPORT FILTERING & STATUS HANDLING VERIFICATIONS PASSED!');
  } finally {
    server.close();
    await closeDatabase();
  }
}

runScheduleReportTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
