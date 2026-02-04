/**
 * Polygon Access Control Indexer
 * Network ID: polygon-mainnet
 * Chain ID: 137
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';