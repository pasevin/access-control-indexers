/**
 * Scroll Access Control Indexer
 * Network ID: scroll-mainnet
 * Chain ID: 534352
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';