/**
 * OP Mainnet Access Control Indexer
 * Network ID: optimism-mainnet
 * Chain ID: 10
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';