import { CompiledContract } from '@midnight-ntwrk/compact-js';
import * as MembershipContractModule from '../managed/Membership/contract/index.cjs';

export const createMembershipWitnesses = () => ({
  membershipSecret: ({ privateState }: { privateState: any }): [any, bigint] => [
    privateState,
    typeof privateState?.secret === 'bigint' ? privateState.secret : BigInt(privateState?.secret ?? 0),
  ],
});

const contractCtor =
  (MembershipContractModule as any).Contract ||
  (MembershipContractModule as any).default?.Contract ||
  (MembershipContractModule as any).default ||
  MembershipContractModule;

export const compiledMembershipContract = CompiledContract.make(
  'Membership',
  contractCtor as any
).pipe(
  CompiledContract.withWitnesses(createMembershipWitnesses()),
  CompiledContract.withCompiledFileAssets('../managed/Membership')
);
