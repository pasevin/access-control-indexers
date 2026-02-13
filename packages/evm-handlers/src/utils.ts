/**
 * EVM-specific utility functions
 */

import { normalizeEvmAddress, isZeroAddress } from "@oz-indexers/common";

/** bytes32 zero — OpenZeppelin AccessControl DEFAULT_ADMIN_ROLE (keccak256("")) */
const DEFAULT_ADMIN_ROLE_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

/**
 * Formats a bytes32 role to a hex string
 */
export function formatRole(role: string): string {
  // Ensure proper 0x prefix and lowercase
  const normalized = role.startsWith("0x") ? role : `0x${role}`;
  return normalized.toLowerCase();
}

/**
 * Checks if a role is the default admin role (bytes32 zero).
 * Used to classify RoleRevoked as ADMIN_RENOUNCED when the revoked role is DEFAULT_ADMIN_ROLE.
 */
export function isDefaultAdminRole(role: string): boolean {
  return formatRole(role) === DEFAULT_ADMIN_ROLE_BYTES32;
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
