/**
 * Stellar Testnet Access Control Indexer
 * Network ID: stellar-testnet
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
  networkId: 'stellar-testnet',
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
