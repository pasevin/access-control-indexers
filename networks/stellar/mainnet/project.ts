import {
  StellarDatasourceKind,
  StellarHandlerKind,
  StellarProject,
} from '@subql/types-stellar';

/**
 * Stellar Mainnet Project Configuration
 * OpenZeppelin Access Control Indexer
 */
const project: StellarProject = {
  specVersion: '1.0.0',
  name: 'oz-access-control-stellar-mainnet',
  version: '1.0.0',
  runner: {
    node: {
      name: '@subql/node-stellar',
      version: '*',
    },
    query: {
      name: '@subql/query',
      version: '*',
    },
  },
  description:
    'OpenZeppelin Access Control and Ownable indexer for Stellar Mainnet',
  repository: 'https://github.com/OpenZeppelin/access-control-indexers',
  schema: {
    file: '../../../packages/schema/schema.graphql',
  },
  network: {
    chainId: 'Public Global Stellar Network ; September 2015',
    endpoint: [process.env.STELLAR_MAINNET_HORIZON_URL || 'https://horizon.stellar.org'],
    sorobanEndpoint: process.env.STELLAR_MAINNET_SOROBAN_URL || 'https://soroban-rpc.mainnet.stellar.gateway.fm',
  },
  dataSources: [
    {
      kind: StellarDatasourceKind.Runtime,
      startBlock: 60377000,
      mapping: {
        file: './dist/index.js',
        handlers: [
          // Access Control Events
          {
            handler: 'handleRoleGranted',
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ['role_granted'],
            },
          },
          {
            handler: 'handleRoleRevoked',
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ['role_revoked'],
            },
          },
          {
            handler: 'handleAdminTransferInitiated',
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ['admin_transfer_initiated'],
            },
          },
          {
            handler: 'handleAdminTransferCompleted',
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ['admin_transfer_completed'],
            },
          },
          {
            handler: 'handleAdminRenounced',
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ['admin_renounced'],
            },
          },
          {
            handler: 'handleRoleAdminChanged',
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ['role_admin_changed'],
            },
          },
          // Ownable Events
          {
            handler: 'handleOwnershipTransferStarted',
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ['ownership_transfer'],
            },
          },
          {
            handler: 'handleOwnershipTransferCompleted',
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ['ownership_transfer_completed'],
            },
          },
          {
            handler: 'handleOwnershipRenounced',
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ['ownership_renounced'],
            },
          },
        ],
      },
    },
  ],
};

export default project;
