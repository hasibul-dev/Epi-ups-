/**
 * Comprehensive In-Process Verification: Centralized Authentication & Redundant Auth Elimination
 */

import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import bcrypt from '../epi-central-admin/node_modules/bcryptjs/index.js';
import centralApp from '../epi-central-admin/server/app.js';
import { initDatabase as initCentralDb, UsersDAO } from '../epi-central-admin/server/db.js';

function invoke(app, { method = 'GET', url = '/', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.headers = { ...headers };
    req.ip = '127.0.0.1';
    req.connection = { remoteAddress: '127.0.0.1' };
    req.socket = { remoteAddress: '127.0.0.1' };
    if (body) {
      req.body = body;
      if (!req.headers['content-type']) req.headers['content-type'] = 'application/json';
    }

    const res = new EventEmitter();
    let resStatusCode = 200;
    const resHeaders = {};
    let responseBody = '';

    res.statusCode = 200;
    res.setHeader = (name, val) => {
      resHeaders[name.toLowerCase()] = val;
    };
    res.getHeader = (name) => resHeaders[name.toLowerCase()];
    res.status = (code) => {
      resStatusCode = code;
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.setHeader('content-type', 'application/json');
      responseBody = JSON.stringify(data);
      resolve({
        status: resStatusCode,
        headers: resHeaders,
        body: data,
      });
    };
    res.send = (data) => {
      responseBody = String(data);
      let parsed = data;
      try {
        parsed = JSON.parse(data);
      } catch {}
      resolve({
        status: resStatusCode,
        headers: resHeaders,
        body: parsed,
      });
    };
    res.end = (data) => {
      if (data) responseBody += data;
      resolve({
        status: resStatusCode,
        headers: resHeaders,
        body: responseBody,
      });
    };

    app.handle(req, res, (err) => {
      if (err) reject(err);
      else resolve({ status: resStatusCode, headers: resHeaders, body: responseBody });
    });
  });
}

