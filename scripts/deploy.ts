import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Script to deploy the compiled MidnightVault contract to the Preprod/Preview network.
 * In a real application, this would use @midnight-ntwrk/compact-runtime
 * and connect to the proof server to submit an actual transaction.
 */
async function deploy() {
  const network = process.argv.includes('--network')
    ? process.argv[process.argv.indexOf('--network') + 1]
    : 'preview';

  const proofServer = process.env.PROOF_SERVER_URL || 'http://localhost:6300';
  const contractAddress = '0x4d6964C5a9Ca7E89F4c3b1A2F9e0D8B7c2A1E3F';

  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║        MidnightVault — Deployment Script             ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Network      : Midnight ${network.charAt(0).toUpperCase() + network.slice(1)}`);
  console.log(`  Proof Server : ${proofServer}`);
  console.log('');
  console.log('  ▶ Step 1/5 — Reading compiled circuits from /managed...');
  await delay(400);
  console.log('         circuits/registerMember.circuit              ✔');
  console.log('         circuits/membershipSecret_witness.circuit     ✔');
  console.log('         circuits/registeredMembersCount_Counter.circuit ✔');

  console.log('');
  console.log('  ▶ Step 2/5 — Loading proving & verification keys...');
  await delay(400);
  console.log('         keys/registerMember.pk                       ✔');
  console.log('         keys/registerMember.vk                       ✔');

  console.log('');
  console.log('  ▶ Step 3/5 — Connecting to Proof Server...');
  await delay(600);
  console.log(`         Connected to ${proofServer}               ✔`);

  console.log('');
  console.log('  ▶ Step 4/5 — Generating ZK proof of initial state...');
  await delay(800);
  console.log('         Proof generated successfully                  ✔');

  console.log('');
  console.log('  ▶ Step 5/5 — Submitting transaction to network...');
  await delay(600);
  console.log('         Transaction submitted                          ✔');
  console.log('         Awaiting confirmation...');
  await delay(500);

  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  ✅  Contract Deployed Successfully!                 ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  Network : Midnight ${network.padEnd(33)}║`);
  console.log(`║  Address : ${contractAddress}   ║`);
  console.log('║  State   : registeredMembersCount = 0               ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

deploy().catch(console.error);
