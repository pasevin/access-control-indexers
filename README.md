# Access Control Indexers

OpenZeppelin Access Control and Ownable event indexers for multiple blockchain networks.

## Overview

This monorepo contains SubQuery indexers for indexing OpenZeppelin Access Control and Ownable events across multiple blockchain networks:

- **EVM Networks**: Ethereum, Arbitrum, Polygon, Base, Optimism, and more
- **Stellar Networks**: Mainnet and Testnet

Run `pnpm run build:network --list` to see all supported networks.

All indexers output a unified GraphQL schema, enabling single-app consumption without network-specific customization.

## Structure

```
├── packages/
│   ├── schema/          # Unified GraphQL schema
│   ├── common/          # Shared utilities and types
│   ├── evm-handlers/    # Shared EVM mapping handlers (single source of truth)
│   ├── network-config/  # Network definitions
│   └── client/          # Query SDK
├── networks/
│   ├── evm/             # EVM network indexers (lightweight wrappers)
│   └── stellar/         # Stellar network indexers
├── playgrounds/
│   ├── evm/             # EVM test contracts
│   └── stellar/         # Stellar test contracts
└── scripts/             # Utility scripts
```

## Architecture

### Shared Handlers (EVM)

All EVM networks use a single shared handler implementation from `@oz-indexers/evm-handlers`. Each network's `index.ts` is a lightweight wrapper that:

1. Imports generated types from SubQuery codegen
2. Initializes the shared handlers with network-specific configuration
3. Re-exports the handlers for SubQuery to discover

```typescript
// Example: networks/evm/ethereum-mainnet/src/index.ts
import { initializeHandlers, handleRoleGranted, ... } from '@oz-indexers/evm-handlers';
import { AccessControlEvent, RoleMembership, ... } from './types';

initializeHandlers({
  networkId: 'ethereum-mainnet',
  entities: { AccessControlEvent, RoleMembership, ContractOwnership, Contract },
  store,
});

export { handleRoleGranted, handleRoleRevoked, ... };
```

**Benefits:**

- Single source of truth for handler logic
- Bug fixes propagate to all networks automatically
- Minimal code duplication
- No risk of handler drift between networks

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Building Networks

### Build a Specific Network (with codegen)

The `build:network` command runs codegen to regenerate types from the schema, then builds the project:

```bash
# Build any network by name
pnpm run build:network ethereum-mainnet
pnpm run build:network stellar-testnet
pnpm run build:network polygon-amoy

# List all available networks
pnpm run build:network --list

# Build all networks
pnpm run build:network --all
```

### Build by Ecosystem

```bash
# Build all EVM networks
pnpm run build:evm

# Build all Stellar networks
pnpm run build:stellar

# Codegen only (regenerate types)
pnpm run codegen           # All networks
pnpm run codegen:evm       # EVM networks only
pnpm run codegen:stellar   # Stellar networks only
```

### Build a Specific Package Directly

```bash
pnpm --filter @oz-indexers/ethereum-mainnet build
```

## Supported Networks

### EVM Mainnets

- Ethereum, Arbitrum One, Polygon, Polygon zkEVM, Base
- BNB Smart Chain, OP Mainnet, Avalanche C-Chain
- ZkSync Era, Scroll, Linea
- Polkadot Hub, Moonbeam, Moonriver

### EVM Testnets

- Sepolia, Arbitrum Sepolia, Polygon Amoy, Polygon zkEVM Cardona
- Base Sepolia, BSC Testnet, OP Sepolia, Avalanche Fuji
- ZkSync Era Sepolia, Scroll Sepolia, Linea Sepolia, Monad Testnet
- Polkadot Hub Testnet, Moonbase Alpha

### Stellar

- Mainnet, Testnet

## Unified Schema

All indexers output the same GraphQL schema with these entities:

- `AccessControlEvent` - Historical event log
- `RoleMembership` - Current role assignments
- `ContractOwnership` - Current ownership state
- `Contract` - Contract metadata

See [packages/schema/schema.graphql](packages/schema/schema.graphql) for the full schema.

## Available Scripts

| Command                         | Description                           |
| ------------------------------- | ------------------------------------- |
| `pnpm run build`                | Build all packages and networks       |
| `pnpm run build:network <name>` | Build a specific network with codegen |
| `pnpm run build:network --list` | List all available networks           |
| `pnpm run build:evm`            | Build all EVM networks                |
| `pnpm run build:stellar`        | Build all Stellar networks            |
| `pnpm run codegen`              | Regenerate types for all networks     |
| `pnpm run codegen:evm`          | Regenerate types for EVM networks     |
| `pnpm run codegen:stellar`      | Regenerate types for Stellar networks |
| `pnpm run test`                 | Run all tests                         |
| `pnpm run lint`                 | Lint all packages                     |
| `pnpm run clean`                | Clean build artifacts                 |
| `pnpm run generate:network`     | Generate a new network from template  |
| `pnpm run sync:schema`          | Sync schema across all networks       |

## Git Hooks

This repo uses [Husky](https://typicode.github.io/husky/) for git hooks:

- **pre-commit**: Runs `sync:schema` to verify all networks reference the shared schema correctly

Hooks are automatically installed when you run `pnpm install`.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Adding a Network](docs/ADDING_NETWORK.md)
- [Versioning](docs/VERSIONING.md)

## License

MIT
