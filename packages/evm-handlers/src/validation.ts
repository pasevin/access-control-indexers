/**
 * EVM-specific validation utilities for Access Control indexers
 */

import {
  EventValidationResult,
  EventContext,
  validateArrayElements,
} from '@oz-indexers/common';

// ============================================================================
// EVM Field Validators
// ============================================================================

/**
 * Validates an EVM address (0x + 40 hex chars, checksummed or lowercase)
 */
export function isValidEvmAddress(address: string): boolean {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates an EVM role (bytes32 = 0x + 64 hex chars)
 */
export function isValidEvmRole(role: string): boolean {
  if (!role) return false;
  return /^0x[a-fA-F0-9]{64}$/.test(role);
}

/**
 * Validates an EVM transaction hash (0x + 64 hex chars)
 */
export function isValidEvmTxHash(txHash: string): boolean {
  if (!txHash) return false;
  return /^0x[a-fA-F0-9]{64}$/.test(txHash);
}

/**
 * Validates an EVM block number
 */
export function isValidEvmBlockNumber(
  blockNumber: unknown
): blockNumber is number | bigint {
  if (typeof blockNumber === 'bigint') return blockNumber >= 0n;
  if (typeof blockNumber === 'number') {
    return Number.isInteger(blockNumber) && blockNumber >= 0;
  }
  return false;
}

// ============================================================================
// EVM Event Topic Requirements
// ============================================================================

/**
 * Required topic indices per EVM event type.
 * Maps event name to array of topic indices that must be present.
 * Index 0 is always the event signature, so we start from index 1.
 */
export const EVM_EVENT_TOPIC_REQUIREMENTS: Record<string, number[]> = {
  // OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
  OwnershipTransferred: [1, 2],

  // OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner)
  OwnershipTransferStarted: [1, 2],

  // RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
  RoleGranted: [1, 2, 3],

  // RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
  RoleRevoked: [1, 2, 3],

  // RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
  RoleAdminChanged: [1, 2, 3],

  // DefaultAdminTransferScheduled(address indexed newAdmin, uint48 acceptSchedule)
  DefaultAdminTransferScheduled: [1],

  // DefaultAdminTransferCanceled() - no indexed params
  DefaultAdminTransferCanceled: [],

  // DefaultAdminDelayChangeScheduled(uint48 newDelay, uint48 effectSchedule) - no indexed params
  DefaultAdminDelayChangeScheduled: [],

  // DefaultAdminDelayChangeCanceled() - no indexed params
  DefaultAdminDelayChangeCanceled: [],
};

// ============================================================================
// EVM Validators
// ============================================================================

/**
 * Validates EVM event topics array has all required indexed parameters
 */
export function validateEvmTopics(
  topics: string[] | undefined | null,
  eventType: string,
  context: EventContext
): EventValidationResult {
  const requiredIndices = EVM_EVENT_TOPIC_REQUIREMENTS[eventType] ?? [];
  return validateArrayElements(topics, requiredIndices, 'topics', context);
}

/**
 * Validates an EVM event - convenience function that creates context and validates
 */
export function validateEvmEvent(
  topics: string[] | undefined | null,
  eventType: string,
  network: string,
  blockNumber: number | bigint,
  transactionHash?: string
): EventValidationResult {
  const context: EventContext = {
    network,
    blockNumber,
    transactionHash,
    eventType,
  };

  return validateEvmTopics(topics, eventType, context);
}
