/**
 * Automated Verification: Fixed Header & Left Sidebar Layout Across All Modules
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('========================================================================');
console.log('📐 VERIFYING FIXED HEADER & LEFT SIDEBAR LAYOUT INTEGRATION');
console.log('========================================================================\n');

const cssPath = path.resolve('src/index.css');
const layoutPath = path.resolve('src/components/Layout.jsx');

const css = fs.readFileSync(cssPath, 'utf8');
const layout = fs.readFileSync(layoutPath, 'utf8');

// --- 1. Topbar Fixed Positioning ---
console.log('--- 1. Topbar Fixed Positioning at Top ---');
assert.ok(css.includes('.topbar'), 'Contains .topbar styles');
assert.ok(/position:\s*fixed/i.test(css), 'Contains position: fixed');
const topbarMatch = css.match(/\.topbar\s*\{[^}]*position:\s*fixed[^}]*\}/s);
assert.ok(topbarMatch, '.topbar is declared with position: fixed');
assert.ok(topbarMatch[0].includes('top: 0'), '.topbar pinned to top: 0');
assert.ok(topbarMatch[0].includes('z-index: 100'), '.topbar has high z-index (100)');
console.log('  ✅ [PASS] Header is fixed to the top across the application');

// --- 2. Sidebar Fixed Directly Below Header ---
console.log('\n--- 2. Left Sidebar Fixed Directly Below Header ---');
assert.ok(css.includes('.app-sidebar'), 'Contains .app-sidebar styles');
assert.ok(/top:\s*64px/i.test(css), 'Sidebar pinned directly below 64px header');
assert.ok(/bottom:\s*0/i.test(css), 'Sidebar pinned to bottom: 0');
assert.ok(/height:\s*calc\(100vh\s*-\s*64px\)/i.test(css), 'Sidebar height constrained to viewport minus header');
console.log('  ✅ [PASS] Sidebar is pinned directly below the top header');

// --- 3. Sidebar Independent Scrolling If Taller Than Screen ---
console.log('\n--- 3. Sidebar Independent Scrollability ---');
assert.ok(/overflow-y:\s*auto/i.test(css), 'Sidebar/scroll area allows vertical scrolling');
assert.ok(css.includes('.sidebar-scroll'), 'Contains .sidebar-scroll area');
assert.ok(/overscroll-behavior:\s*contain/i.test(css), 'Prevents scroll chaining to main document');
console.log('  ✅ [PASS] Sidebar scrolls independently when content exceeds screen height');

// --- 4. Main Page Content Offsets (Prevent Hidden Content) ---
console.log('\n--- 4. Main Page Content Offsets to Prevent Overlap ---');
assert.ok(/margin-top:\s*64px/i.test(css), '.app-body-container has top offset matching header height');
assert.ok(/margin-left:\s*250px/i.test(css), '.app-main-viewport has left offset matching expanded sidebar');
assert.ok(/margin-left:\s*68px/i.test(css), '.app-main-viewport adjusts to 68px when sidebar is collapsed');
console.log('  ✅ [PASS] Main page content offsets prevent hiding behind header or sidebar');

// --- 5. Shared Layout Integration Across All Modules ---
console.log('\n--- 5. Shared Layout Wrapper Consistency ---');
assert.ok(layout.includes('className={`app-layout ${sidebarCollapsed ? \'sidebar-collapsed\' : \'\'}`'), 'Layout root reflects sidebar state');
assert.ok(layout.includes('className={`app-body-container ${sidebarCollapsed ? \'sidebar-collapsed\' : \'\'}`'), 'Body container reflects sidebar state');
assert.ok(layout.includes('className="app-main-viewport"'), 'Main viewport wrapper exists for all module routes');
console.log('  ✅ [PASS] Shared Layout.jsx propagates fixed structure to every module');

// --- 6. Mobile Responsiveness ---
console.log('\n--- 6. Mobile & Small Screen Breakpoints ---');
assert.ok(css.includes('@media (max-width: 900px)'), 'Contains 900px tablet/mobile breakpoint');
assert.ok(css.includes('@media (max-width: 480px)'), 'Contains 480px mobile breakpoint');
assert.ok(/margin-top:\s*58px/i.test(css), 'Offsets adjust for 58px header on mobile');
assert.ok(/margin-top:\s*54px/i.test(css), 'Offsets adjust for 54px header on small mobile');
console.log('  ✅ [PASS] Responsive media queries adapt fixed header and drawer offsets');

console.log('\n========================================================================');
console.log('🎉 ALL FIXED LAYOUT & SCROLL TESTS PASSED (6/6 SUITES)');
console.log('========================================================================\n');
