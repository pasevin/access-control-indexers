/**
 * Avalanche C-Chain Access Control Indexer
 * Network ID: avalanche-mainnet
 * Chain ID: 43114
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';