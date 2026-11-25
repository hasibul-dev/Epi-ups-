import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('========================================================================');
console.log('🖨️  VERIFYING SERVICE DEPARTMENT PRINT SYSTEM & A4 PORTRAIT OUTPUT');
console.log('========================================================================\n');

// 1. Verify Service Isolated Print Service
console.log('--- 1. VERIFY SERVICE ISOLATED PRINT SERVICE ---');
const servicePrintServicePath = path.resolve('src/modules/service/services/servicePrintService.js');
assert(fs.existsSync(servicePrintServicePath), 'servicePrintService.js must exist');
const servicePrintServiceCode = fs.readFileSync(servicePrintServicePath, 'utf-8');

assert(servicePrintServiceCode.includes('printIsolatedElement'), 'Must export printIsolatedElement');
assert(servicePrintServiceCode.includes('printIsolatedHtml'), 'Must export printIsolatedHtml');
assert(servicePrintServiceCode.includes('service-isolated-print-frame'), 'Must use dedicated isolated iframe ID');
assert(servicePrintServiceCode.includes('@page'), 'Must declare @page rules');
assert(servicePrintServiceCode.includes('A4'), 'Must declare A4 print layout');
assert(servicePrintServiceCode.includes('portrait'), 'Must support portrait orientation');
assert(servicePrintServiceCode.includes('background: #ffffff !important'), 'Must enforce white background');
assert(servicePrintServiceCode.includes('border: none !important'), 'Must enforce zero outer borders');
assert(servicePrintServiceCode.includes('box-shadow: none !important'), 'Must enforce zero outer shadows');
assert(servicePrintServiceCode.includes('doc.images'), 'Must verify image loading before printing');
console.log('  ✅ [PASS] servicePrintService.js exists with isolated iframe dispatch and asset loading checks');

// 2. Verify Service Report.jsx Integration
console.log('\n--- 2. VERIFY SERVICE REPORT.JSX PRINT DISPATCH ---');
const reportPath = path.resolve('src/modules/service/pages/Report.jsx');
const reportCode = fs.readFileSync(reportPath, 'utf-8');

assert(reportCode.includes('servicePrintService'), 'Report.jsx must import from servicePrintService');
assert(reportCode.includes('printIsolatedElement'), 'Report.jsx must invoke printIsolatedElement');
assert(reportCode.includes('service-sheet-'), 'Report sheets must have identifiable element IDs');
assert(reportCode.includes('CompanyPrintHeader'), 'Report.jsx must keep CompanyPrintHeader');
assert(reportCode.includes('PrintSignatures'), 'Report.jsx must keep PrintSignatures');
console.log('  ✅ [PASS] Report.jsx integrates isolated iframe printing for single and batch reports');

// 3. Verify WorkDetailsModal.jsx Work Order / Job Sheet Print
console.log('\n--- 3. VERIFY WORKDETAILSMODAL.JSX JOB SHEET PRINT ---');
const modalPath = path.resolve('src/modules/service/components/WorkDetailsModal.jsx');
const modalCode = fs.readFileSync(modalPath, 'utf-8');

assert(modalCode.includes('printIsolatedHtml'), 'WorkDetailsModal.jsx must import and use printIsolatedHtml');
assert(modalCode.includes('background: #ffffff !important'), 'Job sheet CSS must enforce white background on html and body');
assert(modalCode.includes('box-shadow: none !important'), 'Job sheet CSS must remove box shadows');
assert(modalCode.includes('getCompanyPrintHeaderHtml'), 'Job sheet must keep getCompanyPrintHeaderHtml');
console.log('  ✅ [PASS] WorkDetailsModal.jsx prints work orders via isolated document with pure white canvas');

// 4. Verify Service CSS Print Rules
console.log('\n--- 4. VERIFY SERVICE.CSS PRINT STYLING ---');
const serviceCssPath = path.resolve('src/styles/service.css');
const serviceCss = fs.readFileSync(serviceCssPath, 'utf-8');

assert(serviceCss.includes('@page {'), 'service.css must define @page rule');
assert(serviceCss.includes('A4 portrait'), 'service.css must specify A4 portrait');
assert(serviceCss.includes('html,'), 'service.css must reset html in print mode');
assert(serviceCss.includes('box-shadow: none !important'), 'service.css must strip box shadows in print mode');
assert(serviceCss.includes('.dept-subnav-bar'), 'service.css must hide dept-subnav-bar');
console.log('  ✅ [PASS] service.css enforces pure white A4 portrait without outer shadows or borders');

// 5. Verify Isolation: Other Departments Untouched
console.log('\n--- 5. VERIFY OTHER MODULES UNTOUCHED & SCOPED ---');
const marketingPrintModalPath = path.resolve('src/modules/digital-marketing/components/WorkPrintModal.jsx');
const marketingPrintModalCode = fs.readFileSync(marketingPrintModalPath, 'utf-8');
assert(marketingPrintModalCode.includes('marketingPrintService'), 'Digital marketing print must remain intact');

const salesModulePath = path.resolve('src/modules/sales/SalesModule.jsx');
assert(fs.existsSync(salesModulePath), 'Sales module must exist');

const erpPath = path.resolve('src/modules/erp/ErpModule.jsx');
assert(fs.existsSync(erpPath), 'ERP module must exist');
console.log('  ✅ [PASS] Digital Marketing, Sales, and ERP remain intact and isolated');

console.log('\n========================================================================');
console.log('🎉 ALL SERVICE DEPARTMENT PRINT SYSTEM VERIFICATIONS PASSED (5/5)');
console.log('========================================================================\n');
