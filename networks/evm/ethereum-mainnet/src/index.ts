/**
 * Ethereum Access Control Indexer
 * Network ID: ethereum-mainnet
 * Chain ID: 1
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';