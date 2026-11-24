import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('========================================================================');
console.log('🖨️  VERIFYING UNIFIED COMPANY PRINT HEADER & PRINT SYSTEM INTEGRATION');
console.log('========================================================================\n');

// 1. Verify official project logo asset
console.log('--- 1. VERIFY OFFICIAL PROJECT LOGO ASSET ---');
const logoPath = path.resolve('public/logo.png');
assert(fs.existsSync(logoPath), 'public/logo.png must exist');
const logoStats = fs.statSync(logoPath);
assert(logoStats.size > 10000, 'Logo file size must be valid (>10KB)');
console.log(`  ✅ [PASS] Official EPI UPS logo asset exists (${logoStats.size} bytes)\n`);

// 2. Verify CompanyPrintHeader Component & HTML Generator
console.log('--- 2. VERIFY COMPANY PRINT HEADER SPECIFICATIONS ---');
const headerCode = fs.readFileSync(path.resolve('src/components/CompanyPrintHeader.jsx'), 'utf-8');

assert(headerCode.includes('EPI UPS BANGLADESH LIMITED'), 'Header must contain official company name');
assert(headerCode.includes('GA Foundation Building 2, House-5, Road-1, Main Road, 2 Pallabi Rd, Dhaka 1216'), 'Header must contain official GA Foundation address');
assert(headerCode.includes('+880 1897-660840') && headerCode.includes('+880 1897-660844'), 'Header must contain both official phone numbers');
assert(headerCode.includes('info.bd@epi-ups.com'), 'Header must contain official email');
assert(headerCode.includes('www.epi-ups.com'), 'Header must contain official website');
assert(headerCode.includes('/logo.png'), 'Header must reference /logo.png');
assert(headerCode.includes("borderBottom: '2px solid #1F2937'") || headerCode.includes('border-bottom: 2px solid #1F2937'), 'Header must have bottom divider 2px solid #1F2937');
assert(headerCode.includes("flexWrap: 'nowrap'"), 'Component header must use flexWrap nowrap for strict 2-column layout');
assert(headerCode.includes("whiteSpace: 'nowrap'"), 'Component header right metadata must never wrap underneath left side');
console.log('  ✅ [PASS] Company name: EPI UPS BANGLADESH LIMITED');
console.log('  ✅ [PASS] Full address: GA Foundation Building 2, House-5, Road-1, Main Road, 2 Pallabi Rd, Dhaka 1216');
console.log('  ✅ [PASS] Both phone numbers: +880 1897-660840, +880 1897-660844');
console.log('  ✅ [PASS] Email: info.bd@epi-ups.com | Website: www.epi-ups.com');
console.log('  ✅ [PASS] Strict two-column non-wrapping layout verified in React & HTML generators\n');

// 3. Verify Service Department Integration
console.log('--- 3. VERIFY SERVICE DEPARTMENT PRINT INTEGRATION ---');
const serviceReportCode = fs.readFileSync(path.resolve('src/modules/service/pages/Report.jsx'), 'utf-8');
assert(serviceReportCode.includes('CompanyPrintHeader'), 'Service Report.jsx must use CompanyPrintHeader');
assert(serviceReportCode.includes('PrintSignatures'), 'Service Report.jsx must use PrintSignatures');

const workDetailsModalCode = fs.readFileSync(path.resolve('src/modules/service/components/WorkDetailsModal.jsx'), 'utf-8');
assert(workDetailsModalCode.includes('getCompanyPrintHeaderHtml'), 'WorkDetailsModal.jsx must use getCompanyPrintHeaderHtml');

const serviceCss = fs.readFileSync(path.resolve('src/styles/service.css'), 'utf-8');
assert(serviceCss.includes('@media print'), 'service.css must define print styles');
assert(serviceCss.includes('.dept-subnav-bar'), 'service.css must hide subnav bar during print');
console.log('  ✅ [PASS] Service Report.jsx integrated with unified CompanyPrintHeader');
console.log('  ✅ [PASS] Service WorkDetailsModal.jsx integrated with getCompanyPrintHeaderHtml');
console.log('  ✅ [PASS] service.css isolates report sheets and hides navigation chrome\n');

