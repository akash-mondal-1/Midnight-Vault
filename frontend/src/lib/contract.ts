export const contractName = 'Membership';
export const languageVersion = '0.14.0';

export const circuits = {
  registerMember: {
    name: 'registerMember',
    k: 17,
    rows: 1024,
    inputs: [{ name: 'expectedSecret', type: 'Field' }],
    outputs: [],
    witnesses: [{ name: 'membershipSecret', type: 'Field' }],
  },
} as const;

export const ledger = {
  registeredMembersCount: { type: 'Counter', visibility: 'public' },
} as const;

export type Ledger = {
  readonly registeredMembersCount: bigint;
};

export type ContractAddress = string;
