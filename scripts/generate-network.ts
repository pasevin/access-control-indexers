#!/usr/bin/env tsx
/**
 * Generate a new EVM network indexer
 *
 * Usage:
 *   pnpm run generate:network <network-id> <chain-id> <rpc-url> <name> [start-block]
 *
 * Example:
 *   pnpm run generate:network mantle-mainnet 5000 https://rpc.mantle.xyz "Mantle" 1
 *
 * This creates a new network using shared handlers from @oz-indexers/evm-handlers.
 */

import * as fs from "fs";
import * as path from "path";

const args = process.argv.slice(2);

if (args.length < 4) {
  console.error(`
Usage: pnpm run generate:network <network-id> <chain-id> <rpc-url> <name> [start-block]

Example:
  pnpm run generate:network mantle-mainnet 5000 https://rpc.mantle.xyz "Mantle" 1

Arguments:
  network-id   Unique identifier (e.g., mantle-mainnet, sonic-testnet)
  chain-id     EVM chain ID number
  rpc-url      RPC endpoint URL
  name         Human-readable network name
  start-block  Block to start indexing from (default: 1)
`);
  process.exit(1);
}

const [networkId, chainIdStr, rpcUrl, name, startBlockStr] = args;
const chainId = parseInt(chainIdStr, 10);
const startBlock = startBlockStr ? parseInt(startBlockStr, 10) : 1;

if (isNaN(chainId)) {
  console.error("Error: chain-id must be a number");
  process.exit(1);
}

const baseDir = path.join(__dirname, "..", "networks", "evm");
const networkDir = path.join(baseDir, networkId);

if (fs.existsSync(networkDir)) {
  console.error(`Error: Network ${networkId} already exists at ${networkDir}`);
  process.exit(1);
}

console.log(`\n🔨 Generating network: ${networkId}\n`);

// Create directory structure
const srcDir = path.join(networkDir, "src");
fs.mkdirSync(srcDir, { recursive: true });

// Generate package.json
const packageJson = {
  name: `@oz-indexers/${networkId}`,
  version: "1.0.0",
  description: `OpenZeppelin Access Control indexer for ${name}`,
  main: "dist/index.js",
  scripts: {
    build: "subql build",
    codegen: "subql codegen",
    "start:docker": "docker compose pull && docker compose up --remove-orphans",
    dev: "subql codegen && subql build",
    test: "vitest run",
    clean: "rm -rf dist .data",
  },
  repository: {
    type: "git",
    url: "https://github.com/pasevin/access-control-indexers.git",
    directory: `networks/evm/${networkId}`,
  },
  author: "OpenZeppelin",
  license: "MIT",
  dependencies: {
    "@oz-indexers/common": "workspace:*",
    "@oz-indexers/evm-handlers": "workspace:*",
    "@oz-indexers/network-config": "workspace:*",
    "@subql/common": "latest",
    "@subql/common-ethereum": "latest",
    "@subql/types-core": "latest",
    "@subql/types-ethereum": "latest",
    tslib: "^2.6.0",
  },
  devDependencies: {
    "@subql/cli": "latest",
    typescript: "^5.0.0",
    vitest: "^2.0.0",
  },
};

fs.writeFileSync(
  path.join(networkDir, "package.json"),
  JSON.stringify(packageJson, null, 2)
);
console.log("  ✓ package.json");

// Derive environment variable name for RPC URL from networkId
const envVarName = networkId.toUpperCase().replace(/-/g, "_") + "_RPC_URL";

// Generate project.ts
const projectTs = `import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from '@subql/types-ethereum';

/**
 * ${name} Project Configuration
 * Chain ID: ${chainId}
 */

// TODO: Add this network to packages/network-config/src/evm.ts then import here:
// import { NETWORK_EXPORT } from '@oz-indexers/network-config';
// const startBlock = Number(process.env.START_BLOCK) || NETWORK_EXPORT.startBlock;

// Start block can be overridden via START_BLOCK env var (e.g., for staging deployments)
const startBlock = Number(process.env.START_BLOCK) || ${startBlock};

const project: EthereumProject = {
  specVersion: '1.0.0',
  version: '1.0.0',
  name: 'oz-access-control-${networkId}',
  description: 'OpenZeppelin Access Control and Ownable indexer for ${name}',
  runner: {
    node: {
      name: '@subql/node-ethereum',
      version: '*',
      options: {
        // Skip fetching full transaction data since we only use event handlers
        // This reduces RPC calls and improves indexing performance
        skipTransactions: true,
      },
    },
    query: {
      name: '@subql/query',
      version: '*',
    },
  },
  repository: 'https://github.com/pasevin/access-control-indexers',
  schema: {
    file: '../../../packages/schema/schema.graphql',
  },
  network: {
    chainId: '${chainId}',
    endpoint: [process.env.${envVarName} || '${rpcUrl}'],
  },
  dataSources: [
    // AccessControl events
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock,
      options: {
        abi: 'AccessControl',
      },
      assets: new Map([
        ['AccessControl', { file: '../../../packages/evm-handlers/abis/AccessControl.json' }],
      ]),
      mapping: {
        file: './dist/index.js',
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: 'handleRoleGranted',
            filter: { topics: ['RoleGranted(bytes32,address,address)'] },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: 'handleRoleRevoked',
            filter: { topics: ['RoleRevoked(bytes32,address,address)'] },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: 'handleRoleAdminChanged',
            filter: { topics: ['RoleAdminChanged(bytes32,bytes32,bytes32)'] },
          },
        ],
      },
    },
    // Ownable events
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock,
      options: {
        abi: 'Ownable',
      },
      assets: new Map([
        ['Ownable', { file: '../../../packages/evm-handlers/abis/Ownable.json' }],
      ]),
      mapping: {
        file: './dist/index.js',
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: 'handleOwnershipTransferred',
            filter: { topics: ['OwnershipTransferred(address,address)'] },
          },
        ],
      },
    },
    // Ownable2Step events
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock,
      options: {
        abi: 'Ownable2Step',
      },
      assets: new Map([
        ['Ownable2Step', { file: '../../../packages/evm-handlers/abis/Ownable2Step.json' }],
      ]),
      mapping: {
        file: './dist/index.js',
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: 'handleOwnershipTransferStarted',
            filter: { topics: ['OwnershipTransferStarted(address,address)'] },
          },
        ],
      },
    },
    // AccessControlDefaultAdminRules events
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock,
      options: {
        abi: 'AccessControlDefaultAdminRules',
      },
      assets: new Map([
        ['AccessControlDefaultAdminRules', { file: '../../../packages/evm-handlers/abis/AccessControlDefaultAdminRules.json' }],
      ]),
      mapping: {
        file: './dist/index.js',
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: 'handleDefaultAdminTransferScheduled',
            filter: { topics: ['DefaultAdminTransferScheduled(address,uint48)'] },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: 'handleDefaultAdminTransferCanceled',
            filter: { topics: ['DefaultAdminTransferCanceled()'] },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: 'handleDefaultAdminDelayChangeScheduled',
            filter: { topics: ['DefaultAdminDelayChangeScheduled(uint48,uint48)'] },
          },
          {
            kind: EthereumHandlerKind.Event,
            handler: 'handleDefaultAdminDelayChangeCanceled',
            filter: { topics: ['DefaultAdminDelayChangeCanceled()'] },
          },
        ],
      },
    },
  ],
};

export default project;
`;

