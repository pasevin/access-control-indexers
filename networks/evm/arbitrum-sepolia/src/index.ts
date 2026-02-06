/**
 * Arbitrum Sepolia Access Control Indexer
 * Network ID: arbitrum-sepolia
 */

import {
  initializeHandlers,
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
  handleDefaultAdminTransferScheduled,
  handleDefaultAdminTransferCanceled,
  handleDefaultAdminDelayChangeScheduled,
  handleDefaultAdminDelayChangeCanceled,
} from '@oz-indexers/evm-handlers';

import {
  AccessControlEvent,
  RoleMembership,
  ContractOwnership,
  Contract,
} from './types';

// Initialize shared handlers with network-specific configuration
initializeHandlers({
  networkId: 'arbitrum-sepolia',
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
  handleDefaultAdminTransferScheduled,
  handleDefaultAdminTransferCanceled,
  handleDefaultAdminDelayChangeScheduled,
  handleDefaultAdminDelayChangeCanceled,
};
