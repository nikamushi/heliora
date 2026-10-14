import { spawnSync } from 'node:child_process';

const rawArgs = process.argv.slice(2);
const isWindows = process.platform === 'win32';

// Detect if FVM is installed and available in the environment
const hasFvm = (() => {
  try {
    const check = spawnSync(isWindows ? 'fvm.bat' : 'fvm', ['--version'], {
      stdio: 'ignore',
      shell: true,
    });
    return check.status === 0;
  } catch {
    return false;
  }
})();

// Route commands through FVM when present, otherwise fallback to global flutter/dart
let executable;
let commandArgs;

if (hasFvm) {
  executable = isWindows ? 'fvm.bat' : 'fvm';
  commandArgs = rawArgs;
} else {
  const isDartCmd = rawArgs[0] === 'dart';
  if (isDartCmd) {
    executable = isWindows ? 'dart.bat' : 'dart';
    commandArgs = rawArgs.slice(1);
  } else {
    executable = isWindows ? 'flutter.bat' : 'flutter';
    commandArgs = rawArgs;
  }
}

const child = spawnSync(executable, commandArgs, {
  stdio: 'inherit',
  shell: true,
});

process.exit(child.status ?? 0);
