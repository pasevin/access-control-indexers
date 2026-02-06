import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

/**
 * Moonbase Alpha Project Configuration
 * Chain ID: 1287
 */
import { MOONBASE_ALPHA_TESTNET } from "@oz-indexers/network-config";

// Start block can be overridden via START_BLOCK env var (e.g., for staging deployments)
const startBlock =
  Number(process.env.START_BLOCK) || MOONBASE_ALPHA_TESTNET.startBlock;

const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "1.0.0",
  name: "oz-access-control-moonbase-alpha-testnet",
  description:
    "OpenZeppelin Access Control and Ownable indexer for Moonbase Alpha",
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
    chainId: "1287",
    endpoint: [
      process.env.MOONBASE_ALPHA_TESTNET_RPC_URL ||
        "https://rpc.api.moonbase.moonbeam.network",
    ],
  },
  dataSources: [
    // AccessControl events
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock,
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
      startBlock,
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
      startBlock,
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
      startBlock,
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
