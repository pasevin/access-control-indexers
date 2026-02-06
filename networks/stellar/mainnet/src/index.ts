/**
 * Stellar Mainnet Access Control Indexer
 * Network ID: stellar-mainnet
 */
import {
  initializeHandlers,
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleAdminTransferInitiated,
  handleAdminTransferCompleted,
  handleAdminRenounced,
  handleOwnershipTransferStarted,
  handleOwnershipTransferCompleted,
  handleOwnershipRenounced,
} from '@oz-indexers/stellar-handlers';
import {
  AccessControlEvent,
  RoleMembership,
  ContractOwnership,
  Contract,
} from './types';

initializeHandlers({
  networkId: 'stellar-mainnet',
  entities: { AccessControlEvent, RoleMembership, ContractOwnership, Contract },
  store,
});

export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleAdminTransferInitiated,
  handleAdminTransferCompleted,
  handleAdminRenounced,
  handleOwnershipTransferStarted,
  handleOwnershipTransferCompleted,
  handleOwnershipRenounced,
};
