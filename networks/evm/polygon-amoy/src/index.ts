/**
 * Polygon Amoy Access Control Indexer
 * Network ID: polygon-amoy
 * Chain ID: 80002
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';