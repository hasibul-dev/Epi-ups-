import assert from 'assert';
import http from 'http';
import app from '../server/app.js';
import { getDb, closeDatabase } from '../server/db.js';
import { today, addDays, getTaskCategory, compareTimes, formatTime12h, inRange } from '../src/utils/helpers.js';

const isCompleted = (status) => String(status || '').trim().toLowerCase() === 'completed';

// Exact directory logic from TodayWork.jsx
function processScheduledWorkDirectory(newWorkList, currentFilter = 'all') {
  const remainingWork = (newWorkList || []).filter((w) => !isCompleted(w.status));

  const categorized = remainingWork.map((w) => ({
    ...w,
    category: getTaskCategory(w.date, w.time, w.status),
  }));

  const activeCount = categorized.filter((w) => w.category === 'Active').length;
  const upcomingCount = categorized.filter((w) => w.category === 'Upcoming').length;
  const overdueCount = categorized.filter((w) => w.category === 'Overdue').length;

  const getRank = (cat) => {
    if (cat === 'Overdue') return 1;
    if (cat === 'Active') return 2;
    if (cat === 'Upcoming') return 3;
    return 4;
  };

  const validFilter = ['all', 'active', 'upcoming', 'overdue'].includes(currentFilter) ? currentFilter : 'all';

  const filtered = categorized
    .filter((w) => {
      if (validFilter === 'active') return w.category === 'Active';
      if (validFilter === 'upcoming') return w.category === 'Upcoming';
      if (validFilter === 'overdue') return w.category === 'Overdue';
      return true;
    })
    .sort((a, b) => {
      const rankA = getRank(a.category);
      const rankB = getRank(b.category);
      if (rankA !== rankB) return rankA - rankB;

      const dComp = (a.date || '').localeCompare(b.date || '');
      if (dComp !== 0) return dComp;

      return compareTimes(a.time, b.time);
    });

  return {
    remainingWork,
    categorized,
    counts: {
      all: categorized.length,
      active: activeCount,
      upcoming: upcomingCount,
      overdue: overdueCount,
    },
    filtered,
    validFilter,
  };
}

