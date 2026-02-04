/**
 * Avalanche Fuji C-Chain Access Control Indexer
 * Network ID: avalanche-fuji
 * Chain ID: 43113
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';