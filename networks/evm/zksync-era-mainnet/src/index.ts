/**
 * ZkSync Era Access Control Indexer
 * Network ID: zksync-era-mainnet
 * Chain ID: 324
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';