async function run() {
  console.log('================================================================');
  console.log('TEST SUITE: New Work -> Scheduled Work Directory Verifications');
  console.log('================================================================');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  const authHeader = {
    'Content-Type': 'application/json',
    'x-crm-auth': process.env.CRM_PASSWORD || 'rifat@660844',
  };

  const db = await getDb();
  assert(db, 'Database must be connected');

  const todayStr = today();
  const pastDate1 = addDays(todayStr, -3);
  const pastDate2 = addDays(todayStr, -1);
  const futureDate1 = addDays(todayStr, 1);
  const futureDate2 = addDays(todayStr, 4);

  const testIds = [];

  try {
    console.log('\n--- Test 1: Sorting: Overdue first, then Today, then Upcoming (Ascending by Date & Time) ---');
    
    // Create items directly in DB
    const items = [
      {
        id: 'test-nw-future-2',
        date: futureDate2,
        time: '10:00 AM',
        text: 'Upcoming task far',
        notes: 'Future 2',
        status: 'Pending',
      },
      {
        id: 'test-nw-past-2',
        date: pastDate2,
        time: '03:00 PM',
        text: 'Overdue task late yesterday',
        notes: 'Past 2',
        status: 'Pending',
      },
      {
        id: 'test-nw-today-2',
        date: todayStr,
        time: '11:59 PM',
        text: 'Today active task late',
        notes: 'Today 2',
        status: 'Pending',
      },
      {
        id: 'test-nw-past-1',
        date: pastDate1,
        time: '09:00 AM',
        text: 'Overdue task early 3 days ago',
        notes: 'Past 1',
        status: 'Pending',
      },
      {
        id: 'test-nw-today-1',
        date: todayStr,
        time: '11:00 PM',
        text: 'Today active task earlier',
        notes: 'Today 1',
        status: 'Pending',
      },
      {
        id: 'test-nw-future-1',
        date: futureDate1,
        time: '09:30 AM',
        text: 'Upcoming task tomorrow',
        notes: 'Future 1',
        status: 'Pending',
      },
    ];

    for (const it of items) {
      testIds.push(it.id);
      await db.collection('newWork').insertOne({ ...it, createdAt: new Date().toISOString() });
    }

    const dirState = processScheduledWorkDirectory(items, 'all');

    // Expected order:
    // 1. pastDate1 (09:00 AM) - Overdue
    // 2. pastDate2 (03:00 PM) - Overdue
    // 3. todayStr (11:00 PM) - Today (Active)
    // 4. todayStr (11:59 PM) - Today (Active)
    // 5. futureDate1 (09:30 AM) - Upcoming
    // 6. futureDate2 (10:00 AM) - Upcoming

    console.log('Resulting sorted items:');
    dirState.filtered.forEach((it, idx) => {
      console.log(`  ${idx + 1}. [${it.category}] ${it.date} ${it.time} - ${it.text}`);
    });

    assert.strictEqual(dirState.filtered[0].id, 'test-nw-past-1', 'Overdue 3 days ago should be 1st');
    assert.strictEqual(dirState.filtered[1].id, 'test-nw-past-2', 'Overdue yesterday should be 2nd');
    assert.strictEqual(dirState.filtered[2].id, 'test-nw-today-1', 'Today 11:00 PM should be 3rd');
    assert.strictEqual(dirState.filtered[3].id, 'test-nw-today-2', 'Today 11:59 PM should be 4th');
    assert.strictEqual(dirState.filtered[4].id, 'test-nw-future-1', 'Upcoming tomorrow should be 5th');
    assert.strictEqual(dirState.filtered[5].id, 'test-nw-future-2', 'Upcoming far future should be 6th');

    console.log('✓ PASS: Overdue first, then Today, then Upcoming; sorted ascending by date and time!');

    console.log('\n--- Test 2: Filters and Counts Verification ---');
    assert.strictEqual(dirState.counts.all, 6, 'All count must equal total remaining items');
    assert.strictEqual(dirState.counts.overdue, 2, 'Overdue count must be 2');
    assert.strictEqual(dirState.counts.active, 2, 'Active count must be 2');
    assert.strictEqual(dirState.counts.upcoming, 2, 'Upcoming count must be 2');

    const overdueView = processScheduledWorkDirectory(items, 'overdue');
    assert.strictEqual(overdueView.filtered.length, 2, 'Overdue filter must show 2 items');
    assert.strictEqual(overdueView.filtered[0].id, 'test-nw-past-1');

    const activeView = processScheduledWorkDirectory(items, 'active');
    assert.strictEqual(activeView.filtered.length, 2, 'Active filter must show 2 items');
    assert.strictEqual(activeView.filtered[0].id, 'test-nw-today-1');

    const upcomingView = processScheduledWorkDirectory(items, 'upcoming');
    assert.strictEqual(upcomingView.filtered.length, 2, 'Upcoming filter must show 2 items');
    assert.strictEqual(upcomingView.filtered[0].id, 'test-nw-future-1');

    console.log('✓ PASS: Active, Upcoming, Overdue filters and counts are completely accurate!');

    console.log('\n--- Test 3: Mark Item Completed via /done endpoint ---');
    const targetDoneId = 'test-nw-today-1';
    const doneRes = await fetch(`${baseUrl}/api/new-work/${targetDoneId}/done`, {
      method: 'POST',
      headers: authHeader,
    });
    const doneJson = await doneRes.json();
    assert(doneJson.success, 'done endpoint returned success');

    // 1. Verify record is NOT deleted from newWork in DB
    const itemInDb = await db.collection('newWork').findOne({ id: targetDoneId });
    assert(itemInDb, 'Record must NOT be deleted from newWork collection in database');
    assert.strictEqual(itemInDb.status, 'Completed', 'Record status in DB must be Completed');

    // 2. Verify record exists in history collection in DB
    const historyEntry = await db.collection('history').findOne({ newWorkId: targetDoneId });
    assert(historyEntry, 'Record must exist in history collection');
    assert.strictEqual(historyEntry.status, 'Completed');
    assert.strictEqual(historyEntry.text, 'Today active task earlier');

    console.log('✓ PASS: Record not deleted from DB, status marked Completed and saved to history!');

    console.log('\n--- Test 4: Verify Completed item is hidden immediately from Scheduled Work Directory ---');
    // Fetch refreshed newWork from bootstrap
    const bootRes = await fetch(`${baseUrl}/api/bootstrap`, { headers: authHeader });
    const bootJson = await bootRes.json();
    const currentNewWork = bootJson.data.newWork.filter((w) => testIds.includes(w.id));

    const refreshedDir = processScheduledWorkDirectory(currentNewWork, 'all');
    assert.strictEqual(refreshedDir.counts.all, 5, 'All count must exclude completed item (now 5)');
    assert.strictEqual(refreshedDir.counts.active, 1, 'Active count must decrease from 2 to 1');
    const hasCompletedInDir = refreshedDir.filtered.some((w) => w.id === targetDoneId);
    assert(!hasCompletedInDir, 'Completed item must NOT appear in Scheduled Work Directory');

    // Check all filters
    ['all', 'active', 'upcoming', 'overdue'].forEach((f) => {
      const view = processScheduledWorkDirectory(currentNewWork, f);
      assert(!view.filtered.some((w) => w.id === targetDoneId), `Completed item must be hidden in ${f} filter`);
    });

    console.log('✓ PASS: Completed item is hidden from directory, all filters, and all counts!');

    console.log('\n--- Test 5: Verify Completed work is preserved in Work Report and History Report ---');
    const allHistory = bootJson.data.history;
    const historyMatches = allHistory.filter((h) => h.newWorkId === targetDoneId || h.id === targetDoneId);
    assert(historyMatches.length >= 1, 'Completed work must be present in history for History Report');
    assert.strictEqual(historyMatches[0].text, 'Today active task earlier');
    assert.strictEqual(historyMatches[0].status, 'Completed');

    console.log('✓ PASS: Completed work preserved in Work Report and History Report with full details!');

    console.log('\n--- Test 6: Edit Completed Work preserves Completed status ---');
    // PUT /api/new-work/:id with only text and notes edited (no status passed or status not Pending)
    const editRes = await fetch(`${baseUrl}/api/new-work/${targetDoneId}`, {
      method: 'PUT',
      headers: authHeader,
      body: JSON.stringify({
        text: 'Today active task edited description',
        notes: 'Updated notes after completion',
      }),
    });
    const editJson = await editRes.json();
    assert(editJson.success, 'Edit must succeed');

    const afterEditItem = await db.collection('newWork').findOne({ id: targetDoneId });
    assert.strictEqual(afterEditItem.status, 'Completed', 'Status must remain Completed after editing');
    assert.strictEqual(afterEditItem.text, 'Today active task edited description');

    // Verify linked history was also updated
    const afterEditHist = await db.collection('history').findOne({ newWorkId: targetDoneId });
    assert.strictEqual(afterEditHist.text, 'Today active task edited description');
    assert.strictEqual(afterEditHist.status, 'Completed');

    console.log('✓ PASS: Editing completed work preserves Completed status!');

    console.log('\n--- Test 7: Explicitly changing status to Pending restores it to Scheduled Directory ---');
    const revertRes = await fetch(`${baseUrl}/api/new-work/${targetDoneId}`, {
      method: 'PUT',
      headers: authHeader,
      body: JSON.stringify({
        status: 'Pending',
      }),
    });
    const revertJson = await revertRes.json();
    assert(revertJson.success, 'Revert must succeed');

    const revertedItem = await db.collection('newWork').findOne({ id: targetDoneId });
    assert.strictEqual(revertedItem.status, 'Pending', 'Status changed back to Pending');

    const bootAfterRevert = await (await fetch(`${baseUrl}/api/bootstrap`, { headers: authHeader })).json();
    const testItemsAfterRevert = bootAfterRevert.data.newWork.filter((w) => testIds.includes(w.id));
    const revertedDir = processScheduledWorkDirectory(testItemsAfterRevert, 'all');

    assert.strictEqual(revertedDir.counts.all, 6, 'All count increases back to 6');
    assert(revertedDir.filtered.some((w) => w.id === targetDoneId), 'Item reappears in Scheduled Work Directory');

    console.log('✓ PASS: Explicit change to Pending correctly restores item to Scheduled Work Directory!');

  } finally {
    // Clean up
    console.log('\n--- Cleaning up test records ---');
    for (const id of testIds) {
      await db.collection('newWork').deleteOne({ id });
      await db.collection('history').deleteMany({ $or: [{ newWorkId: id }, { id }] });
    }
    console.log('✓ Test cleanup complete.');
    server.close();
    await closeDatabase();
  }

  console.log('\n🎉 ALL SCHEDULED WORK DIRECTORY TESTS PASSED SUCCESSFULLY!\n');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