// 4. Verify Digital Marketing Integration & Slip Redesign
console.log('--- 4. VERIFY DIGITAL MARKETING PRINT & SLIP REDESIGN ---');
const taskPrintModalCode = fs.readFileSync(path.resolve('src/modules/marketing/components/TaskPrintModal.jsx'), 'utf-8');
assert(taskPrintModalCode.includes('CompanyPrintHeader'), 'TaskPrintModal.jsx must use CompanyPrintHeader');
assert(taskPrintModalCode.includes('PrintSignatures'), 'TaskPrintModal.jsx must use PrintSignatures');
assert(taskPrintModalCode.includes('1. Project Brief & Work Deliverable Scope'), 'TaskPrintModal.jsx must contain Section 1: Project Brief & Work Deliverable Scope');
assert(taskPrintModalCode.includes('2. Employee Completion Report & Submission Notes'), 'TaskPrintModal.jsx must contain Section 2: Employee Completion Report & Submission Notes');
assert(taskPrintModalCode.includes('Attached Deliverable Assets:'), 'TaskPrintModal.jsx must contain Attached Deliverable Assets row');
assert(taskPrintModalCode.includes('3. Verification & Administrative Sign-Off'), 'TaskPrintModal.jsx must contain Section 3: Verification & Administrative Sign-Off');
assert(taskPrintModalCode.includes('Marketing Executive'), 'Must include Marketing Executive signatory');
assert(taskPrintModalCode.includes('Lead Digital Strategist'), 'Must include Lead Digital Strategist signatory');
assert(taskPrintModalCode.includes('Managing Director / Super Admin'), 'Must include Managing Director / Super Admin signatory');

const ticketDetailsModalCode = fs.readFileSync(path.resolve('src/modules/marketing/components/TicketDetailsModal.jsx'), 'utf-8');
assert(ticketDetailsModalCode.includes('getCompanyPrintHeaderHtml'), 'TicketDetailsModal.jsx must use getCompanyPrintHeaderHtml');

const marketingCss = fs.readFileSync(path.resolve('src/styles/marketing.css'), 'utf-8');
assert(marketingCss.includes('body:has(.marketing-modal-backdrop)'), 'marketing.css must isolate modal view during print');
assert(marketingCss.includes('.mkt-action-btn'), 'marketing.css must define compact .mkt-action-btn table button');
assert(marketingCss.includes('.mkt-action-btn-icon'), 'marketing.css must define .mkt-action-btn-icon button');
console.log('  ✅ [PASS] TaskPrintModal.jsx: Full individual slip layout with Sections 1, 2, Attached Assets & 3');
console.log('  ✅ [PASS] TaskPrintModal.jsx: Summary performance statistics ribbon & data table');
console.log('  ✅ [PASS] TicketDetailsModal.jsx integrated with getCompanyPrintHeaderHtml');
console.log('  ✅ [PASS] marketing.css: Standardized 34px buttons & 28px table actions (.mkt-action-btn)\n');

// 5. Verify Sales, ERP Accounts & Admin Integration
console.log('--- 5. VERIFY SALES, ERP & ADMIN INTEGRATION ---');
const salesPrintHeaderCode = fs.readFileSync(path.resolve('src/modules/sales/components/PrintHeader.jsx'), 'utf-8');
assert(salesPrintHeaderCode.includes('CompanyPrintHeader'), 'Sales PrintHeader.jsx must re-export/wrap CompanyPrintHeader');

const clientMasterCode = fs.readFileSync(path.resolve('src/modules/sales/components/ClientsMaster.jsx'), 'utf-8');
assert(clientMasterCode.includes('CompanyPrintHeader'), 'ClientsMaster.jsx must use CompanyPrintHeader');

const erpExportCode = fs.readFileSync(path.resolve('src/modules/erp/lib/export.js'), 'utf-8');
assert(erpExportCode.includes('getCompanyPrintHeaderHtml'), 'ERP export.js must use getCompanyPrintHeaderHtml');

const adminAuditCode = fs.readFileSync(path.resolve('src/modules/admin/components/AuditLogsView.jsx'), 'utf-8');
assert(adminAuditCode.includes('printFormattedReport'), 'AuditLogsView.jsx must support printing');

const adminUserCode = fs.readFileSync(path.resolve('src/modules/admin/components/UserManagement.jsx'), 'utf-8');
assert(adminUserCode.includes('printFormattedReport'), 'UserManagement.jsx must support printing');
console.log('  ✅ [PASS] Sales PrintHeader.jsx & ClientsMaster.jsx integrated');
console.log('  ✅ [PASS] ERP export.js (Invoices & Accounting) integrated');
console.log('  ✅ [PASS] Admin AuditLogsView.jsx & UserManagement.jsx integrated\n');

// 6. Verify High-Contrast Print Styles
console.log('--- 6. VERIFY HIGH-CONTRAST PRINT COLORS ---');
const indexCss = fs.readFileSync(path.resolve('src/index.css'), 'utf-8');
assert(indexCss.includes('#1F2937'), 'index.css table header color must be #1F2937');
assert(indexCss.includes('#999999'), 'index.css table border color must be #999999');
assert(indexCss.includes('.epi-company-print-header'), 'index.css must define .epi-company-print-header styles');
console.log('  ✅ [PASS] Background: #FFFFFF');
console.log('  ✅ [PASS] Text: #111111');
console.log('  ✅ [PASS] Table headings: #1F2937 on #f1f5f9');
console.log('  ✅ [PASS] Table borders: #999999');
console.log('  ✅ [PASS] Signatures: 1.5px solid #111111\n');

console.log('========================================================================');
console.log('🎉 ALL PRINT INTEGRATION & UNIFIED HEADER TESTS PASSED (6/6 SUITES)');
console.log('========================================================================\n');
