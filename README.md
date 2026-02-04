# Access Control Indexers

OpenZeppelin Access Control and Ownable event indexers for multiple blockchain networks.

## Overview

This monorepo contains SubQuery indexers for indexing OpenZeppelin Access Control and Ownable events across 30 networks:

- **28 EVM Networks**: Ethereum, Arbitrum, Polygon, Base, Optimism, and more
- **2 Stellar Networks**: Mainnet and Testnet

All indexers output a unified GraphQL schema, enabling single-app consumption without network-specific customization.

## Structure

```
├── packages/
│   ├── schema/          # Unified GraphQL schema
│   ├── common/          # Shared utilities
│   ├── evm-handlers/    # Shared EVM mapping handlers
│   ├── network-config/  # Network definitions
│   └── client/          # Query SDK
├── networks/
│   ├── evm/             # 28 EVM network indexers
│   └── stellar/         # 2 Stellar network indexers
├── playgrounds/
│   ├── evm/             # EVM test contracts
│   └── stellar/         # Stellar test contracts
└── scripts/             # Utility scripts
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Build specific network
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

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Adding a Network](docs/ADDING_NETWORK.md)
- [Versioning](docs/VERSIONING.md)

## License

MIT
