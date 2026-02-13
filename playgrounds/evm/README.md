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

# Copy the environment file and fill in your values
cp .env.example .env

# Compile contracts
npm run compile
```

### Environment Variables

Create a `.env` file in this directory (see `.env.example`):

| Variable            | Required      | Description                                                       |
| ------------------- | ------------- | ----------------------------------------------------------------- |
| `PRIVATE_KEY`       | Yes (testnet) | Private key for deployment and transactions                       |
| `ETHERSCAN_API_KEY` | Yes (verify)  | Etherscan API key ([get one here](https://etherscan.io/myapikey)) |
| `SEPOLIA_RPC_URL`   | No            | Override the default Sepolia RPC endpoint                         |

## Deploy

```bash
# Deploy to local network
npm run deploy

# Deploy to Sepolia testnet
npm run deploy:sepolia
```

## Verify Contracts

After deploying, verify the source code on Etherscan, Sourcify, and Blockscout:

```bash
# Verify all contracts on Sepolia
npm run verify:sepolia

# Verify a single contract
CONTRACT=accessControl npm run verify:sepolia
```

Valid `CONTRACT` values: `accessControl`, `ownable`, `ownable2Step`, `combined`.

## Generate Test Events

```bash
# Generate events on local network
npm run generate-events

# Generate events on Sepolia testnet
npm run generate-events:sepolia
```

## Network Configuration

The Sepolia network is pre-configured in `hardhat.config.ts`. Edit it to add more networks:

```typescript
networks: {
  sepolia: {
    type: 'http',
    url: process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  },
}
```

## Events Generated

The `generate-events.ts` script creates:

### AccessControl Events

- **RoleGranted**: Multiple role grants to different accounts
- **RoleRevoked**: Role revocation
- **RoleAdminChanged**: Changing role admin relationships

### Ownable/Ownable2Step Events

- **OwnershipTransferStarted**: Two-step transfer initiation
- **OwnershipTransferred**: Ownership completion

This provides comprehensive test data for validating the indexer against all OpenZeppelin Access Control contract variants.
