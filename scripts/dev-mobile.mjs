import { spawn, spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');

const isWindows = process.platform === 'win32';
const forwardedArgs = process.argv.slice(2);

const HEALTH_CHECK_URL = 'http://127.0.0.1:8000/api/v1/health';
const MAX_HEALTH_ATTEMPTS = 60; // 30 seconds total (500ms intervals)
const HEALTH_POLL_INTERVAL_MS = 500;

let backendProcess = null;
let isCleaningUp = false;

function log(message) {
  console.log(`\x1b[36m[dev:mobile]\x1b[0m ${message}`);
}

function logError(message) {
  console.error(`\x1b[31m[dev:mobile]\x1b[0m ${message}`);
}

function logSuccess(message) {
  console.log(`\x1b[32m[dev:mobile]\x1b[0m ${message}`);
}

/**
 * Checks if the FastAPI backend is healthy and responding with HTTP 200.
 */
function checkBackendHealth() {
  return new Promise((resolveHealth) => {
    const req = http.get(HEALTH_CHECK_URL, (res) => {
      resolveHealth(res.statusCode === 200);
    });

    req.on('error', () => {
      resolveHealth(false);
    });

    req.setTimeout(1000, () => {
      req.destroy();
      resolveHealth(false);
    });
  });
}

/**
 * Gracefully terminates the backend process and its entire process tree.
 */
function cleanupBackend() {
  if (isCleaningUp) return;
  isCleaningUp = true;

  if (backendProcess && backendProcess.pid) {
    log('Membersihkan proses backend FastAPI...');
    try {
      if (isWindows) {
        spawnSync('taskkill', ['/F', '/T', '/PID', String(backendProcess.pid)], {
          stdio: 'ignore',
        });
      } else {
        process.kill(-backendProcess.pid, 'SIGTERM');
      }
    } catch {
      try {
        backendProcess.kill('SIGKILL');
      } catch {
        // Process might have already terminated
      }
    }
    backendProcess = null;
  }
}

// Register termination handlers
process.on('SIGINT', () => {
  cleanupBackend();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanupBackend();
  process.exit(0);
});

process.on('exit', () => {
  cleanupBackend();
});

process.on('uncaughtException', (err) => {
  logError(`Uncaught exception: ${err.message}`);
  cleanupBackend();
  process.exit(1);
});

async function main() {
  log('Memeriksa status backend FastAPI...');

  // Check if backend is already running and healthy
  const alreadyHealthy = await checkBackendHealth();
  if (alreadyHealthy) {
    logSuccess('Backend FastAPI sudah aktif dan sehat di port 8000.');
  } else {
    log('Menjalankan backend FastAPI (uvicorn di port 8000)...');
    
    const apiCwd = resolve(repoRoot, 'apps/api');
    backendProcess = spawn(
      isWindows ? 'uv.exe' : 'uv',
      ['run', 'uvicorn', 'app.main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'],
      {
        cwd: apiCwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: isWindows,
        detached: !isWindows,
      }
    );

    // Forward backend error output if backend fails early
    backendProcess.stderr.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('ERROR') || msg.includes('Address already in use')) {
        process.stderr.write(`\x1b[33m[backend]\x1b[0m ${msg}`);
      }
    });

    backendProcess.on('error', (err) => {
      logError(`Gagal menjalankan uv/uvicorn backend: ${err.message}`);
      cleanupBackend();
      process.exit(1);
    });

    backendProcess.on('exit', (code) => {
      if (!isCleaningUp && code !== 0) {
        logError(`Backend uvicorn berhenti sebelum siap dengan exit code ${code}`);
      }
    });

    // Poll health check endpoint until ready
    log('Menunggu kesiapan backend di http://127.0.0.1:8000/api/v1/health...');
    let isReady = false;
    for (let attempt = 1; attempt <= MAX_HEALTH_ATTEMPTS; attempt++) {
      await new Promise((r) => setTimeout(r, HEALTH_POLL_INTERVAL_MS));
      isReady = await checkBackendHealth();
      if (isReady) break;
    }

    if (!isReady) {
      logError('Batas waktu habis: backend FastAPI tidak merespons di /api/v1/health.');
      cleanupBackend();
      process.exit(1);
    }

    logSuccess('Backend FastAPI siap melayani request! (HTTP 200 OK)');
  }

  // Launch Flutter mobile runner with full interactive TTY passthrough
  log('Menjalankan aplikasi mobile Flutter...');
  log('\x1b[90m(Tips: Tekan "r" untuk Hot Reload, "R" untuk Hot Restart, "q" untuk Keluar)\x1b[0m\n');

  const mobileRunner = resolve(repoRoot, 'apps/mobile/run-flutter.mjs');
  const flutterArgs = [mobileRunner, 'run', ...forwardedArgs];

  const flutterProcess = spawn('node', flutterArgs, {
    cwd: resolve(repoRoot, 'apps/mobile'),
    stdio: 'inherit',
    shell: isWindows,
  });

  flutterProcess.on('close', (code) => {
    log(`Aplikasi Flutter ditutup (exit code: ${code ?? 0}).`);
    cleanupBackend();
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  logError(`Kesalahan runner: ${err.message}`);
  cleanupBackend();
  process.exit(1);
});
