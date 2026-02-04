/**
 * Polkadot Hub TestNet Access Control Indexer
 * Network ID: polkadot-hub-testnet
 * Chain ID: 420420417
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';