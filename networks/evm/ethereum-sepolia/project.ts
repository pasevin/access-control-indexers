import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

/**
 * Sepolia Project Configuration
 * Chain ID: 11155111
 */
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "1.0.0",
  name: "oz-access-control-ethereum-sepolia",
  description: "OpenZeppelin Access Control and Ownable indexer for Sepolia",
  runner: {
    node: {
      name: "@subql/node-ethereum",
      version: "*",
      options: {
        // Skip fetching full transaction data since we only use event handlers
        // This reduces RPC calls and improves indexing performance
        skipTransactions: true,
      },
    },
    query: {
      name: "@subql/query",
      version: "*",
    },
  },
  repository: "https://github.com/pasevin/access-control-indexers",
  schema: {
    file: "../../../packages/schema/schema.graphql",
  },
  network: {
    chainId: "11155111",
    endpoint: [
      process.env.ETHEREUM_SEPOLIA_RPC_URL ||
        process.env.SEPOLIA_RPC_URL ||
        "https://ethereum-sepolia-rpc.publicnode.com",
    ],
  },
  // Start block 10200000: earliest OZ contract activity on Sepolia testnet
  dataSources: [
    // AccessControl events
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 10200000,
      options: {
        abi: "AccessControl",
      },
      assets: new Map([
        [
          "AccessControl",
          { file: "../../../packages/evm-handlers/abis/AccessControl.json" },
        ],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleRoleGranted",
            filter: { topics: ["RoleGranted(bytes32,address,address)"] },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleRoleRevoked",
            filter: { topics: ["RoleRevoked(bytes32,address,address)"] },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleRoleAdminChanged",
            filter: { topics: ["RoleAdminChanged(bytes32,bytes32,bytes32)"] },
          },
        ],
      },
    },
    // Ownable events
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 10200000,
      options: {
        abi: "Ownable",
      },
      assets: new Map([
        [
          "Ownable",
          { file: "../../../packages/evm-handlers/abis/Ownable.json" },
        ],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleOwnershipTransferred",
            filter: { topics: ["OwnershipTransferred(address,address)"] },
          },
        ],
      },
    },
    // Ownable2Step events
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 10200000,
      options: {
        abi: "Ownable2Step",
      },
      assets: new Map([
        [
          "Ownable2Step",
          { file: "../../../packages/evm-handlers/abis/Ownable2Step.json" },
        ],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleOwnershipTransferStarted",
            filter: { topics: ["OwnershipTransferStarted(address,address)"] },
          },
        ],
      },
    },
    // AccessControlDefaultAdminRules events
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 10200000,
      options: {
        abi: "AccessControlDefaultAdminRules",
      },
      assets: new Map([
        [
          "AccessControlDefaultAdminRules",
          {
            file: "../../../packages/evm-handlers/abis/AccessControlDefaultAdminRules.json",
          },
        ],
      ]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleDefaultAdminTransferScheduled",
            filter: {
              topics: ["DefaultAdminTransferScheduled(address,uint48)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleDefaultAdminTransferCanceled",
            filter: { topics: ["DefaultAdminTransferCanceled()"] },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleDefaultAdminDelayChangeScheduled",
            filter: {
              topics: ["DefaultAdminDelayChangeScheduled(uint48,uint48)"],
            },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleDefaultAdminDelayChangeCanceled",
            filter: { topics: ["DefaultAdminDelayChangeCanceled()"] },
          },
        ],
      },
    },
  ],
};

export default project;
