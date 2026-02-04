/**
 * Base Access Control Indexer
 * Network ID: base-mainnet
 * Chain ID: 8453
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';