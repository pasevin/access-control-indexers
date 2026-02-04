# EVM Playground

Test contracts for OpenZeppelin Access Control indexers on EVM networks.

## Requirements

- Node.js v22.10.0 or later (required for Hardhat 3)

## Contracts

- **AccessControlMock**: Standard AccessControl implementation
- **OwnableMock**: Standard Ownable implementation
- **Ownable2StepMock**: Two-step ownership transfer
- **CombinedMock**: Both AccessControl and Ownable2Step

## Setup

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile
```

## Deploy

```bash
# Deploy to local network
npx hardhat run scripts/deploy.ts

# Deploy to testnet (configure in hardhat.config.ts)
npx hardhat run scripts/deploy.ts --network sepolia
```

## Generate Test Events

```bash
# Generate events on local network
npx hardhat run scripts/generate-events.ts

# Generate events on testnet
npx hardhat run scripts/generate-events.ts --network sepolia
```

## Network Configuration

Edit `hardhat.config.ts` to add network configurations:

```typescript
networks: {
  sepolia: {
    url: "https://rpc.sepolia.org",
    accounts: [process.env.PRIVATE_KEY],
  },
  arbitrumSepolia: {
    url: "https://sepolia-rollup.arbitrum.io/rpc",
    accounts: [process.env.PRIVATE_KEY],
  },
}
```

## Events Generated

The `generate-events.ts` script creates:

- **RoleGranted**: Multiple role grants to different accounts
- **RoleRevoked**: Role revocation
- **RoleAdminChanged**: Changing role admin relationships
- **OwnershipTransferStarted**: Two-step transfer initiation
- **OwnershipTransferred**: Ownership completion

This provides comprehensive test data for validating the indexer.
