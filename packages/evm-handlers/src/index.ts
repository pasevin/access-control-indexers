/**
 * @oz-indexers/evm-handlers
 * Shared EVM mapping handlers for OpenZeppelin Access Control indexers
 *
 * This package provides:
 * - Mapping handlers for AccessControl, Ownable, Ownable2Step, and AccessControlDefaultAdminRules events
 * - A clean initialization API for setting up network-specific configuration
 * - Type definitions for SubQuery entities
 *
 * Usage:
 * ```typescript
 * import { initializeHandlers, handleRoleGranted, ... } from '@oz-indexers/evm-handlers';
 * import { AccessControlEvent, RoleMembership, ContractOwnership, Contract } from './types';
 *
 * initializeHandlers({
 *   networkId: 'ethereum-mainnet',
 *   entities: { AccessControlEvent, RoleMembership, ContractOwnership, Contract },
 *   store,
 * });
 *
 * export { handleRoleGranted, handleRoleRevoked, ... };
 * ```
 */

// Context and initialization
export { initializeHandlers, getContext, getNetworkId } from "./context";
export type { InitConfig } from "./context";

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
  Store,
} from "./types";

// Handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
  // AccessControlDefaultAdminRules handlers
  handleDefaultAdminTransferScheduled,
  handleDefaultAdminTransferCanceled,
  handleDefaultAdminDelayChangeScheduled,
  handleDefaultAdminDelayChangeCanceled,
} from "./handlers";

// Utilities
export {
  formatRole,
  normalizeAddress,
  isOwnershipRenounce,
  isDefaultAdminRole,
} from "./utils";

// Validation
export {
  // Event validation
  validateEvmEvent,
  validateEvmTopics,
  EVM_EVENT_TOPIC_REQUIREMENTS,
  // Field validators
  isValidEvmAddress,
  isValidEvmRole,
  isValidEvmTxHash,
  isValidEvmBlockNumber,
} from "./validation";
