# Adding a New Network

This guide explains how to add a new network indexer to the monorepo.

## Prerequisites

- Node.js 18+
- pnpm 8+
- Network RPC endpoint
- Chain ID

## Quick Start (EVM Networks)

For EVM-compatible networks, use the generator script:

```bash
npx tsx scripts/generate-network.ts <network-id> <chain-id> <rpc-url> "<name>"

# Example
npx tsx scripts/generate-network.ts mantle-mainnet 5000 https://rpc.mantle.xyz "Mantle"
```

## Manual Setup

### 1. Create Network Directory

```bash
mkdir -p networks/evm/{network-id}/src
```

### 2. Create package.json

```json
{
  "name": "@oz-indexers/{network-id}",
  "version": "1.0.0",
  "description": "OpenZeppelin Access Control indexer for {Network Name}",
  "dependencies": {
    "@oz-indexers/common": "workspace:*",
    "@oz-indexers/evm-handlers": "workspace:*",
    "@subql/common": "latest",
    "@subql/types-ethereum": "latest"
  }
}
```

### 3. Create project.ts

```typescript
import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from '@subql/types-ethereum';

const project: EthereumProject = {
  specVersion: '1.0.0',
  version: '1.0.0',
  name: 'oz-access-control-{network-id}',
  description: 'OpenZeppelin Access Control indexer for {Network Name}',
  runner: {
    node: { name: '@subql/node-ethereum', version: '*' },
    query: { name: '@subql/query', version: '*' },
  },
  schema: {
    file: '../../../packages/schema/schema.graphql', // Use shared schema
  },
  network: {
    chainId: '{chain-id}',
    endpoint: ['{rpc-url}'],
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: 1, // Set to first block with OZ contracts
      options: { abi: 'AccessControl' },
      assets: new Map([
        [
          'AccessControl',
          { file: '../../../packages/evm-handlers/abis/AccessControl.json' },
        ],
        [
          'Ownable',
          { file: '../../../packages/evm-handlers/abis/Ownable.json' },
        ],
        [
          'Ownable2Step',
          { file: '../../../packages/evm-handlers/abis/Ownable2Step.json' },
        ],
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
          {
            kind: EthereumHandlerKind.Event,
            handler: 'handleOwnershipTransferred',
            filter: { topics: ['OwnershipTransferred(address,address)'] },
          },
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
```

### 4. Create Handlers

Create `src/handlers.ts` with the network-specific NETWORK_ID:

```typescript
const NETWORK_ID = '{network-id}';

// Copy handler implementations from another EVM network
// Only change is the NETWORK_ID constant
```

### 5. Update Network Config (Optional)

Add to `packages/network-config/src/evm.ts`:

```typescript
export const NETWORK_NAME: EvmNetworkConfig = {
  id: '{network-id}',
  name: '{Network Name}',
  chainId: {chain-id},
  rpcUrl: '{rpc-url}',
  // ...
};
```

### 6. Test Locally

```bash
cd networks/evm/{network-id}
pnpm install
pnpm codegen
pnpm build
pnpm start:docker
```

### 7. Verify

1. Check GraphQL playground at http://localhost:3000
2. Deploy test contracts from `playgrounds/evm/`
3. Verify events are indexed correctly

## Adding Stellar Networks

Stellar networks require different handling:

1. Use `@subql/node-stellar` instead of `@subql/node-ethereum`
2. Copy handlers from `networks/stellar/testnet/`
3. Update NETWORK_ID and network configuration

## Checklist

- [ ] Network directory created
- [ ] package.json with correct dependencies
- [ ] project.ts referencing shared schema
- [ ] Handlers with correct NETWORK_ID
- [ ] tsconfig.json and docker-compose.yml
- [ ] Local testing passes
- [ ] Network added to network-config (optional)
- [ ] Documentation updated
