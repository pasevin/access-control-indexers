import {
  StellarDatasourceKind,
  StellarHandlerKind,
  StellarProject,
} from "@subql/types-stellar";

/**
 * Stellar Testnet Project Configuration
 * OpenZeppelin Access Control Indexer
 */
const project: StellarProject = {
  specVersion: "1.0.0",
  name: "oz-access-control-stellar-testnet",
  version: "1.0.0",
  runner: {
    node: {
      name: "@subql/node-stellar",
      version: "*",
    },
    query: {
      name: "@subql/query",
      version: "*",
    },
  },
  description:
    "OpenZeppelin Access Control and Ownable indexer for Stellar Testnet",
  repository: "https://github.com/OpenZeppelin/access-control-indexers",
  schema: {
    file: "../../../packages/schema/schema.graphql",
  },
  network: {
    chainId: "Test SDF Network ; September 2015",
    endpoint: [
      process.env.STELLAR_TESTNET_HORIZON_URL ||
        "https://horizon-testnet.stellar.org",
    ],
    sorobanEndpoint:
      process.env.STELLAR_TESTNET_SOROBAN_URL ||
      "https://soroban-testnet.stellar.org",
  },
  // Start block 14000: OZ Stellar AccessControl contracts deployment on testnet
  dataSources: [
    {
      kind: StellarDatasourceKind.Runtime,
      startBlock: 14000,
      mapping: {
        file: "./dist/index.js",
        handlers: [
          // Access Control Events
          {
            handler: "handleRoleGranted",
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ["role_granted"],
            },
          },
          {
            handler: "handleRoleRevoked",
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ["role_revoked"],
            },
          },
          {
            handler: "handleAdminTransferInitiated",
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ["admin_transfer_initiated"],
            },
          },
          {
            handler: "handleAdminTransferCompleted",
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ["admin_transfer_completed"],
            },
          },
          {
            handler: "handleAdminRenounced",
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ["admin_renounced"],
            },
          },
          {
            handler: "handleRoleAdminChanged",
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ["role_admin_changed"],
            },
          },
          // Ownable Events
          {
            handler: "handleOwnershipTransferStarted",
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ["ownership_transfer"],
            },
          },
          {
            handler: "handleOwnershipTransferCompleted",
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ["ownership_transfer_completed"],
            },
          },
          {
            handler: "handleOwnershipRenounced",
            kind: StellarHandlerKind.Event,
            filter: {
              topics: ["ownership_renounced"],
            },
          },
        ],
      },
    },
  ],
};

export default project;
