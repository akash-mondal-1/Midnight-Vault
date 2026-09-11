import {
  persistentHash,
  CompactTypeVector,
  CompactTypeBytes,
  convertFieldToBytes
} from '@midnight-ntwrk/compact-runtime';

/**
 * Derives the public issuer ID deterministically from the issuer secret.
 * This exactly matches the semantics of `persistentHash<Vector<2, Bytes<32>>>([secret, vault_issuer_domain])`
 * in Vault.compact.
 */
export const getIssuerId = (issuerSecret: Uint8Array): Uint8Array => {
  const vault_issuer_domain = new Uint8Array([
    118, 97, 117, 108, 116, 58, 105, 115, 115, 117, 101, 114,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ]);
  const descriptor0 = new CompactTypeBytes(32);
  const descriptorVector = new CompactTypeVector(2, descriptor0);
  return persistentHash(descriptorVector, [issuerSecret, vault_issuer_domain]) as Uint8Array;
};

/**
 * Derives the user ID deterministically from user secret:
 * persistentHash([secret, pad(32, "vault:user")])
 */
export const getUserId = (userSecret: Uint8Array): Uint8Array => {
  const vault_user_domain = new Uint8Array([
    118, 97, 117, 108, 116, 58, 117, 115, 101, 114,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ]);
  const descriptor0 = new CompactTypeBytes(32);
  const descriptorVector = new CompactTypeVector(2, descriptor0);
  return persistentHash(descriptorVector, [userSecret, vault_user_domain]) as Uint8Array;
};

/**
 * Derives the credential commitment exactly matching Vault.compact:
 * ctype as Field as Bytes<32> is serialized via convertFieldToBytes (little-endian field representation)
 * persistentHash([userId, ctypeBytes, issuerId])
 */
export const getCredentialCommitment = (
  userId: Uint8Array,
  credentialType: bigint | number,
  issuerId: Uint8Array
): Uint8Array => {
  const descriptor0 = new CompactTypeBytes(32);
  const descriptorVector = new CompactTypeVector(3, descriptor0);
  const ctypeBytes = convertFieldToBytes(32, BigInt(credentialType), 'getCredentialCommitment');
  return persistentHash(descriptorVector, [userId, ctypeBytes, issuerId]) as Uint8Array;
};