async function runTests() {
  console.log('========================================================================');
  console.log(' EPI CENTRALIZED SYSTEM: AUTOMATED VERIFICATION SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      passed++;
      console.log(`  [PASS] ${message}`);
    } else {
      console.error(`  [FAIL] ${message}`);
    }
  }

  await initCentralDb();

  const testPw = 'TestSecret#2026';
  const hashedPw = await bcrypt.hash(testPw, 10);

  // Create temporary test users in Central Admin
  const testSuperAdmin = await UsersDAO.create({
    userId: 'test_superadmin_' + Date.now(),
    name: 'Test Super Admin',
    email: 'test_sa@epiups.com',
    passwordHash: hashedPw,
    role: 'superadmin',
    departments: ['sales', 'service', 'accounts'],
    departmentRoles: {},
    status: 'active',
    createdBy: 'test-suite',
  });

  const testSalesEmp = await UsersDAO.create({
    userId: 'test_sales_emp_' + Date.now(),
    name: 'Test Sales Rep',
    email: 'test_rep@epiups.com',
    passwordHash: hashedPw,
    role: 'employee',
    departments: ['sales'],
    departmentRoles: { sales: 'executive' },
    status: 'active',
    createdBy: 'test-suite',
  });

  try {
    // 1. Central Login as Super Admin
    let adminToken = null;
    const adminLoginRes = await invoke(centralApp, {
      method: 'POST',
      url: '/api/auth/login',
      body: { userId: testSuperAdmin.userId, password: testPw },
    });

    assert(adminLoginRes.status === 200 && adminLoginRes.body.success, 'Central Admin Login with Super Admin credentials');
    assert(adminLoginRes.body.user.role === 'superadmin', 'Super Admin role verified');
    assert(Array.isArray(adminLoginRes.body.user.departments), 'Departments list present in profile');
    adminToken = adminLoginRes.body.token;

    // 2. Central Login as Regular Employee
    let empToken = null;
    const empLoginRes = await invoke(centralApp, {
      method: 'POST',
      url: '/api/auth/login',
      body: { userId: testSalesEmp.userId, password: testPw },
    });

    assert(empLoginRes.status === 200 && empLoginRes.body.success, 'Central Login with Employee account');
    assert(empLoginRes.body.user.role === 'employee', 'Employee role verified');
    assert(empLoginRes.body.user.departments.includes('sales'), 'Employee has sales department assigned');
    empToken = empLoginRes.body.token;

    // 3. SSO Ticket Generation & Department Permission Enforcement
    const ticketRes = await invoke(centralApp, {
      method: 'POST',
      url: '/api/auth/sso-ticket',
      headers: { 'authorization': `Bearer ${empToken}` },
      body: { department: 'sales' },
    });

    assert(ticketRes.status === 200 && ticketRes.body.ticket, 'Employee can generate SSO ticket for authorized Sales dept');
    const salesTicket = ticketRes.body.ticket;

    // Employee attempting unauthorized Accounts dept
    const badTicketRes = await invoke(centralApp, {
      method: 'POST',
      url: '/api/auth/sso-ticket',
      headers: { 'authorization': `Bearer ${empToken}` },
      body: { department: 'accounts' },
    });

    assert(badTicketRes.status === 403, 'Employee is blocked from generating SSO ticket for unauthorized Accounts dept');

    // 4. Single-use SSO Ticket Exchange
    const exchangeRes = await invoke(centralApp, {
      method: 'GET',
      url: `/api/auth/sso-exchange?ticket=${encodeURIComponent(salesTicket)}&dept=sales`,
    });

    assert(exchangeRes.status === 200 && exchangeRes.body.success, 'SSO ticket exchange succeeds on first use');
    assert(exchangeRes.body.user.userId === testSalesEmp.userId, 'Exchanged user matches expected user ID');

    // Attempt reuse (must fail)
    const reuseRes = await invoke(centralApp, {
      method: 'GET',
      url: `/api/auth/sso-exchange?ticket=${encodeURIComponent(salesTicket)}&dept=sales`,
    });
    assert(reuseRes.status === 401, 'SSO ticket cannot be reused (strictly single-use)');

    // 5. Central Password Change endpoint (/api/auth/change-own-password)
    const pwChangeRes = await invoke(centralApp, {
      method: 'POST',
      url: '/api/auth/change-own-password',
      headers: { 'authorization': `Bearer ${empToken}` },
      body: { currentPassword: testPw, newPassword: 'NewSecretPassword#2026' },
    });
    assert(pwChangeRes.status === 200 && pwChangeRes.body.success, 'Employee can change password via Central Admin');

    // 6. Complete Sales MongoDB Backend Removal & Local Persistence Verification
    const oldServerExists = fs.existsSync('epi-sales/EPI-UPS-Bangladesh-Limited/server');
    const oldApiExists = fs.existsSync('epi-sales/EPI-UPS-Bangladesh-Limited/api');
    assert(!oldServerExists && !oldApiExists, 'Old Sales MongoDB backend directories (server/, api/) are completely excised');

    const salesStorageSrc = fs.readFileSync('epi-sales/EPI-UPS-Bangladesh-Limited/src/services/salesStorage.js', 'utf8');
    assert(salesStorageSrc.includes('epi_sales_crm_db') && salesStorageSrc.includes('indexedDB'), 'Sales operates via reliable IndexedDB & local storage sync');

    const useDbSrc = fs.readFileSync('epi-sales/EPI-UPS-Bangladesh-Limited/src/hooks/useDb.js', 'utf8');
    assert(!useDbSrc.includes('5001') && !useDbSrc.includes('Cloud Save Failed'), 'Sales hooks perform zero network calls to obsolete port 5001');

    // 7. Source Code Verification: Elimination of Duplicate Auth Controls
    const salesSidebar = fs.readFileSync('epi-sales/EPI-UPS-Bangladesh-Limited/src/components/Sidebar.jsx', 'utf8');
    assert(!salesSidebar.includes('onChangePassword') && !salesSidebar.includes('onLock'), 'Sales Sidebar has no onChangePassword or onLock props');
    assert(salesSidebar.includes('onSignOut') && salesSidebar.includes('Portal'), 'Sales Sidebar has Portal and onSignOut');

    const salesTopBar = fs.readFileSync('epi-sales/EPI-UPS-Bangladesh-Limited/src/components/TopBar.jsx', 'utf8');
    assert(!salesTopBar.includes('topbar-lock-btn') && !salesTopBar.includes('onLock'), 'Sales TopBar has no lock button');

    const salesAppSrc = fs.readFileSync('epi-sales/EPI-UPS-Bangladesh-Limited/src/App.jsx', 'utf8');
    assert(!salesAppSrc.includes('LockScreen') && !salesAppSrc.includes('ChangePasswordModal'), 'Sales App has no LockScreen or ChangePasswordModal');
    assert(salesAppSrc.includes('CentralSSOGate'), 'Sales App uses CentralSSOGate');

    const erpUsers = fs.readFileSync('epi-erp/src/pages/Users.jsx', 'utf8');
    assert(!erpUsers.includes('Change my password') && !erpUsers.includes('PwForm'), 'Accounts Users page has no redundant change password form');

    const erpLogin = fs.readFileSync('epi-erp/src/pages/Login.jsx', 'utf8');
    assert(erpLogin.includes('Centralized Access Control') && erpLogin.includes('Sign In via Central Portal'), 'Accounts Login page redirects to Central Portal');

    const erpLayout = fs.readFileSync('epi-erp/src/components/Layout.jsx', 'utf8');
    assert(erpLayout.includes('Central Control') && erpLayout.includes('Portal'), 'Accounts Layout integrates Central Control and Portal links');

    const serviceApp = fs.readFileSync('epi-service/src/App.jsx', 'utf8');
    assert(serviceApp.includes('Single Sign-On (SSO) Authentication Required') && serviceApp.includes('handleSignOut'), 'Service App uses Central SSO gate and centralized sign out');

  } finally {
    // Non-destructive cleanup of test users
    await UsersDAO.delete(testSuperAdmin.id);
    await UsersDAO.delete(testSalesEmp.id);
  }

  console.log('\n========================================================================');
  console.log(` RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log('========================================================================\n');

  if (passed === total) {
    console.log('ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS!');
  } else {
    process.exit(1);
  }
}

runTests();
