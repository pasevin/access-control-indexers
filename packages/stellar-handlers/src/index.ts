/**
 * @oz-indexers/stellar-handlers
 * Shared Stellar mapping handlers for OpenZeppelin Access Control indexers
 *
 * This package provides:
 * - Mapping handlers for AccessControl, Ownable, and Admin transfer events
 * - A clean initialization API for setting up network-specific configuration
 * - Type definitions for SubQuery entities
 * - Polyfills for Stellar SDK compatibility in SubQuery sandbox
 *
 * Usage:
 * ```typescript
 * import { initializeHandlers, handleRoleGranted, ... } from '@oz-indexers/stellar-handlers';
 * import { AccessControlEvent, RoleMembership, ContractOwnership, Contract } from './types';
 *
 * initializeHandlers({
 *   networkId: 'stellar-mainnet',
 *   entities: { AccessControlEvent, RoleMembership, ContractOwnership, Contract },
 *   store,
 * });
 *
 * export { handleRoleGranted, handleRoleRevoked, ... };
 * ```
 */

// Context and initialization
export { initializeHandlers, getContext, getNetworkId } from './context';
export type { InitConfig } from './context';

// Type definitions
export type {
  HandlerContext,
  AccessControlEventData,
  RoleMembershipData,
  ContractOwnershipData,
  ContractData,
  AccessControlEventEntity,
  RoleMembershipEntity,
  ContractOwnershipEntity,
  ContractEntity,
  AccessControlEventInstance,
  RoleMembershipInstance,
  ContractOwnershipInstance,
  ContractInstance,
  Store,
} from './types';

// Handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleAdminTransferInitiated,
  handleAdminTransferCompleted,
  handleAdminRenounced,
  handleOwnershipTransferStarted,
  handleOwnershipTransferCompleted,
  handleOwnershipRenounced,
} from './handlers';

// Validation
export {
  isValidStellarAddress,
  isValidRoleSymbol,
  safeScValToNative,
  getContractAddress,
  hasValidLedgerInfo,
  isValidStellarTxHash,
  isValidLedgerNumber,
} from './validation';

// Polyfills
export { ensurePolyfills } from './polyfills';
