/**
 * Linea Access Control Indexer
 * Network ID: linea-mainnet
 * Chain ID: 59144
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';