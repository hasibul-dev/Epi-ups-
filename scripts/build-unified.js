import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('=== BUILDING EPI UNIFIED APPLICATION ===\n');
execSync('npm run build', {
  cwd: root,
  stdio: 'inherit',
});
console.log('\n=== BUILD FINISHED: Unified React + Express application compiled to /dist ===\n');
