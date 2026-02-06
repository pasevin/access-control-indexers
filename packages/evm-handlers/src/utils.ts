/**
 * EVM-specific utility functions
 */

import { normalizeEvmAddress, isZeroAddress } from '@oz-indexers/common';

/**
 * Formats a bytes32 role to a hex string
 */
export function formatRole(role: string): string {
  // Ensure proper 0x prefix and lowercase
  const normalized = role.startsWith('0x') ? role : `0x${role}`;
  return normalized.toLowerCase();
}

/**
 * Checks if an ownership transfer is a renounce (transfer to zero address)
 */
export function isOwnershipRenounce(newOwner: string): boolean {
  return isZeroAddress(newOwner);
}

/**
 * Normalizes an EVM address for storage
 */
export function normalizeAddress(address: string): string {
  return normalizeEvmAddress(address);
}
