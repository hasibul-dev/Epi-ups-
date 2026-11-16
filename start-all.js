import { spawn } from 'child_process';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Service configuration
const SERVICES = [
  {
    name: 'CENTRAL-ADMIN',
    dir: path.join(__dirname, 'epi-central-admin'),
    cmd: 'node',
    args: ['server/index.js'],
    port: 5050,
    color: '\x1b[36m', // Cyan
    url: 'http://localhost:5050',
  },
  {
    name: 'SALES-UI',
    dir: path.join(__dirname, 'epi-sales', 'EPI-UPS-Bangladesh-Limited'),
    cmd: 'npx',
    args: ['vite', '--port', '5173', '--host', '0.0.0.0'],
    port: 5173,
    color: '\x1b[94m', // Bright Blue
    url: 'http://localhost:5173',
  },
  {
    name: 'SERVICE-UI',
    dir: path.join(__dirname, 'epi-service'),
    cmd: 'npx',
    args: ['vite', '--port', '5174', '--host', '0.0.0.0'],
    port: 5174,
    color: '\x1b[32m', // Green
    url: 'http://localhost:5174',
  },
  {
    name: 'ACCOUNTS-API',
    dir: path.join(__dirname, 'epi-erp', 'server'),
    cmd: 'node',
    args: ['src/index.js'],
    port: 5000,
    color: '\x1b[33m', // Yellow
    url: 'http://localhost:5000',
  },
  {
    name: 'ACCOUNTS-UI',
    dir: path.join(__dirname, 'epi-erp'),
    cmd: 'npx',
    args: ['vite', '--port', '5175', '--host', '0.0.0.0'],
    port: 5175,
    color: '\x1b[93m', // Bright Yellow
    url: 'http://localhost:5175',
  },
];

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';

// Port probe
function checkPort(port) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false); // Port is in use
      } else {
        resolve(true);
      }
    });
    s.once('listening', () => {
      s.close();
      resolve(true); // Port is free
    });
    s.listen(port, '0.0.0.0');
  });
}

const runningChildren = [];

function cleanup() {
  console.log(`\n${RED}[Shutdown] Terminating all EPI services cleanly...${RESET}`);
  for (const child of runningChildren) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(child.pid), '/f', '/t']);
      } else {
        child.kill('SIGTERM');
      }
    } catch (_) {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

async function startOrchestrator() {
  console.log(`\n${BOLD}========================================================================${RESET}`);
  console.log(`${BOLD}  EPI CENTRALIZED MANAGEMENT SYSTEM — LOCAL ORCHESTRATOR${RESET}`);
  console.log(`${BOLD}========================================================================${RESET}\n`);

  console.log('[Pre-Flight] Checking port availability:');
  const portIssues = [];

  for (const svc of SERVICES) {
    const isFree = await checkPort(svc.port);
    if (!isFree) {
      console.log(`  • Port ${svc.port} (${svc.name}): ${RED}IN USE (May already be running)${RESET}`);
      portIssues.push(svc);
    } else {
      console.log(`  • Port ${svc.port} (${svc.name}): ${GREEN}AVAILABLE${RESET}`);
    }
  }

  console.log(`\n[Startup] Spawning ${SERVICES.length} interconnected services...\n`);

  for (const svc of SERVICES) {
    // If port is already in use, don't spawn duplicate
    const isFree = await checkPort(svc.port);
    if (!isFree) {
      console.log(`${svc.color}[${svc.name}]${RESET} Already running on port ${svc.port}. Reusing active service.`);
      continue;
    }

    const child = spawn(svc.cmd, svc.args, {
      cwd: svc.dir,
      shell: true,
      env: {
        ...process.env,
        PORT: String(svc.port),
        JWT_SECRET: 'epi_central_management_system_secure_jwt_secret_2026_bd',
        CENTRAL_JWT_SECRET: 'epi_central_management_system_secure_jwt_secret_2026_bd',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (d) => {
      const lines = d.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          console.log(`${svc.color}[${svc.name}]${RESET} ${line.trim()}`);
        }
      }
    });

    child.stderr.on('data', (d) => {
      const lines = d.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          console.error(`${svc.color}[${svc.name}]${RESET} ${line.trim()}`);
        }
      }
    });

    child.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.warn(`${svc.color}[${svc.name}]${RESET} Process exited with code ${code}`);
      }
    });

    runningChildren.push(child);
  }

  // Display master system status after short delay
  setTimeout(() => {
    console.log(`\n${BOLD}========================================================================${RESET}`);
    console.log(`${BOLD}  EPI CENTRALIZED SYSTEM IS READY & LISTENING LOCALLY${RESET}`);
    console.log(`${BOLD}========================================================================${RESET}`);
    console.log(`  ► ${BOLD}EPI CENTRAL ADMIN PORTAL:${RESET}   \x1b[36mhttp://localhost:5050${RESET}`);
    console.log(`  ► ${BOLD}EPI Sales Department:${RESET}       \x1b[34mhttp://localhost:5173${RESET}  (Local Storage: IndexedDB)`);
    console.log(`  ► ${BOLD}EPI Service Department:${RESET}     \x1b[32mhttp://localhost:5174${RESET}`);
    console.log(`  ► ${BOLD}EPI Accounts Department:${RESET}    \x1b[33mhttp://localhost:5175${RESET}  (API on :5000)`);
    console.log(`${BOLD}========================================================================${RESET}`);
    console.log(`Press Ctrl+C to terminate all services.\n`);
  }, 4000);
}

startOrchestrator().catch((err) => {
  console.error('[Orchestrator Fatal]', err);
  cleanup();
});
