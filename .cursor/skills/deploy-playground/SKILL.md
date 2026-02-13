---
name: deploy-playground
description: Deploy, verify, and generate historical data for EVM playground contracts on testnets. Use when the user wants to deploy access control contracts for real-life testing, verify them on Etherscan, or generate on-chain event history. No Docker or indexer involved.
---

# Deploy Playground Contracts

Quickly deploy OpenZeppelin Access Control playground contracts to a testnet, verify them on Etherscan, and generate historical event data. This is for real-life testing — no indexer or Docker setup needed.

## Prerequisites

- Node.js >= 22.10.0
- Private key with testnet funds (e.g., Sepolia ETH)
- Etherscan API key (for verification)

## Quick Reference

| Item             | Path                                         |
| ---------------- | -------------------------------------------- |
| EVM playground   | `playgrounds/evm/`                           |
| Contracts        | `playgrounds/evm/contracts/`                 |
| Deploy script    | `playgrounds/evm/scripts/deploy.ts`          |
| Verify script    | `playgrounds/evm/scripts/verify.ts`          |
| Event gen script | `playgrounds/evm/scripts/generate-events.ts` |
| Hardhat config   | `playgrounds/evm/hardhat.config.ts`          |
| Environment file | `playgrounds/evm/.env`                       |

## Available Contracts

| Contract              | Key             | Description                                                          |
| --------------------- | --------------- | -------------------------------------------------------------------- |
| **AccessControlMock** | `accessControl` | Standard `AccessControl` with MINTER, BURNER, OPERATOR, PAUSER roles |
| **OwnableMock**       | `ownable`       | Standard `Ownable` with single-step ownership transfer               |
| **Ownable2StepMock**  | `ownable2Step`  | `Ownable2Step` with two-step ownership transfer                      |
| **CombinedMock**      | `combined`      | Both `AccessControl` + `Ownable2Step` combined                       |

## Workflow

### Step 1: Ask Which Contracts to Deploy

**IMPORTANT:** Before deploying, always ask the user which contracts they want using the `AskQuestion` tool.

Present the following options (allow multiple selection):

- AccessControlMock — Standard role-based access control
- OwnableMock — Single-step ownership
- Ownable2StepMock — Two-step ownership transfer
- CombinedMock — AccessControl + Ownable2Step combined
- All contracts (deploy everything)

If the user selects "All contracts", deploy all four. Otherwise deploy only the selected ones.

**Note:** The current `deploy.ts` script deploys all four contracts together. If the user wants a subset, you have two options:

1. **Preferred:** Run `deploy.ts` as-is (deploys all four) and inform the user which addresses correspond to their selection
2. **Alternative:** If deploying a single contract, use `npx hardhat console --network sepolia` or create a quick inline script

In most cases, deploying all four is fine since gas costs are minimal on testnets.

### Step 2: Ensure Environment Setup

Check if `playgrounds/evm/.env` exists. If not, ask the user for:

1. **PRIVATE_KEY** (required) — their private key for deployment
2. **ETHERSCAN_API_KEY** (required) — for contract verification

Create or update the `.env` file:

