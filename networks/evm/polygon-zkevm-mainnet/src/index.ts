/**
 * Polygon zkEVM Access Control Indexer
 * Network ID: polygon-zkevm-mainnet
 * Chain ID: 1101
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';