/**
 * Stellar-specific validation utilities for Access Control indexer.
 */

import { scValToNative, StrKey } from '@stellar/stellar-base';
import type { SorobanEvent } from '@subql/types-stellar';

// ============================================================================
// Stellar Field Validators
// ============================================================================

/**
 * Validates that a string is a valid Stellar address (account or contract).
 */
export function isValidStellarAddress(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    if (value.startsWith('G')) {
      return StrKey.isValidEd25519PublicKey(value);
    }
    if (value.startsWith('C')) {
      return StrKey.isValidContract(value);
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Validates that a value is a valid Soroban Symbol (used for roles).
 * Symbols are max 32 chars, alphanumeric + underscore.
 */
export function isValidRoleSymbol(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 32) {
    return false;
  }
  return /^[a-zA-Z0-9_]+$/.test(value);
}

/**
 * Validates a Stellar transaction hash (64 hex chars, no 0x prefix).
 */
export function isValidStellarTxHash(txHash: unknown): txHash is string {
  if (typeof txHash !== 'string') return false;
  return /^[a-fA-F0-9]{64}$/.test(txHash);
}

/**
 * Validates a ledger sequence number.
 */
export function isValidLedgerNumber(ledger: unknown): ledger is number {
  if (typeof ledger !== 'number') return false;
  return Number.isInteger(ledger) && ledger >= 0;
}

// ============================================================================
// Stellar Event Helpers
// ============================================================================

/**
 * Safely decodes an ScVal.
 */
export function safeScValToNative<T>(scVal: unknown): T | undefined {
  try {
    return scValToNative(scVal as any) as T;
  } catch {
    return undefined;
  }
}

/**
 * Safely extracts contract address from event.
 */
export function getContractAddress(event: SorobanEvent): string | undefined {
  try {
    const address = event.contractId?.contractId().toString();
    if (address && isValidStellarAddress(address)) {
      return address;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Validates that an event has required ledger information.
 */
export function hasValidLedgerInfo(
  event: SorobanEvent
): event is SorobanEvent & { ledger: NonNullable<SorobanEvent['ledger']> } {
  return (
    event.ledger !== null &&
    event.ledger !== undefined &&
    typeof event.ledger.sequence === 'number'
  );
}
