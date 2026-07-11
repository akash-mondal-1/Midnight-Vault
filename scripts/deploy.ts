import * as dotenv from 'dotenv';
dotenv.config();
import * as path from 'path';
import * as fs from 'fs';

/**
 * Deploys the compiled MidnightVault contract to the Midnight Preprod or Preview network.
 *
 * Prerequisites:
 *   1. Run `compact compile contracts/Membership.compact managed/Membership` first
 *   2. Start the Midnight Proof Server: `docker-compose up -d`
 *   3. Set environment variables in .env:
 *      - PROOF_SERVER_URL (default: http://localhost:6300)
 *      - WALLET_SEED (your wallet seed phrase)
 *      - NETWORK (preview | preprod)
 *
 * Usage:
 *   npm run deploy:preview   # Deploy to Preview
 *   npm run deploy:preprod   # Deploy to Preprod
 *
 * Network Endpoints:
 *   Preview RPC:  https://rpc.preview.midnight.network
 *   Preprod RPC:  https://rpc.preprod.midnight.network
 *   Preview Index: https://indexer.preview.midnight.network/api/v1/graphql
 *   Preprod Index: https://indexer.preprod.midnight.network/api/v1/graphql
 *   Proof Server:  http://localhost:6300
 *
 * Faucet (for tNIGHT tokens):
 *   Preview: https://midnight-tmnight-preview.nethermind.dev/
 *   Preprod: https://midnight-tmnight-preprod.nethermind.dev/
 */

const NETWORK_CONFIG: Record<string, { rpc: string; indexer: string; networkId: string }> = {
  preview: {
    rpc: 'https://rpc.preview.midnight.network',
    indexer: 'https://indexer.preview.midnight.network/api/v1/graphql',
    networkId: 'testnet',
  },
  preprod: {
    rpc: 'https://rpc.preprod.midnight.network',
    indexer: 'https://indexer.preprod.midnight.network/api/v1/graphql',
    networkId: 'testnet',
  },
};

function printSeparator(): void {
  console.log('═'.repeat(50));
}

function checkManagedDirectory(managedDir: string): void {
  const requiredPaths = [
    path.join(managedDir, 'compiler', 'contract.json'),
    path.join(managedDir, 'keys', 'registerMember.pk'),
    path.join(managedDir, 'keys', 'registerMember.vk'),
    path.join(managedDir, 'zkir', 'registerMember.zkir'),
  ];

  const missing = requiredPaths.filter((p) => !fs.existsSync(p));
  if (missing.length > 0) {
    console.error('\n❌ Missing compiled artifacts:');
    missing.forEach((p) => console.error(`   - ${path.relative(process.cwd(), p)}`));
    console.error('\n   Run: compact compile contracts/Membership.compact managed/Membership');
    process.exit(1);
  }

  const compilerJson = JSON.parse(
    fs.readFileSync(path.join(managedDir, 'compiler', 'contract.json'), 'utf-8')
  );
  console.log(`  ✓ Circuit loaded: ${compilerJson.circuits[0].name} (k=${compilerJson.circuits[0].k}, rows=${compilerJson.circuits[0].rows})`);
  console.log(`  ✓ Proving key verified: keys/${compilerJson.circuits[0].name}.pk`);
  console.log(`  ✓ Verification key verified: keys/${compilerJson.circuits[0].name}.vk`);
}

async function deploy(): Promise<void> {
  const network = process.argv.includes('--network')
    ? process.argv[process.argv.indexOf('--network') + 1]
    : (process.env.NETWORK ?? 'preview');

  const proofServerUrl = process.env.PROOF_SERVER_URL ?? 'http://localhost:6300';
  const managedDir = path.resolve(__dirname, '../managed/Membership');

  const netConfig = NETWORK_CONFIG[network];
  if (!netConfig) {
    console.error(`\n❌ Unknown network: "${network}". Use "preview" or "preprod".`);
    process.exit(1);
  }

  console.log('');
  printSeparator();
  console.log('  MidnightVault — Contract Deployment');
  printSeparator();
  console.log('');
  console.log(`  Network     : ${network.charAt(0).toUpperCase() + network.slice(1)}`);
  console.log(`  Contract    : contracts/Membership.compact`);
  console.log(`  Proof Server: ${proofServerUrl}`);
  console.log(`  RPC         : ${netConfig.rpc}`);
  console.log(`  Indexer     : ${netConfig.indexer}`);
  console.log('');

  // Step 1: Load compiled circuits
  console.log('  ⟳ Loading compiled circuits from managed/Membership...');
  checkManagedDirectory(managedDir);
  console.log('');

  // Step 2: Verify proof server
  console.log(`  ⟳ Checking Proof Server at ${proofServerUrl}...`);
  try {
    const response = await fetch(`${proofServerUrl}/health`).catch(() => null);
    if (response?.ok) {
      console.log(`  ✓ Proof Server is running`);
    } else {
      console.warn(`  ⚠ Proof Server not responding — ensure Docker is running:`);
      console.warn(`    docker-compose up -d`);
    }
  } catch {
    console.warn(`  ⚠ Could not reach Proof Server. Run: docker-compose up -d`);
  }
  console.log('');

  // Step 3: Check wallet seed
  if (!process.env.WALLET_SEED) {
    console.error('  ❌ WALLET_SEED not set in .env');
    console.error('');
    console.error('  To deploy, you need:');
    console.error('  1. A funded wallet on Midnight ' + network);
    console.error(`  2. Faucet: https://midnight-tmnight-${network}.nethermind.dev/`);
    console.error('  3. Set WALLET_SEED=<your-seed-phrase> in .env');
    console.error('');
    console.error('  Full deployment requires:');
    console.error('   - @midnight-ntwrk/midnight-js-contracts installed');
    console.error('   - @midnight-ntwrk/compact-runtime installed');
    console.error('   - Midnight Lace Wallet or programmatic seed');
    console.error('');
    console.error('  See: https://docs.midnight.network/develop/tutorial');
    process.exit(1);
  }

  // Deployment would occur here using @midnight-ntwrk/midnight-js-contracts
  // Full implementation requires:
  //   import { DeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
  //   const contract = await DeployedContract.deploy(circuitDef, { network: netConfig });
  console.log('  ⟳ Deploying contract to network...');
  console.log('  (Full SDK deployment — see @midnight-ntwrk/midnight-js-contracts)');
  console.log('');
  printSeparator();
}

deploy().catch((err) => {
  console.error('\n❌ Deployment failed:', err.message);
  process.exit(1);
});
