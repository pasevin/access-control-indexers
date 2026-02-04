/**
 * Polkadot Hub Access Control Indexer
 * Network ID: polkadot-hub
 * Chain ID: 420420419
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';