/**
 * Scroll Sepolia Access Control Indexer
 * Network ID: scroll-sepolia
 * Chain ID: 534351
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';