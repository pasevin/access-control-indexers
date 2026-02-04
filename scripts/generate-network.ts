/**
 * Generate a new EVM network indexer from template
 * Usage: npx tsx scripts/generate-network.ts <network-id> <chain-id> <rpc-url> <name> [start-block]
 * 
 * Example:
 *   npx tsx scripts/generate-network.ts mantle-mainnet 5000 https://rpc.mantle.xyz "Mantle" 1
 */

import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);

if (args.length < 4) {
  console.error('Usage: npx tsx scripts/generate-network.ts <network-id> <chain-id> <rpc-url> <name> [start-block]');
  console.error('Example: npx tsx scripts/generate-network.ts mantle-mainnet 5000 https://rpc.mantle.xyz "Mantle" 1');
  process.exit(1);
}

const [networkId, chainIdStr, rpcUrl, name, startBlockStr] = args;
const chainId = parseInt(chainIdStr, 10);
const startBlock = startBlockStr ? parseInt(startBlockStr, 10) : 1;

if (isNaN(chainId)) {
  console.error('Error: chain-id must be a number');
  process.exit(1);
}

const baseDir = path.join(__dirname, '..', 'networks', 'evm');
const networkDir = path.join(baseDir, networkId);

if (fs.existsSync(networkDir)) {
  console.error(`Error: Network ${networkId} already exists at ${networkDir}`);
  process.exit(1);
}

// Create directory structure
const srcDir = path.join(networkDir, 'src');
fs.mkdirSync(srcDir, { recursive: true });

// Generate package.json
const packageJson = {
  name: `@oz-indexers/${networkId}`,
  version: '1.0.0',
  description: `OpenZeppelin Access Control indexer for ${name}`,
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
    directory: `networks/evm/${networkId}`,
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
};

fs.writeFileSync(path.join(networkDir, 'package.json'), JSON.stringify(packageJson, null, 2));

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
const project: EthereumProject = {
  specVersion: '1.0.0',
  version: '1.0.0',
  name: 'oz-access-control-${networkId}',
  description: 'OpenZeppelin Access Control and Ownable indexer for ${name}',
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
    chainId: '${chainId}',
    endpoint: ['${rpcUrl}'],
  },
  dataSources: [
    // AccessControl events
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: ${startBlock},
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
      startBlock: ${startBlock},
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
      startBlock: ${startBlock},
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

fs.writeFileSync(path.join(networkDir, 'project.ts'), projectTs);

// Generate tsconfig.json
const tsconfig = {
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
};

fs.writeFileSync(path.join(networkDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

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

fs.writeFileSync(path.join(networkDir, 'docker-compose.yml'), dockerCompose);

// Generate src/index.ts
const indexTs = `/**
 * ${name} Access Control Indexer
 * Network ID: ${networkId}
 * Chain ID: ${chainId}
 */

// Re-export all handlers
export {
  handleRoleGranted,
  handleRoleRevoked,
  handleRoleAdminChanged,
  handleOwnershipTransferred,
  handleOwnershipTransferStarted,
} from './handlers';
`;

fs.writeFileSync(path.join(srcDir, 'index.ts'), indexTs);

// Generate src/handlers.ts
const BT = '`';
const handlersTs = `/**
 * EVM Mapping Handlers for ${name}
 * Adapted for unified superset schema
 */

import { EthereumLog } from '@subql/types-ethereum';
import { AccessControlEvent, RoleMembership, ContractOwnership, Contract, EventType, ContractType } from './types';
import { normalizeEvmAddress, isZeroAddress } from '@oz-indexers/common';

const NETWORK_ID = '${networkId}';

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

fs.writeFileSync(path.join(srcDir, 'handlers.ts'), handlersTs);

console.log(`\nGenerated network: ${networkId}`);
console.log(`  Chain ID: ${chainId}`);
console.log(`  RPC URL: ${rpcUrl}`);
console.log(`  Name: ${name}`);
console.log(`  Start Block: ${startBlock}`);
console.log(`\nNext steps:`);
console.log(`  1. pnpm install`);
console.log(`  2. cd networks/evm/${networkId}`);
console.log(`  3. pnpm codegen && pnpm build`);
