/**
 * ZkSync Era Sepolia Access Control Indexer
 * Network ID: zksync-era-sepolia
 * Chain ID: 300
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';