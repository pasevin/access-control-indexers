/**
 * Generate all EVM network folders
 * Run with: npx tsx scripts/generate-evm-networks.ts
 * 
 * This script generates the full project structure for all 28 EVM networks.
 * Each network gets separate dataSources for AccessControl, Ownable, and Ownable2Step.
 */

import * as fs from 'fs';
import * as path from 'path';

interface EvmNetworkConfig {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  startBlock: number;
}

const EVM_NETWORKS: EvmNetworkConfig[] = [
  // Mainnets
  { id: 'ethereum-mainnet', name: 'Ethereum', chainId: 1, rpcUrl: 'https://cloudflare-eth.com', startBlock: 4719568 },
  { id: 'arbitrum-mainnet', name: 'Arbitrum One', chainId: 42161, rpcUrl: 'https://arb1.arbitrum.io/rpc', startBlock: 1 },
  { id: 'polygon-mainnet', name: 'Polygon', chainId: 137, rpcUrl: 'https://polygon-rpc.com', startBlock: 1 },
  { id: 'polygon-zkevm-mainnet', name: 'Polygon zkEVM', chainId: 1101, rpcUrl: 'https://zkevm-rpc.com', startBlock: 1 },
  { id: 'base-mainnet', name: 'Base', chainId: 8453, rpcUrl: 'https://mainnet.base.org', startBlock: 1 },
  { id: 'bsc-mainnet', name: 'BNB Smart Chain', chainId: 56, rpcUrl: 'https://bsc-dataseed.binance.org', startBlock: 1 },
  { id: 'optimism-mainnet', name: 'OP Mainnet', chainId: 10, rpcUrl: 'https://mainnet.optimism.io', startBlock: 1 },
  { id: 'avalanche-mainnet', name: 'Avalanche C-Chain', chainId: 43114, rpcUrl: 'https://api.avax.network/ext/bc/C/rpc', startBlock: 1 },
  { id: 'zksync-era-mainnet', name: 'ZkSync Era', chainId: 324, rpcUrl: 'https://mainnet.era.zksync.io', startBlock: 1 },
  { id: 'scroll-mainnet', name: 'Scroll', chainId: 534352, rpcUrl: 'https://rpc.scroll.io', startBlock: 1 },
  { id: 'linea-mainnet', name: 'Linea', chainId: 59144, rpcUrl: 'https://rpc.linea.build', startBlock: 1 },
  { id: 'polkadot-hub', name: 'Polkadot Hub', chainId: 420420419, rpcUrl: 'https://services.polkadothub-rpc.com/mainnet', startBlock: 1 },
  { id: 'moonbeam-mainnet', name: 'Moonbeam', chainId: 1284, rpcUrl: 'https://rpc.api.moonbeam.network', startBlock: 1 },
  { id: 'moonriver-mainnet', name: 'Moonriver', chainId: 1285, rpcUrl: 'https://rpc.api.moonriver.moonbeam.network', startBlock: 1 },
  // Testnets
  { id: 'ethereum-sepolia', name: 'Sepolia', chainId: 11155111, rpcUrl: 'https://rpc.sepolia.org', startBlock: 1 },
  { id: 'arbitrum-sepolia', name: 'Arbitrum Sepolia', chainId: 421614, rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc', startBlock: 1 },
  { id: 'polygon-amoy', name: 'Polygon Amoy', chainId: 80002, rpcUrl: 'https://rpc-amoy.polygon.technology', startBlock: 1 },
  { id: 'polygon-zkevm-cardona', name: 'Polygon zkEVM Cardona', chainId: 2442, rpcUrl: 'https://rpc.cardona.zkevm-rpc.com', startBlock: 1 },
  { id: 'base-sepolia', name: 'Base Sepolia', chainId: 84532, rpcUrl: 'https://sepolia.base.org', startBlock: 1 },
  { id: 'bsc-testnet', name: 'BSC Testnet', chainId: 97, rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545', startBlock: 1 },
  { id: 'optimism-sepolia', name: 'OP Sepolia', chainId: 11155420, rpcUrl: 'https://sepolia.optimism.io', startBlock: 1 },
  { id: 'avalanche-fuji', name: 'Avalanche Fuji C-Chain', chainId: 43113, rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc', startBlock: 1 },
  { id: 'zksync-era-sepolia', name: 'ZkSync Era Sepolia', chainId: 300, rpcUrl: 'https://sepolia.era.zksync.dev', startBlock: 1 },
  { id: 'scroll-sepolia', name: 'Scroll Sepolia', chainId: 534351, rpcUrl: 'https://sepolia-rpc.scroll.io', startBlock: 1 },
  { id: 'linea-sepolia', name: 'Linea Sepolia', chainId: 59141, rpcUrl: 'https://rpc.sepolia.linea.build', startBlock: 1 },
  { id: 'monad-testnet', name: 'Monad Testnet', chainId: 10143, rpcUrl: 'https://testnet-rpc.monad.xyz', startBlock: 1 },
  { id: 'polkadot-hub-testnet', name: 'Polkadot Hub TestNet', chainId: 420420417, rpcUrl: 'https://services.polkadothub-rpc.com/testnet', startBlock: 1 },
  { id: 'moonbase-alpha-testnet', name: 'Moonbase Alpha', chainId: 1287, rpcUrl: 'https://rpc.api.moonbase.moonbeam.network', startBlock: 1 },
];

function generatePackageJson(network: EvmNetworkConfig): string {
  return JSON.stringify({
    name: "@oz-indexers/" + network.id,
    version: '1.0.0',
    description: "OpenZeppelin Access Control indexer for " + network.name,
    main: 'dist/index.js',
    scripts: {
      build: 'subql build',
      codegen: 'subql codegen',
      'start:docker': 'docker compose pull && docker compose up --remove-orphans',
      dev: 'subql codegen && subql build',
      test: 'vitest run',
      clean: 'rm -rf dist .data',
    },
    repository: {
      type: 'git',
      url: 'https://github.com/OpenZeppelin/access-control-indexers.git',
      directory: "networks/evm/" + network.id,
    },
    author: 'OpenZeppelin',
    license: 'MIT',
    dependencies: {
      '@oz-indexers/common': 'workspace:*',
      '@oz-indexers/evm-handlers': 'workspace:*',
      '@subql/common': 'latest',
      '@subql/common-ethereum': 'latest',
      '@subql/types-core': 'latest',
      '@subql/types-ethereum': 'latest',
      'tslib': '^2.6.0',
    },
    devDependencies: {
      '@subql/cli': 'latest',
      typescript: '^5.0.0',
      vitest: '^2.0.0',
    },
  }, null, 2);
}

function generateProjectTs(network: EvmNetworkConfig): string {
  return `import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from '@subql/types-ethereum';

/**
 * ${network.name} Project Configuration
 * Chain ID: ${network.chainId}
 */
const project: EthereumProject = {
  specVersion: '1.0.0',
  version: '1.0.0',
  name: 'oz-access-control-${network.id}',
  description: 'OpenZeppelin Access Control and Ownable indexer for ${network.name}',
  runner: {
    node: {
      name: '@subql/node-ethereum',
      version: '*',
    },
    query: {
      name: '@subql/query',
      version: '*',
    },
  },
  repository: 'https://github.com/OpenZeppelin/access-control-indexers',
  schema: {
    file: '../../../packages/schema/schema.graphql',
  },
  network: {
    chainId: '${network.chainId}',
    endpoint: ['${network.rpcUrl}'],
  },
  dataSources: [
    // AccessControl events
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: ${network.startBlock},
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
      startBlock: ${network.startBlock},
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
      startBlock: ${network.startBlock},
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
  ],
};

export default project;
`;
}

function generateTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      esModuleInterop: true,
      declaration: true,
      importHelpers: true,
      resolveJsonModule: true,
      module: 'commonjs',
      outDir: 'dist',
      rootDir: 'src',
      target: 'es2021',
      strict: true,
    },
    include: [
      'src/**/*',
      'node_modules/@subql/types-core/dist/global.d.ts',
      'node_modules/@subql/types-ethereum/dist/global.d.ts',
    ],
    exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
  }, null, 2);
}

