/**
 * Moonbase Alpha Access Control Indexer
 * Network ID: moonbase-alpha-testnet
 * Chain ID: 1287
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';