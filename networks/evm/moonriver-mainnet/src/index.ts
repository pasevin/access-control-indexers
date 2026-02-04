/**
 * Moonriver Access Control Indexer
 * Network ID: moonriver-mainnet
 * Chain ID: 1285
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';