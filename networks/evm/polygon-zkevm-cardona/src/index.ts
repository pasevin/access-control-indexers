/**
 * Polygon zkEVM Cardona Access Control Indexer
 * Network ID: polygon-zkevm-cardona
 * Chain ID: 2442
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';