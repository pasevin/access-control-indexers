/**
 * Validation utilities for Access Control indexers
 */

// ============================================================================
// Event Validation Types & Utilities
// ============================================================================

/**
 * Result of event validation
 */
export interface EventValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Context for event validation logging
 */
export interface EventContext {
  network: string;
  blockNumber: number | string | bigint;
  transactionHash?: string;
  eventType: string;
}

/**
 * Creates a validation failure result
 */
function failure(error: string): EventValidationResult {
  return { valid: false, error };
}

/**
 * Successful validation result
 */
const SUCCESS: EventValidationResult = { valid: true };

/**
 * Formats event context for error messages
 */
function formatContext(ctx: EventContext): string {
  const txPart = ctx.transactionHash ? `, tx: ${ctx.transactionHash}` : '';
  return `${ctx.eventType} at block ${ctx.blockNumber}${txPart} on ${ctx.network}`;
}

// ============================================================================
// Generic Field Validators
// ============================================================================

/**
 * Validates that required fields exist and are non-null/undefined
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[],
  context: EventContext
): EventValidationResult {
  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null) {
      return failure(
        `Missing required field "${String(field)}" for ${formatContext(context)}`
      );
    }
  }
  return SUCCESS;
}

/**
 * Validates an array has minimum required length with non-null elements
 */
export function validateArrayElements<T>(
  arr: T[] | undefined | null,
  requiredIndices: number[],
  fieldName: string,
  context: EventContext
): EventValidationResult {
  if (!arr) {
    return failure(`Missing ${fieldName} for ${formatContext(context)}`);
  }

  for (const index of requiredIndices) {
    if (arr[index] === undefined || arr[index] === null) {
      return failure(
        `Missing ${fieldName}[${index}] for ${formatContext(context)}`
      );
    }
  }
  return SUCCESS;
}


// ============================================================================
// Logging Utilities
// ============================================================================

/**
 * Logs validation failure as a warning and returns whether event should be skipped
 */
export function logAndSkipIfInvalid(result: EventValidationResult): boolean {
  if (!result.valid) {
    console.warn(`Skipping malformed event: ${result.error}`);
    return true;
  }
  return false;
}

/**
 * Convenience function: validate and log in one call
 * Returns true if event is VALID (should be processed)
 * Returns false if event is INVALID (should be skipped)
 */
export function isValidEvent(result: EventValidationResult): boolean {
  if (!result.valid) {
    console.warn(`Skipping malformed event: ${result.error}`);
    return false;
  }
  return true;
}

// ============================================================================
// Generic Field-Level Validators
// ============================================================================

/**
 * Validates a block/ledger number (works for both EVM and Stellar)
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
 * Validates a hex string has expected format
 */
export function isValidHex(
  value: string,
  expectedLength?: number,
  requirePrefix: boolean = true
): boolean {
  if (!value) return false;

  const hexPattern = requirePrefix
    ? /^0x[a-fA-F0-9]+$/
    : /^(0x)?[a-fA-F0-9]+$/;

  if (!hexPattern.test(value)) return false;

  if (expectedLength !== undefined) {
    const hexPart = value.startsWith('0x') ? value.slice(2) : value;
    return hexPart.length === expectedLength;
  }

  return true;
}
