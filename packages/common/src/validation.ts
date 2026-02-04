/**
 * Validation utilities for Access Control indexers
 */

/**
 * Validates a role identifier
 * EVM: bytes32 hex string (66 chars with 0x prefix)
 * Stellar: Symbol (max 32 chars, alphanumeric + underscore)
 */
export function isValidRole(
  role: string,
  ecosystem: 'evm' | 'stellar'
): boolean {
  if (!role) return false;

  if (ecosystem === 'evm') {
    // EVM roles are bytes32 (0x + 64 hex chars)
    return /^0x[a-fA-F0-9]{64}$/.test(role);
  } else {
    // Stellar roles are Symbols (max 32 chars, alphanumeric + underscore)
    return /^[a-zA-Z_][a-zA-Z0-9_]{0,31}$/.test(role);
  }
}

/**
 * Validates a transaction hash
 */
export function isValidTxHash(
  txHash: string,
  ecosystem: 'evm' | 'stellar'
): boolean {
  if (!txHash) return false;

  if (ecosystem === 'evm') {
    // EVM tx hashes are 0x + 64 hex chars
    return /^0x[a-fA-F0-9]{64}$/.test(txHash);
  } else {
    // Stellar tx hashes are 64 hex chars (no 0x prefix)
    return /^[a-fA-F0-9]{64}$/.test(txHash);
  }
}

/**
 * Validates a block/ledger number
 */
export function isValidBlockNumber(
  blockNumber: unknown
): blockNumber is bigint | number {
  if (typeof blockNumber === 'bigint') {
    return blockNumber >= 0n;
  }
  if (typeof blockNumber === 'number') {
    return Number.isInteger(blockNumber) && blockNumber >= 0;
  }
  return false;
}

/**
 * Validates a timestamp
 */
export function isValidTimestamp(timestamp: unknown): timestamp is Date {
  if (!(timestamp instanceof Date)) return false;
  return !isNaN(timestamp.getTime());
}

/**
 * Validates a ledger number (Stellar-specific)
 */
export function isValidLedgerNumber(ledger: unknown): ledger is number {
  if (typeof ledger !== 'number') return false;
  return Number.isInteger(ledger) && ledger >= 0;
}
