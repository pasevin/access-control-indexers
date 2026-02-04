/**
 * Address normalization utilities
 * Ensures consistent address format across all networks
 */

/**
 * Normalizes an EVM address to lowercase
 * @param address - The address to normalize
 * @returns Lowercase address with 0x prefix
 */
export function normalizeEvmAddress(address: string): string {
  if (!address) {
    throw new Error('Address is required');
  }

  // Remove whitespace
  const trimmed = address.trim();

  // Ensure 0x prefix
  const withPrefix = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`;

  // Validate length (42 characters including 0x)
  if (withPrefix.length !== 42) {
    throw new Error(`Invalid EVM address length: ${withPrefix.length}`);
  }

  // Validate hex characters
  if (!/^0x[a-fA-F0-9]{40}$/.test(withPrefix)) {
    throw new Error(`Invalid EVM address format: ${withPrefix}`);
  }

  return withPrefix.toLowerCase();
}

/**
 * Normalizes a Stellar address (public key or contract)
 * Stellar addresses are case-sensitive, so we just validate and return as-is
 * @param address - The address to normalize
 * @returns Validated address
 */
export function normalizeStellarAddress(address: string): string {
  if (!address) {
    throw new Error('Address is required');
  }

  const trimmed = address.trim();

  // Stellar public keys start with G (56 chars)
  // Stellar contract addresses start with C (56 chars)
  if (!/^[GC][A-Z2-7]{55}$/.test(trimmed)) {
    throw new Error(`Invalid Stellar address format: ${trimmed}`);
  }

  return trimmed;
}

/**
 * Checks if an address is a valid EVM address
 */
export function isValidEvmAddress(address: string): boolean {
  try {
    normalizeEvmAddress(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if an address is a valid Stellar address
 */
export function isValidStellarAddress(address: string): boolean {
  try {
    normalizeStellarAddress(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if an EVM address is the zero address
 */
export function isZeroAddress(address: string): boolean {
  try {
    const normalized = normalizeEvmAddress(address);
    return normalized === '0x0000000000000000000000000000000000000000';
  } catch {
    return false;
  }
}

/**
 * The EVM zero address
 */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
