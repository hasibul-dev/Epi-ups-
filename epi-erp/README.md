# EPI UPS Bangladesh Limited - ERP & Accounting

React (Vite) frontend + Node/Express + MongoDB (Mongoose) backend.

## Setup
1. `npm run install:all`
2. `cp server/.env.example server/.env` and paste your **MongoDB Atlas URI** and a long random `JWT_SECRET`.
3. `npm run seed` (creates the chart of accounts; optional admin from ADMIN_EMAIL/ADMIN_PASSWORD).
   If you skip the admin, the first visit shows a "Create administrator" screen.
4. Development: `npm run dev:server` and `npm run dev:client` -> http://localhost:5173
   Production: `npm run build && npm start` -> http://localhost:5000
5. Tests (accounting engine): `npm test`

## Design
- Every document (invoice, bill, receipt, payment, expense, payroll, depreciation, VAT, stock adjustment)
  posts a balanced journal entry. The server rejects any entry where Debit != Credit.
- Nothing is stored as a balance: dashboard, trial balance, P&L, balance sheet, cash flow, ledgers
  and ageing are computed from posted entries/documents.
- Voiding posts a reversing entry; originals stay for the audit trail.
- Roles: admin, accountant, manager, hr, store, auditor, enforced per module/action in `server/src/middleware/auth.js`.
- Exports: Excel, PDF, CSV and print on every table and report.

## Not yet verified
Automated tests cover the accounting engine (balance validation, VAT, payroll, depreciation,
statements, cash-flow reconciliation). The database-backed flows were not run end to end,
because MongoDB could not be installed in the build environment. Run through the checklist
in the hand-off notes against your Atlas database before going live.