fs.writeFileSync(path.join(networkDir, "project.ts"), projectTs);
console.log("  ✓ project.ts");

// Generate tsconfig.json
const tsconfig = {
  compilerOptions: {
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    esModuleInterop: true,
    declaration: true,
    importHelpers: true,
    resolveJsonModule: true,
    module: "commonjs",
    outDir: "dist",
    rootDir: "src",
    target: "es2021",
    strict: true,
  },
  include: [
    "src/**/*",
    "node_modules/@subql/types-core/dist/global.d.ts",
    "node_modules/@subql/types-ethereum/dist/global.d.ts",
  ],
  exclude: ["src/**/*.test.ts", "src/**/*.spec.ts"],
};

fs.writeFileSync(
  path.join(networkDir, "tsconfig.json"),
  JSON.stringify(tsconfig, null, 2)
);
console.log("  ✓ tsconfig.json");

// Generate docker-compose.yml
const dockerCompose = `version: "3"

services:
  postgres:
    image: postgres:16-alpine
    ports:
      - 5432:5432
    volumes:
      - .data/postgres:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-postgres}
      POSTGRES_USER: \${POSTGRES_USER:-postgres}
      POSTGRES_DB: \${POSTGRES_DB:-postgres}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER:-postgres}"]
      interval: 5s
      timeout: 5s
      retries: 5

  subquery-node:
    image: subquerynetwork/subql-node-ethereum:latest
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    environment:
      DB_USER: \${POSTGRES_USER:-postgres}
      DB_PASS: \${POSTGRES_PASSWORD:-postgres}
      DB_DATABASE: \${POSTGRES_DB:-postgres}
      DB_HOST: postgres
      DB_PORT: 5432
    volumes:
      - ./:/app
      - ../../../packages/schema:/packages/schema:ro
      - ../../../packages/evm-handlers/abis:/packages/evm-handlers/abis:ro
    command:
      - -f=/app
      - --db-schema=app
      # Disable historical state tracking for better indexing performance.
      # Remove this flag if you need to query historical entity snapshots.
      - --disable-historical
      # Skip fetching full transaction data since we only use event handlers.
      # This significantly reduces the number of RPC requests per block.
      - --skipTransactions
      # Flush store cache asynchronously for better throughput during catch-up.
      - --store-cache-async
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/ready"]
      interval: 5s
      timeout: 10s
      retries: 30
      start_period: 30s

  graphql-engine:
    image: subquerynetwork/subql-query:latest
    ports:
      - 3000:3000
    depends_on:
      subquery-node:
        condition: service_healthy
    restart: unless-stopped
    environment:
      DB_USER: \${POSTGRES_USER:-postgres}
      DB_PASS: \${POSTGRES_PASSWORD:-postgres}
      DB_DATABASE: \${POSTGRES_DB:-postgres}
      DB_HOST: postgres
      DB_PORT: 5432
    command:
      - --name=app
      - --playground
`;

fs.writeFileSync(path.join(networkDir, "docker-compose.yml"), dockerCompose);
console.log("  ✓ docker-compose.yml");

// Generate src/index.ts using shared handlers
const displayName = networkId
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

const indexTs = `/**
 * ${displayName} Access Control Indexer
 * Network ID: ${networkId}
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
  networkId: '${networkId}',
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
`;

fs.writeFileSync(path.join(srcDir, "index.ts"), indexTs);
console.log("  ✓ src/index.ts (using shared handlers)");

console.log(`
✅ Generated network: ${networkId}
   Chain ID: ${chainId}
   RPC URL: ${rpcUrl}
   Name: ${name}
   Start Block: ${startBlock}

📝 Next steps:
   1. Add network config to packages/network-config/src/evm.ts
   2. Update project.ts to import startBlock from network-config
   3. pnpm install
   4. pnpm run build:network ${networkId}
`);