function generateIndexTs(network: EvmNetworkConfig): string {
  return [
    "/**",
    " * " + network.name + " Access Control Indexer",
    " * Network ID: " + network.id,
    " * Chain ID: " + network.chainId,
    " */",
    "",
    "// Re-export all handlers",
    "export {",
    "  handleRoleGranted,",
    "  handleRoleRevoked,",
    "  handleRoleAdminChanged,",
    "  handleOwnershipTransferred,",
    "  handleOwnershipTransferStarted,",
    "} from './handlers';",
  ].join('\n');
}

function generateHandlersTs(network: EvmNetworkConfig): string {
  const BT = '`';
  return `/**
 * EVM Mapping Handlers for ${network.name}
 * Adapted for unified superset schema
 */

import { EthereumLog } from '@subql/types-ethereum';
import { AccessControlEvent, RoleMembership, ContractOwnership, Contract, EventType, ContractType } from './types';
import { normalizeEvmAddress, isZeroAddress } from '@oz-indexers/common';

const NETWORK_ID = '${network.id}';

function formatRole(role: string): string {
  const normalized = role.startsWith('0x') ? role : ${BT}0x\${role}${BT};
  return normalized.toLowerCase();
}

function normalizeAddress(address: string): string {
  return normalizeEvmAddress(address);
}

function generateEventId(txHash: string, logIndex: number): string {
  return ${BT}\${txHash}-\${logIndex}${BT};
}

function generateRoleMembershipId(contract: string, role: string, account: string): string {
  return ${BT}\${NETWORK_ID}-\${contract}-\${role}-\${account}${BT};
}

function generateContractId(contract: string): string {
  return ${BT}\${NETWORK_ID}-\${contract}${BT};
}

async function updateContractMetadata(contractAddress: string, type: ContractType, timestamp: Date): Promise<void> {
  const contractId = generateContractId(contractAddress);
  let contract = await Contract.get(contractId);

  if (!contract) {
    contract = Contract.create({
      id: contractId,
      network: NETWORK_ID,
      address: contractAddress,
      type,
      firstSeenAt: timestamp,
      lastActivityAt: timestamp,
    });
  } else {
    if ((contract.type === ContractType.ACCESS_CONTROL && type === ContractType.OWNABLE) ||
        (contract.type === ContractType.OWNABLE && type === ContractType.ACCESS_CONTROL)) {
      contract.type = ContractType.ACCESS_CONTROL_OWNABLE;
    }
    contract.lastActivityAt = timestamp;
  }
  await contract.save();
}

export async function handleRoleGranted(log: EthereumLog): Promise<void> {
  const contractAddress = normalizeAddress(log.address);
  const role = formatRole(log.topics[1]);
  const account = normalizeAddress(${BT}0x\${log.topics[2].slice(26)}${BT});
  const sender = normalizeAddress(${BT}0x\${log.topics[3].slice(26)}${BT});
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

  const event = AccessControlEvent.create({
    id: generateEventId(log.transactionHash, log.logIndex),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.ROLE_GRANTED,
    blockNumber: BigInt(log.blockNumber),
    timestamp,
    txHash: log.transactionHash,
    role,
    account,
    sender,
  });
  await event.save();

  const membershipId = generateRoleMembershipId(contractAddress, role, account);
  const membership = RoleMembership.create({
    id: membershipId,
    network: NETWORK_ID,
    contract: contractAddress,
    role,
    account,
    grantedAt: timestamp,
    grantedBy: sender,
    txHash: log.transactionHash,
  });
  await membership.save();

  await updateContractMetadata(contractAddress, ContractType.ACCESS_CONTROL, timestamp);
}

export async function handleRoleRevoked(log: EthereumLog): Promise<void> {
  const contractAddress = normalizeAddress(log.address);
  const role = formatRole(log.topics[1]);
  const account = normalizeAddress(${BT}0x\${log.topics[2].slice(26)}${BT});
  const sender = normalizeAddress(${BT}0x\${log.topics[3].slice(26)}${BT});
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

  const event = AccessControlEvent.create({
    id: generateEventId(log.transactionHash, log.logIndex),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.ROLE_REVOKED,
    blockNumber: BigInt(log.blockNumber),
    timestamp,
    txHash: log.transactionHash,
    role,
    account,
    sender,
  });
  await event.save();

  const membershipId = generateRoleMembershipId(contractAddress, role, account);
  await store.remove('RoleMembership', membershipId);
  await updateContractMetadata(contractAddress, ContractType.ACCESS_CONTROL, timestamp);
}

export async function handleRoleAdminChanged(log: EthereumLog): Promise<void> {
  const contractAddress = normalizeAddress(log.address);
  const role = formatRole(log.topics[1]);
  const previousAdminRole = formatRole(log.topics[2]);
  const newAdminRole = formatRole(log.topics[3]);
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

  const event = AccessControlEvent.create({
    id: generateEventId(log.transactionHash, log.logIndex),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.ROLE_ADMIN_CHANGED,
    blockNumber: BigInt(log.blockNumber),
    timestamp,
    txHash: log.transactionHash,
    role,
    previousAdminRole,
    newAdminRole,
  });
  await event.save();

  await updateContractMetadata(contractAddress, ContractType.ACCESS_CONTROL, timestamp);
}

export async function handleOwnershipTransferred(log: EthereumLog): Promise<void> {
  const contractAddress = normalizeAddress(log.address);
  const previousOwner = normalizeAddress(${BT}0x\${log.topics[1].slice(26)}${BT});
  const newOwner = normalizeAddress(${BT}0x\${log.topics[2].slice(26)}${BT});
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

  const eventType = isZeroAddress(newOwner) ? EventType.OWNERSHIP_RENOUNCED : EventType.OWNERSHIP_TRANSFERRED;

  const event = AccessControlEvent.create({
    id: generateEventId(log.transactionHash, log.logIndex),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType,
    blockNumber: BigInt(log.blockNumber),
    timestamp,
    txHash: log.transactionHash,
    previousOwner,
    newOwner: eventType === EventType.OWNERSHIP_RENOUNCED ? undefined : newOwner,
  });
  await event.save();

  const ownershipId = generateContractId(contractAddress);
  let ownership = await ContractOwnership.get(ownershipId);

  if (!ownership) {
    ownership = ContractOwnership.create({
      id: ownershipId,
      network: NETWORK_ID,
      contract: contractAddress,
      owner: newOwner,
      previousOwner,
      transferredAt: timestamp,
      txHash: log.transactionHash,
    });
  } else {
    ownership.previousOwner = previousOwner;
    ownership.owner = newOwner;
    ownership.pendingOwner = undefined;
    ownership.transferredAt = timestamp;
    ownership.txHash = log.transactionHash;
  }
  await ownership.save();

  await updateContractMetadata(contractAddress, ContractType.OWNABLE, timestamp);
}

export async function handleOwnershipTransferStarted(log: EthereumLog): Promise<void> {
  const contractAddress = normalizeAddress(log.address);
  const previousOwner = normalizeAddress(${BT}0x\${log.topics[1].slice(26)}${BT});
  const newOwner = normalizeAddress(${BT}0x\${log.topics[2].slice(26)}${BT});
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

  const event = AccessControlEvent.create({
    id: generateEventId(log.transactionHash, log.logIndex),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.OWNERSHIP_TRANSFER_STARTED,
    blockNumber: BigInt(log.blockNumber),
    timestamp,
    txHash: log.transactionHash,
    previousOwner,
    newOwner,
  });
  await event.save();

  const ownershipId = generateContractId(contractAddress);
  let ownership = await ContractOwnership.get(ownershipId);

  if (!ownership) {
    ownership = ContractOwnership.create({
      id: ownershipId,
      network: NETWORK_ID,
      contract: contractAddress,
      owner: previousOwner,
      pendingOwner: newOwner,
      transferredAt: timestamp,
      txHash: log.transactionHash,
    });
  } else {
    ownership.pendingOwner = newOwner;
  }
  await ownership.save();

  await updateContractMetadata(contractAddress, ContractType.OWNABLE, timestamp);
}
`;
}

