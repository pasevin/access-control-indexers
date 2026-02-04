# Architecture

This document describes the architecture of the Access Control Indexers monorepo.

## Overview

The monorepo contains SubQuery indexers for OpenZeppelin Access Control and Ownable contracts across 30 blockchain networks. All indexers output a unified GraphQL schema, enabling consuming applications to query any network without customization.

## Directory Structure

```
access-control-indexers/
├── packages/           # Shared packages
├── networks/           # Network-specific indexers
├── playgrounds/        # Test contracts
├── scripts/            # Utility scripts
├── docs/               # Documentation
└── .github/            # CI/CD workflows
```

## Packages

### @oz-indexers/schema

The unified GraphQL schema used by all indexers. This is the single source of truth for the data model.

Key entities:

- `AccessControlEvent` - Historical event log
- `RoleMembership` - Current role assignments
- `ContractOwnership` - Current ownership state
- `Contract` - Contract metadata

### @oz-indexers/common

Shared utilities including:

- Address normalization (EVM, Stellar)
- Type definitions
- Validation functions
- ID generation utilities

### @oz-indexers/evm-handlers

Shared mapping handlers for all EVM-compatible networks:

- `handleRoleGranted`
- `handleRoleRevoked`
- `handleRoleAdminChanged`
- `handleOwnershipTransferred`
- `handleOwnershipTransferStarted`

Also includes OpenZeppelin contract ABIs.

### @oz-indexers/network-config

Network configurations sourced from ui-builder:

- RPC endpoints
- Chain IDs
- Explorer URLs
- Start blocks

### @oz-indexers/client

Unified TypeScript client for querying any indexer:

- Query events with filters
- Get role members
- Check ownership
- Supports all networks

## Networks

### EVM Networks (28)

All EVM-compatible networks use `@subql/node-ethereum` and share the same handler implementations. Each network folder contains:

```
networks/evm/{network}/
├── project.ts          # SubQuery project configuration
├── package.json        # Package metadata
├── tsconfig.json       # TypeScript configuration
├── docker-compose.yml  # Local development
└── src/
    ├── index.ts        # Handler exports
    └── handlers.ts     # Network-specific handlers
```

### Stellar Networks (2)

Stellar networks use `@subql/node-stellar` with Soroban event handlers:

```
networks/stellar/{network}/
├── project.ts
├── package.json
├── docker-compose.yml
└── src/
    ├── index.ts
    └── mappings/
        ├── mappingHandlers.ts
        └── validation.ts
```

## Event Flow

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Blockchain     │────▶│   SubQuery   │────▶│   PostgreSQL    │
│  (Events)       │     │   Node       │     │   (Indexed)     │
└─────────────────┘     └──────────────┘     └─────────────────┘
                                                      │
                                                      ▼
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Application    │◀────│   GraphQL    │◀────│   SubQuery      │
│  (Client SDK)   │     │   Query      │     │   Query         │
└─────────────────┘     └──────────────┘     └─────────────────┘
```

## Superset Schema Strategy

The schema is a superset of all events across all ecosystems:

| Feature           | EVM              | Stellar | Schema Field               |
| ----------------- | ---------------- | ------- | -------------------------- |
| Role events       | ✓                | ✓       | role, account, sender      |
| Ownership         | ✓                | ✓       | previousOwner, newOwner    |
| Two-step transfer | ✓ (Ownable2Step) | ✓       | OWNERSHIP_TRANSFER_STARTED |
| Admin transfer    | ✗                | ✓       | ADMIN*TRANSFER*\*          |
| Expiration        | ✗                | ✓       | liveUntilLedger            |

Fields are nullable when not applicable to a specific network.

## Data Flow

1. **Event Emission**: Smart contract emits Access Control/Ownable event
2. **Indexing**: SubQuery node captures and processes event
3. **Handler**: Mapping handler normalizes data to unified schema
4. **Storage**: Event stored in PostgreSQL with network identifier
5. **Query**: Applications query via GraphQL with network filter

## Versioning Strategy

- Each indexer has independent versioning in package.json
- Schema changes require updating all indexers
- CHANGELOG.md tracks contract version compatibility
- CI/CD records deployment CIDs
