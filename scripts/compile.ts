import { execSync, spawnSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

/**
 * Compiles the Midnight Vault Compact contract into ZK circuits.
 *
 * Requires the official Midnight Compact toolchain to be installed.
 * The toolchain is only available for Linux/macOS (via WSL on Windows).
 *
 * Official installer (Linux/macOS):
 *   curl --proto '=https' --tlsv1.2 -LsSf \
 *     https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
 *
 * Windows: Use WSL (Ubuntu) with the installer, or use the CI pipeline.
 *
 * NOTE: Windows compact.exe is the NTFS compression utility and must NOT
 * be used here. This script explicitly rejects it.
 */

const CONTRACT_FILE = 'contracts/Vault.compact';
const OUTPUT_DIR = 'contracts/managed/Vault';

function printSeparator(): void {
  console.log('═'.repeat(60));
}

/**
 * Returns true if the `compact` binary on PATH is the genuine
 * Midnight Compact compiler, not Windows compact.exe.
 *
 * Detection strategy:
 *  - On Windows we reject outright unless inside WSL.
 *  - On any platform we run `compact --version` and check for
 *    the expected "Compact toolchain" string.
 *  - If the output looks like Windows compact.exe help text
 *    (e.g. "Displays or alters") we reject.
 */
function detectRealCompiler(): { found: boolean; version: string; error: string } {
  // On Windows (native PowerShell / cmd), reject immediately.
  // compact.exe is the NTFS compression utility, not the Midnight compiler.
  if (os.platform() === 'win32') {
    return {
      found: false,
      version: '',
      error:
        'Running on Windows (native). The Midnight Compact compiler is a Linux/macOS binary.\n' +
        'Use WSL (Ubuntu) or the GitHub Actions CI pipeline to compile.\n' +
        'DO NOT use Windows compact.exe — it is an NTFS compression utility.',
    };
  }

  // Try `compact --version`
  try {
    const result = spawnSync('compact', ['--version'], {
      encoding: 'utf8',
      timeout: 5000,
    });

    const stdout = (result.stdout || '').trim();
    const stderr = (result.stderr || '').trim();
    const combined = `${stdout} ${stderr}`.toLowerCase();

    // Reject if it looks like the Windows compression utility
    // (This guard also applies if somehow running under Wine etc.)
    if (
      combined.includes('displays or alters') ||
      combined.includes('compression') ||
      combined.includes('ntfs') ||
      result.status === null // process failed to start
    ) {
      return {
        found: false,
        version: '',
        error: 'compact on PATH appears to be the Windows NTFS compression utility, not the Midnight Compact compiler.',
      };
    }

    // Accept if we see "compact" or "compactc" + a version string
    if (result.status === 0 && (stdout.includes('compact') || stdout.includes('0.'))) {
      return { found: true, version: stdout, error: '' };
    }

    return {
      found: false,
      version: '',
      error: `compact --version returned unexpected output:\n  stdout: ${stdout}\n  stderr: ${stderr}`,
    };
  } catch (err: any) {
    return {
      found: false,
      version: '',
      error: `compact not found in PATH: ${err?.message ?? err}`,
    };
  }
}

function compileContract(): void {
  const contractPath = path.resolve(__dirname, '..', CONTRACT_FILE);
  const managedDir = path.resolve(__dirname, '..', OUTPUT_DIR);

  console.log('');
  printSeparator();
  console.log('  Midnight Vault — Compact Compiler');
  printSeparator();
  console.log('');
  console.log(`  Contract : ${contractPath}`);
  console.log(`  Output   : ${managedDir}`);
  console.log('');

  // ── Sanity check: contract file must exist ───────────────────────────
  if (!fs.existsSync(contractPath)) {
    console.error(`  ❌ Contract source not found: ${contractPath}`);
    process.exit(1);
  }

  // ── Compiler detection ───────────────────────────────────────────────
  console.log('  Detecting Midnight Compact compiler...');
  const { found, version, error } = detectRealCompiler();

  if (!found) {
    console.error('');
    console.error('  ❌ MIDNIGHT COMPACT COMPILER NOT AVAILABLE');
    console.error('');
    console.error(`  ${error}`);
    console.error('');
    console.error('  Resolution options:');
    console.error('  1. Use the GitHub Actions CI pipeline (.github/workflows/ci.yml)');
    console.error('     Push to the repository — CI will compile on Ubuntu and upload artifacts.');
    console.error('');
    console.error('  2. On Linux/macOS — install the official toolchain:');
    console.error('     curl --proto \'=https\' --tlsv1.2 -LsSf \\');
    console.error('       https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh');
    console.error('');
    console.error('  3. On Windows — install WSL (Ubuntu), then run the installer inside WSL.');
    console.error('');
    console.error('  DO NOT use Windows compact.exe — it is an NTFS compression utility, NOT the Midnight Compact compiler.');
    console.error('');
    process.exit(1);
  }

  console.log(`  ✓ Compact compiler found: ${version}`);
  console.log('');

  // ── Create output directory ──────────────────────────────────────────
  fs.mkdirSync(managedDir, { recursive: true });

  // ── Run compilation ──────────────────────────────────────────────────
  const compileCmd = `compact compile "${CONTRACT_FILE}" "${OUTPUT_DIR}"`;
  console.log(`  Running: ${compileCmd}`);
  console.log('');

  try {
    execSync(compileCmd, {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
    });
  } catch (err: any) {
    console.error('');
    console.error('  ❌ Compact compilation FAILED.');
    console.error('  See error output above for compiler diagnostics.');
    console.error('');
    process.exit(1);
  }

  // ── Report generated artifacts ───────────────────────────────────────
  console.log('');
  printSeparator();
  console.log('  ✅ Compilation successful!');
  console.log('');
  console.log('  Generated artifacts:');

  if (fs.existsSync(managedDir)) {
    listDir(managedDir, '    ');
  }

  printSeparator();
  console.log('');
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
      console.log(`${indent}${entry.name} (${size.toLocaleString()} bytes)`);
    }
  }
}

compileContract();