function generateDockerCompose(): string {
  return `version: "3"

services:
  postgres:
    image: postgres:16-alpine
    ports:
      - 5432:5432
    volumes:
      - .data/postgres:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
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
      DB_USER: postgres
      DB_PASS: postgres
      DB_DATABASE: postgres
      DB_HOST: postgres
      DB_PORT: 5432
    volumes:
      - ./:/app
      - ../../../packages/schema:/app/packages/schema:ro
      - ../../../packages/evm-handlers/abis:/app/packages/evm-handlers/abis:ro
    command:
      - -f=/app
      - --db-schema=app
      - --disable-historical
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/ready"]
      interval: 3s
      timeout: 5s
      retries: 10

  graphql-engine:
    image: subquerynetwork/subql-query:latest
    ports:
      - 3000:3000
    depends_on:
      subquery-node:
        condition: service_healthy
    restart: unless-stopped
    environment:
      DB_USER: postgres
      DB_PASS: postgres
      DB_DATABASE: postgres
      DB_HOST: postgres
      DB_PORT: 5432
    command:
      - --name=app
      - --playground
`;
}

// Main execution
const baseDir = path.join(__dirname, '..', 'networks', 'evm');

for (const network of EVM_NETWORKS) {
  const networkDir = path.join(baseDir, network.id);
  const srcDir = path.join(networkDir, 'src');

  // Create directories
  fs.mkdirSync(srcDir, { recursive: true });

  // Write files
  fs.writeFileSync(path.join(networkDir, 'package.json'), generatePackageJson(network));
  fs.writeFileSync(path.join(networkDir, 'project.ts'), generateProjectTs(network));
  fs.writeFileSync(path.join(networkDir, 'tsconfig.json'), generateTsConfig());
  fs.writeFileSync(path.join(networkDir, 'docker-compose.yml'), generateDockerCompose());
  fs.writeFileSync(path.join(srcDir, 'index.ts'), generateIndexTs(network));
  fs.writeFileSync(path.join(srcDir, 'handlers.ts'), generateHandlersTs(network));

  console.log("Generated: " + network.id);
}

console.log("\nGenerated " + EVM_NETWORKS.length + " EVM network folders");
