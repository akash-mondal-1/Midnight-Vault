import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { emptyZswapLocalState } from '@midnight-ntwrk/compact-runtime';
import { ChargedState, StateValue } from '@midnight-ntwrk/onchain-runtime-v2';

/**
 * MembershipContract execution runtime class.
 * Conforms to Compact JS runtime requirements (contains ctor, witnesses, impureCircuits, initialState).
 */
export class MembershipContract {
  witnesses: any;
  impureCircuits: Record<string, any>;
  pureCircuits: Record<string, any>;

  constructor(witnesses: any) {
    this.witnesses = witnesses;
    this.impureCircuits = {
      registerMember: (context: any, secret: bigint) => {
        return {
          result: undefined,
          context,
        };
      },
    };
    this.pureCircuits = {};
  }

  initialState(context: any) {
    const emptyState = StateValue.newNull();
    const contractState = new ChargedState(emptyState);
    return {
      currentContractState: contractState,
      currentPrivateState: context.initialPrivateState ?? {},
      currentZswapLocalState:
        context.initialZswapLocalState ?? emptyZswapLocalState(context.coinPublicKey),
    };
  }
}

/**
 * CompiledContract instance for Membership.
 * Used by Midnight JS SDK (deployContract & findDeployedContract).
 */
export const compiledMembershipContract = CompiledContract.make(
  'Membership',
  MembershipContract as any
);
