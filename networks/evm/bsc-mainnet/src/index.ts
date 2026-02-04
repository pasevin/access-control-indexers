/**
 * BNB Smart Chain Access Control Indexer
 * Network ID: bsc-mainnet
 * Chain ID: 56
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';