import { execSync } from 'child_process';
import * as path from 'path';

/**
 * Compiles the Midnight Compact contract into ZK circuits.
 * Requires Midnight toolchain (`compactc`) to be installed.
 */
function compileContract() {
  const contractPath = path.resolve(__dirname, '../contracts/Membership.compact');
  const managedDir = path.resolve(__dirname, '../managed');

  console.log(`Compiling Compact Contract: ${contractPath}`);
  
  try {
    // Attempting to run the compact compiler command
    execSync(`compactc compile ${contractPath} --out-dir ${managedDir}`, { stdio: 'inherit' });
    console.log('Compilation successful. Circuits and keys generated in /managed');
  } catch (error) {
    console.error('Compilation failed or compactc is not in PATH.');
    console.log('Note: Ensure Midnight toolchain is installed to compile to ZK circuits.');
  }
}

compileContract();
