import { CompiledContract } from '@midnight-ntwrk/compact-js';
import * as VaultContractModule from '../../../contracts/managed/Vault/contract/index.js';
import { persistentHash, CompactTypeVector, CompactTypeBytes, convertFieldToBytes } from '@midnight-ntwrk/compact-runtime';

export { getIssuerId, getUserId, getCredentialCommitment } from './credential-derivation';

export const createVaultWitnesses = () => ({
  credentialSecret: ({ privateState }: { privateState: any }): [any, Uint8Array] => [
    privateState,
    privateState.credentialSecret
  ],
  credentialType: ({ privateState }: { privateState: any }): [any, bigint] => [
    privateState,
    privateState.credentialType
  ],
  credentialIssuer: ({ privateState }: { privateState: any }): [any, Uint8Array] => [
    privateState,
    privateState.credentialIssuer
  ],
  issuerSecret: ({ privateState }: { privateState: any }): [any, Uint8Array] => [
    privateState,
    privateState.issuerSecret
  ],
});

const contractCtor = (VaultContractModule as any).Contract || VaultContractModule;

export const compiledVaultContract = CompiledContract.make(
  'Vault',
  contractCtor as any
).pipe(
  CompiledContract.withWitnesses(createVaultWitnesses())
);
