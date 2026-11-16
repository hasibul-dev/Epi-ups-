import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

console.log('=== BUILDING UNIFIED SINGLE-ORIGIN BROWSER-LOCAL ECOSYSTEM ===\n');

// 1. Clean dist
if (fs.existsSync(dist)) {
  fs.rmSync(dist, { recursive: true, force: true });
}
fs.mkdirSync(dist, { recursive: true });

// 2. Build Sales (/sales/)
console.log('1/4 Building EPI Sales Department (base: /sales/)...');
execSync('npm run build -- --base=/sales/ --outDir=../../dist/sales', {
  cwd: path.join(root, 'epi-sales', 'EPI-UPS-Bangladesh-Limited'),
  stdio: 'inherit',
});

// 3. Build Service (/service/)
console.log('\n2/4 Building EPI Service Department (base: /service/)...');
execSync('npm run build -- --base=/service/ --outDir=../dist/service', {
  cwd: path.join(root, 'epi-service'),
  stdio: 'inherit',
});

// 4. Build Accounts ERP (/accounts/)
console.log('\n3/4 Building EPI Accounts ERP Department (base: /accounts/)...');
execSync('npm run build -- --base=/accounts/ --outDir=../dist/accounts', {
  cwd: path.join(root, 'epi-erp'),
  stdio: 'inherit',
});

// 5. Build Central Admin (root /)
console.log('\n4/4 Building EPI Central Admin Portal (root /)...');
execSync('npm run build -- --outDir=../dist --emptyOutDir=false', {
  cwd: path.join(root, 'epi-central-admin'),
  stdio: 'inherit',
});

console.log('\n=== UNIFIED BUILD COMPLETE: All 4 departments compiled into /dist ===');
console.log('Ready for single-domain Vercel deployment with shared browser-local persistence!\n');
