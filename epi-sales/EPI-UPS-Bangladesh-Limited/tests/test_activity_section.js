import assert from 'assert';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import TodayWork, { ActivitySection } from '../src/components/TodayWork.jsx';
import { today } from '../src/utils/helpers.js';

console.log('====================================================');
console.log('TEST SUITE: Activity Section & TodayWork Verification');
console.log('====================================================');

const d = today();

// Mock store for rendering TodayWork
const createMockStore = (workItems = [], clientItems = []) => ({
  db: {
    clients: clientItems,
    work: workItems,
    newWork: [],
    history: [],
    office: [],
  },
  doneActivity: (id) => console.log('Mock doneActivity called with:', id),
  doneFollow: (id) => console.log('Mock doneFollow called with:', id),
  updateClientNextDate: (id, date) => console.log('Mock updateClientNextDate:', id, date),
  saveEditRow: (source, id, payload) => console.log('Mock saveEditRow:', source, id, payload),
  deleteEditRow: (source, id) => console.log('Mock deleteEditRow:', source, id),
  addNewWork: () => {},
  doneNew: () => {},
  officeStatus: () => '',
  todayLog: () => null,
});

async function runTests() {
  // Test 1: Render TodayWork with empty state
  console.log('\n--- Test 1: Render TodayWork with empty state ---');
  const emptyStore = createMockStore([], []);
  
  let emptyHtml = '';
  assert.doesNotThrow(() => {
    emptyHtml = ReactDOMServer.renderToStaticMarkup(
      React.createElement(TodayWork, { store: emptyStore, setPage: () => {} })
    );
  }, 'TodayWork should render without crashing');

  assert(emptyHtml.includes('Today Work'), 'Must contain Today Work header');
  assert(emptyHtml.includes('Activity'), 'Must contain Activity tab');
  console.log('✓ PASS: TodayWork renders initial state smoothly without errors.');

  // Test 2: Direct React rendering of ActivitySection with 0 activities
  console.log('\n--- Test 2: Directly render ActivitySection with 0 activities ---');
  let emptyActivityHtml = '';
  assert.doesNotThrow(() => {
    emptyActivityHtml = ReactDOMServer.renderToStaticMarkup(
      React.createElement(ActivitySection, {
        db: emptyStore.db,
        onDoneActivity: emptyStore.doneActivity,
        onDoneFollow: emptyStore.doneFollow,
        onUpdateNextDate: emptyStore.updateClientNextDate,
        onSaveRow: emptyStore.saveEditRow,
        onDeleteRow: emptyStore.deleteEditRow,
      })
    );
  }, 'ActivitySection must render with 0 activities without crashing');

  assert(emptyActivityHtml.includes('Daily Activity (Manually Assigned Tasks)'), 'Must contain Daily Activity header');
  assert(emptyActivityHtml.includes('No manual activity recorded for today.'), 'Must contain empty message when acts is empty');
  assert(emptyActivityHtml.includes('Automatic Client Follow-up Tasks (Due Today)'), 'Must contain Due Today follow-up table');
  console.log('✓ PASS: ActivitySection with empty data renders successfully with zero errors.');

  // Test 3: Direct React rendering of ActivitySection with populated work activities
  console.log('\n--- Test 3: Directly render ActivitySection with populated activities ---');
  const mockWork = [
    {
      id: 'w-101',
      date: d,
      time: '10:00 AM',
      text: 'Routine Battery Maintenance Check',
      notes: 'Check backup battery cell voltages',
      status: 'Pending',
    },
    {
      id: 'w-102',
      date: d,
      time: '02:30 PM',
      text: 'UPS Inverter Calibration',
      notes: 'Load testing at customer site',
      status: 'Completed',
    },
  ];

  const mockClients = [
    {
      id: 'c-201',
      name: 'Rahim Textile Mills',
      company: 'Rahim Group',
      contact: '01711000000',
      nextDate: d,
      notes: 'Discuss annual maintenance contract',
      status: 'Pending',
    },
  ];

  const populatedStore = createMockStore(mockWork, mockClients);
  let populatedActivityHtml = '';
  assert.doesNotThrow(() => {
    populatedActivityHtml = ReactDOMServer.renderToStaticMarkup(
      React.createElement(ActivitySection, {
        db: populatedStore.db,
        onDoneActivity: populatedStore.doneActivity,
        onDoneFollow: populatedStore.doneFollow,
        onUpdateNextDate: populatedStore.updateClientNextDate,
        onSaveRow: populatedStore.saveEditRow,
        onDeleteRow: populatedStore.deleteEditRow,
      })
    );
  }, 'ActivitySection must render populated activities without crashing');

  assert(populatedActivityHtml.includes('Routine Battery Maintenance Check'), 'Must render active task description');
  assert(populatedActivityHtml.includes('UPS Inverter Calibration'), 'Must render completed task description');
  assert(populatedActivityHtml.includes('Rahim Textile Mills'), 'Must render due client name');
  assert(!populatedActivityHtml.includes('No manual activity recorded for today.'), 'Must NOT show empty message when acts are present');
  console.log('✓ PASS: ActivitySection renders multiple active & completed tasks plus due clients seamlessly.');

  // Test 4: Confirm Office In / Out buttons are absent from ActivitySection
  console.log('\n--- Test 4: Verify Office In/Out buttons are absent ---');
  assert(!emptyActivityHtml.includes('Office IN'), 'Office IN must be absent');
  assert(!emptyActivityHtml.includes('Office OUT'), 'Office OUT must be absent');
  assert(!emptyActivityHtml.includes('Edit Office In / Out'), 'Edit Office In / Out button must be absent');
  assert(!populatedActivityHtml.includes('Edit Office In / Out'), 'Edit Office In / Out button must be absent');
  console.log('✓ PASS: Office In/Out buttons, editors, and labels are completely absent.');

  // Test 5: End-to-end Backend API for Activity (work collection CRUD)
  console.log('\n--- Test 5: Backend API verification for Activity (work CRUD) ---');
  const app = (await import('../server/app.js')).default;
  const { getDb } = await import('../server/db.js');
  
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  const defaultPass = process.env.CRM_PASSWORD || 'rifat@660844';
  const authHeader = {
    'Content-Type': 'application/json',
    'x-crm-auth': defaultPass,
  };

  try {
    // 5.1 Create planned work activity
    const newAct = {
      date: d,
      time: '11:15 AM',
      text: 'Test Activity Maintenance Task',
      notes: 'Test Remarks Notes',
      status: 'Pending',
    };

    const addRes = await fetch(`${baseUrl}/api/work`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify(newAct),
    });
    assert([200, 201].includes(addRes.status), 'POST /api/work must return 200 or 201');
    const addData = await addRes.json();
    assert(addData.success, 'POST /api/work must return success: true');
    const actId = addData.work.id;
    console.log('✓ Created test activity item in database:', actId);

    // 5.2 Fetch bootstrap to ensure work is loaded
    const bootRes = await fetch(`${baseUrl}/api/bootstrap`, { headers: authHeader });
    assert.strictEqual(bootRes.status, 200);
    const bootData = await bootRes.json();
    const found = bootData.data.work.find((w) => w.id === actId);
    assert(found, 'Bootstrap must include created work activity');
    assert.strictEqual(found.text, 'Test Activity Maintenance Task');
    console.log('✓ Activity record verified in bootstrap query.');

    // 5.3 Update activity
    const updateRes = await fetch(`${baseUrl}/api/work/${actId}`, {
      method: 'PUT',
      headers: authHeader,
      body: JSON.stringify({
        date: d,
        time: '11:30 AM',
        text: 'Updated Maintenance Task',
        notes: 'Updated Remarks',
        status: 'Pending',
      }),
    });
    assert.strictEqual(updateRes.status, 200);
    const updateData = await updateRes.json();
    assert(updateData.success);
    assert.strictEqual(updateData.updates.time, '11:30 AM');
    console.log('✓ Activity record updated successfully.');

    // 5.4 Mark activity completed (/done endpoint)
    const doneRes = await fetch(`${baseUrl}/api/work/${actId}/done`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ date: d, time: '11:45 AM' }),
    });
    assert.strictEqual(doneRes.status, 200);
    const doneData = await doneRes.json();
    assert(doneData.success);
    console.log('✓ Activity marked as completed via /done endpoint.');

    // 5.5 Clean up test record
    const delRes = await fetch(`${baseUrl}/api/work/${actId}`, {
      method: 'DELETE',
      headers: authHeader,
    });
    assert.strictEqual(delRes.status, 200);
    
    // Also clean history record created by /done
    const db = await getDb();
    if (db) {
      await db.collection('history').deleteMany({ workId: actId });
      await db.collection('work').deleteOne({ id: actId });
    }
    console.log('✓ Test activity cleanup complete.');

    console.log('\n====================================================');
    console.log('🎉 ALL ACTIVITY SECTION TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');
    server.close(() => {
      process.exit(0);
    });
  } catch (err) {
    server.close(() => {
      console.error('\n❌ Test failed with error:', err);
      process.exit(1);
    });
  }
}

runTests();
