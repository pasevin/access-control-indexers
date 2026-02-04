/**
 * Arbitrum One Access Control Indexer
 * Network ID: arbitrum-mainnet
 * Chain ID: 42161
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';