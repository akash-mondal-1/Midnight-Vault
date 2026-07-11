import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Compiles the MidnightVault Compact contract into ZK circuits.
 *
 * Requires the Midnight toolchain (`compact`) to be installed.
 * Install guide: https://docs.midnight.network/develop/tutorial/using/prereqs
 *
 * Install toolchain (Linux/macOS/WSL):
 *   curl --proto '=https' --tlsv1.2 -LsSf \
 *     https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
 *
 * Compile command (official format):
 *   compact compile <contract-file> <output-directory>
 *
 * Example:
 *   compact compile contracts/Membership.compact managed/Membership
 */

const CONTRACT_FILE = 'contracts/Membership.compact';
const OUTPUT_DIR = 'managed/Membership';

function printSeparator(): void {
  console.log('═'.repeat(50));
}

function compileContract(): void {
  const contractPath = path.resolve(__dirname, '..', CONTRACT_FILE);
  const managedDir = path.resolve(__dirname, '..', OUTPUT_DIR);

  console.log('');
  printSeparator();
  console.log('  MidnightVault — Compact Compiler');
  printSeparator();
  console.log('');
  console.log(`  Contract : ${contractPath}`);
  console.log(`  Output   : ${managedDir}`);
  console.log('');

  // Ensure output directory exists
  fs.mkdirSync(managedDir, { recursive: true });

  // Try compact compile (modern Midnight CLI — official command format)
  const compileCmd = `compact compile "${contractPath}" "${managedDir}"`;

  const fallbackCommands = [
    // Modern compact CLI
    `compact compile "${CONTRACT_FILE}" "${OUTPUT_DIR}"`,
    // Legacy compactc
    `compactc compile "${contractPath}" --out-dir "${managedDir}"`,
    // WSL wrapper (for Windows)
    `wsl compact compile "${CONTRACT_FILE.replace(/\\/g, '/')}" "${OUTPUT_DIR.replace(/\\/g, '/')}"`,
  ];

  let compiled = false;

  for (const cmd of fallbackCommands) {
    try {
      console.log(`  ⟳ Running: ${cmd}`);
      execSync(cmd, { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
      compiled = true;
      break;
    } catch (_err) {
      // Try next command
    }
  }

  if (compiled) {
    console.log('');
    printSeparator();
    console.log('  ✅ Compilation successful!');
    console.log('');

    // List generated files
    if (fs.existsSync(managedDir)) {
      console.log('  Generated artifacts:');
      listDir(managedDir, '    ');
    }
    printSeparator();
    console.log('');
  } else {
    console.error('');
    console.error('  ❌ Compilation failed: Midnight toolchain not found in PATH.');
    console.error('');
    console.error('  Install the compact toolchain:');
    console.error('  curl --proto \'=https\' --tlsv1.2 -LsSf \\');
    console.error('    https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh');
    console.error('');
    console.error('  Windows users: Install in WSL (Ubuntu), then run from WSL terminal.');
    console.error('  See: https://docs.midnight.network/develop/tutorial/using/prereqs');
    console.error('');

    // Note: the managed/ directory is pre-populated with correct artifacts
    // from a real compilation for CI/submission purposes
    console.log('  ℹ Pre-compiled artifacts are available in managed/Membership/');
    console.log('    for inspection and testing purposes.');
    process.exit(1);
  }
}

function listDir(dir: string, indent: string): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      console.log(`${indent}${entry.name}/`);
      listDir(fullPath, indent + '  ');
    } else {
      const size = fs.statSync(fullPath).size;
      console.log(`${indent}${entry.name} (${size} bytes)`);
    }
  }
}

compileContract();
