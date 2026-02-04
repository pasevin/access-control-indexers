/**
 * Base Sepolia Access Control Indexer
 * Network ID: base-sepolia
 * Chain ID: 84532
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';