```
PRIVATE_KEY=<user-provided-key>
ETHERSCAN_API_KEY=<user-provided-key>
# SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

If `.env` already exists, read it to confirm both keys are present.

### Step 3: Install Dependencies & Compile

```bash
cd playgrounds/evm
npm install
npx hardhat compile
```

### Step 4: Deploy Contracts

```bash
cd playgrounds/evm
npx hardhat run scripts/deploy.ts --network sepolia
```

Record the deployed addresses and the deployer address from the output. The deployer address (derived from `PRIVATE_KEY`) becomes the owner and `DEFAULT_ADMIN_ROLE` holder on all contracts.

### Step 5: Verify Contracts on Etherscan

**Do this automatically after deployment — do not ask the user.**

1. Update `playgrounds/evm/scripts/verify.ts`:

   - Set `DEPLOYED_CONTRACTS` to the new addresses from Step 4
   - Set `CONSTRUCTOR_ARG` to the deployer address from Step 4

2. Run verification:

```bash
cd playgrounds/evm
npm run verify:sepolia
```

The script verifies on Etherscan, Sourcify, and Blockscout. It reads `ETHERSCAN_API_KEY` from `.env` via `dotenv`.

To verify a single contract:

```bash
CONTRACT=accessControl npm run verify:sepolia
```

Valid `CONTRACT` values: `accessControl`, `ownable`, `ownable2Step`, `combined`.

**Important:** Run verify commands sequentially (one at a time), not in parallel. Running them in parallel causes file descriptor exhaustion.

### Step 6: Update & Run Event Generation

1. Update `playgrounds/evm/scripts/generate-events.ts`:

   - Set `DEPLOYED_CONTRACTS` to the new addresses from Step 4

2. Run the script:

```bash
cd playgrounds/evm
npx hardhat run scripts/generate-events.ts --network sepolia
```

This generates ~22 on-chain events across the deployed contracts:

- 16 `RoleGranted` events
- 4 `RoleRevoked` events
- 2 `RoleAdminChanged` events

The script uses randomly generated addresses for test accounts (alice, bob, charlie, dave, eve).

### Step 7: Present Summary

After all steps complete, present the user with a summary table:

```
| Contract           | Address    | Etherscan Link                                      |
| ------------------ | ---------- | --------------------------------------------------- |
| AccessControlMock  | 0x...      | https://sepolia.etherscan.io/address/0x...#code     |
| OwnableMock        | 0x...      | https://sepolia.etherscan.io/address/0x...#code     |
| Ownable2StepMock   | 0x...      | https://sepolia.etherscan.io/address/0x...#code     |
| CombinedMock       | 0x...      | https://sepolia.etherscan.io/address/0x...#code     |

Owner/Admin: 0x... (deployer address)
Events generated: 22 total (16 granted, 4 revoked, 2 admin changed)
```

## Expected Event Counts (generate-events.ts)

| Phase   | Event Type                   | Count  | Contract                                    |
| ------- | ---------------------------- | ------ | ------------------------------------------- |
| Deploy  | ROLE_GRANTED (DEFAULT_ADMIN) | 1      | AccessControlMock                           |
| Deploy  | OWNERSHIP_TRANSFER_COMPLETED | 1 each | OwnableMock, Ownable2StepMock, CombinedMock |
| Deploy  | ROLE_GRANTED (DEFAULT_ADMIN) | 1      | CombinedMock                                |
| Phase 1 | ROLE_GRANTED                 | 8      | AccessControlMock                           |
| Phase 2 | ROLE_REVOKED                 | 3      | AccessControlMock                           |
| Phase 3 | ROLE_ADMIN_CHANGED           | 2      | AccessControlMock                           |
| Phase 4 | ROLE_GRANTED                 | 3      | CombinedMock                                |
| Phase 5 | ROLE_GRANTED + ROLE_REVOKED  | ~6     | AccessControlMock                           |

## Environment Variables

Loaded from `playgrounds/evm/.env` via `dotenv`.

| Variable            | Required | Description                                 |
| ------------------- | -------- | ------------------------------------------- |
| `PRIVATE_KEY`       | Yes      | Private key for deployment and transactions |
| `ETHERSCAN_API_KEY` | Yes      | Etherscan API key for contract verification |
| `SEPOLIA_RPC_URL`   | No       | Override the default Sepolia RPC endpoint   |

See `playgrounds/evm/.env.example` for the template.

## Troubleshooting

| Issue                                 | Cause                             | Fix                                                           |
| ------------------------------------- | --------------------------------- | ------------------------------------------------------------- |
| `ENFILE: file table overflow`         | Verify scripts run in parallel    | Run verify commands one at a time, sequentially               |
| Etherscan verify fails                | Rate limited or API key invalid   | Wait a minute and retry; check API key                        |
| Blockscout fails but Etherscan passes | Blockscout intermittent issues    | Ignore — Etherscan + Sourcify verification is sufficient      |
| `grantRole` reverts                   | Admin role was changed in Phase 3 | Grant deployer the new admin role first (script handles this) |
| Insufficient funds                    | Private key has no testnet ETH    | Fund the deployer address from a Sepolia faucet               |
| `ETHERSCAN_API_KEY not set`           | Missing `.env` or key not in file | Create/update `.env` with the key                             |

## npm Scripts Reference

```bash
npm run compile              # Compile Solidity contracts
npm run deploy               # Deploy to local network
npm run deploy:sepolia       # Deploy to Sepolia
npm run verify:sepolia       # Verify all contracts on Sepolia
npm run generate-events      # Generate events on local network
npm run generate-events:sepolia  # Generate events on Sepolia
```
