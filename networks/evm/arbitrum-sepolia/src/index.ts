/**
 * Arbitrum Sepolia Access Control Indexer
 * Network ID: arbitrum-sepolia
 * Chain ID: 421614
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';