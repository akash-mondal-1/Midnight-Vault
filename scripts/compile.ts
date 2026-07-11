import { execSync } from 'child_process';
import * as path from 'path';

/**
 * Compiles the Midnight Compact contract into ZK circuits.
 * Requires the Midnight toolchain (`compact`) to be installed.
 *
 * Install via WSL (Ubuntu):
 *   curl --proto '=https' --tlsv1.2 -LsSf \
 *     https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
 */
function compileContract() {
  const contractPath = path.resolve(__dirname, '../contracts/Membership.compact');
  const managedDir = path.resolve(__dirname, '../managed');

  console.log('');
  console.log('MidnightVault — Compact Compiler');
  console.log('Contract :', contractPath);
  console.log('Output   :', managedDir);
  console.log('');

  try {
    // Try `compact build` (modern Midnight CLI)
    execSync(`compact build "${contractPath}" --out-dir "${managedDir}"`, { stdio: 'inherit' });
    console.log('\n✅ Compilation successful. Circuits and keys generated in /managed\n');
  } catch (_) {
    try {
      // Fallback: try legacy `compactc compile`
      execSync(`compactc compile "${contractPath}" --out-dir "${managedDir}"`, { stdio: 'inherit' });
      console.log('\n✅ Compilation successful. Circuits and keys generated in /managed\n');
    } catch (__) {
      console.error('\n❌ Compilation failed: Midnight toolchain not found in PATH.');
      console.error('   Install the toolchain via WSL (Ubuntu):');
      console.error('   curl --proto \'=https\' --tlsv1.2 -LsSf \\');
      console.error('     https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh');
      process.exit(1);
    }
  }
}

compileContract();
