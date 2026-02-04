/**
 * Ethereum Sepolia Access Control Indexer
 * Network ID: ethereum-sepolia
 */

import {
  initializeHandlers,
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from '@oz-indexers/evm-handlers';

import {
  AccessControlEvent,
  RoleMembership,
  ContractOwnership,
  Contract,
} from './types';

// Initialize shared handlers with network-specific configuration
initializeHandlers({
  networkId: 'ethereum-sepolia',
  entities: {
    AccessControlEvent,
    RoleMembership,
    ContractOwnership,
    Contract,
  },
  store,
});

// Re-export handlers for SubQuery to discover
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
};
