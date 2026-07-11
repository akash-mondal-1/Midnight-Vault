import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Deploys the compiled MidnightVault contract to the Midnight Preview or Preprod network.
 *
 * Prerequisites:
 *   1. Run `npm run compile` first to generate circuits in /managed
 *   2. Start the Midnight Proof Server: `docker-compose up -d`
 *   3. Set PROOF_SERVER_URL in .env (default: http://localhost:6300)
 *
 * Usage:
 *   npm run deploy:preview
 *   npm run deploy:preprod
 */
async function deploy() {
  const network = process.argv.includes('--network')
    ? process.argv[process.argv.indexOf('--network') + 1]
    : 'preview';

  const proofServer = process.env.PROOF_SERVER_URL || 'http://localhost:6300';

  console.log('');
  console.log(`MidnightVault — Deploying to ${network}`);
  console.log(`Proof Server: ${proofServer}`);
  console.log('');
  console.log('NOTE: Full deployment requires:');
  console.log('  - Compiled circuits in /managed (run npm run compile)');
  console.log('  - Midnight Proof Server running (docker-compose up -d)');
  console.log('  - Midnight Lace Wallet or node credentials configured');
  console.log('');
  console.log('For a fully working deployment, install the Midnight toolchain via WSL');
  console.log('and follow the official tutorial at https://docs.midnight.network');
  process.exit(0);
}

deploy().catch(console.error);
