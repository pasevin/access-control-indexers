/**
 * Moonbeam Access Control Indexer
 * Network ID: moonbeam-mainnet
 * Chain ID: 1284
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';