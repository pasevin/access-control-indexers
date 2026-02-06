---
name: e2e-indexer-test
description: Run end-to-end indexer tests on EVM or Stellar networks. Deploys contracts, generates events, starts Docker indexer, and verifies indexed data via GraphQL. Use when testing indexer functionality, running E2E tests, or validating that events are indexed correctly.
---

# E2E Indexer Test

Run a full end-to-end test of the access control indexer against a live testnet.

## Prerequisites

- Docker running locally
- Private key with testnet ETH (Sepolia) funded
- pnpm dependencies installed at repo root

## Quick Reference

| Item               | Path                                                       |
| ------------------ | ---------------------------------------------------------- |
| EVM playground     | `playgrounds/evm/`                                         |
| Stellar playground | `playgrounds/stellar/`                                     |
| Network configs    | `networks/evm/<network>/` or `networks/stellar/<network>/` |
| Centralized config | `packages/network-config/src/evm.ts`                       |
| Schema             | `packages/schema/schema.graphql`                           |
| Build script       | `pnpm run build:network <network-id>`                      |

## EVM E2E Workflow

### Step 1: Set Temporary Start Block

Get the current chain block and set a high start block so the indexer catches up quickly.

```bash
# Get current block (example for Sepolia)
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://ethereum-sepolia-rpc.publicnode.com | python3 -c \
  "import sys,json; r=json.load(sys.stdin); print(int(r['result'], 16))"
```

Edit `networks/evm/<network>/project.ts`:

- Change all `startBlock` values to `(current_block - 500)`
- Add comment: `// TEMPORARY: Start block set high for E2E testing (original: <VALUE>)`

### Step 2: Build the Indexer

```bash
pnpm run build:network <network-id>
```

This runs codegen + build for the specific network.

### Step 3: Start Docker

```bash
cd networks/evm/<network>
rm -rf .data                    # Clean previous state
docker compose up -d            # Start all containers
```

Wait for all 3 containers to be healthy: `postgres`, `subquery-node`, `graphql-engine`.

Check status:

```bash
docker compose logs subquery-node --tail 20
```

Verify indexer is syncing:

```bash
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"query":"{ _metadata { lastProcessedHeight targetHeight } }"}' \
  http://localhost:3000
```

### Step 4: Deploy Contracts

```bash
cd playgrounds/evm
pnpm install  # if needed
PRIVATE_KEY=<key> npx hardhat run scripts/deploy.ts --network sepolia
```

Record the deployed contract addresses from the output.

### Step 5: Update & Run Event Generation

Edit `playgrounds/evm/scripts/generate-events.ts`:

- Update `DEPLOYED_CONTRACTS` with the new addresses from Step 4

```bash
PRIVATE_KEY=<key> npx hardhat run scripts/generate-events.ts --network sepolia
```

### Step 6: Wait for Finalization

The indexer only processes **finalized** blocks. On Sepolia PoS, finalization takes ~13 minutes.

Poll until the indexer has processed the blocks containing our events:

```bash
# Check finalized block
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["finalized",false],"id":1}' \
  <rpc-url> | python3 -c \
  "import sys,json; r=json.load(sys.stdin); print(int(r['result']['number'], 16))"

# Check indexer progress
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"query":"{ _metadata { lastProcessedHeight targetHeight } }"}' \
  http://localhost:3000
```

### Step 7: Verify Indexed Data

Query the GraphQL endpoint at `http://localhost:3000` to verify:

**Events indexed:**

```graphql
{
  accessControlEvents(
    filter: { contract: { equalTo: "<contract-address>" } }
    orderBy: BLOCK_NUMBER_ASC
  ) {
    nodes {
      eventType
      blockNumber
      role
      account
      sender
      previousAdminRole
      newAdminRole
      previousOwner
      newOwner
    }
    totalCount
  }
}
```

**State entities:**

```graphql
{
  roleMemberships(filter: { contract: { equalTo: "<contract-address>" } }) {
    nodes {
      contract
      role
      account
      grantedBy
    }
    totalCount
  }
  contractOwnerships(filter: { contract: { equalTo: "<contract-address>" } }) {
    nodes {
      contract
      owner
      previousOwner
    }
    totalCount
  }
  contracts(filter: { address: { equalTo: "<contract-address>" } }) {
    nodes {
      address
      type
    }
    totalCount
  }
}
```

### Step 8: Verification Checklist

Cross-reference against the generate-events.ts script output:

- [ ] **AccessControlMock**: 1 ROLE_GRANTED (deploy) + N from script phases
- [ ] **OwnableMock**: 1 OWNERSHIP_TRANSFER_COMPLETED (deploy)
- [ ] **Ownable2StepMock**: 1 OWNERSHIP_TRANSFER_COMPLETED (deploy)
- [ ] **CombinedMock**: 1 OWNERSHIP_TRANSFER_COMPLETED + 1 ROLE_GRANTED (deploy) + N from script
- [ ] RoleMemberships reflect current state (revoked roles are removed)
- [ ] ContractOwnerships show correct owners
- [ ] Contract types: ACCESS_CONTROL, OWNABLE, OWNABLE, ACCESS_CONTROL_OWNABLE

### Step 9: Cleanup

```bash
# Stop Docker
cd networks/evm/<network>
docker compose down

# Revert the temporary start block in project.ts
# Restore original startBlock values and remove TEMPORARY comment
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

## Troubleshooting

| Issue                      | Cause                               | Fix                                                          |
| -------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| Schema not found in Docker | Volume mount resolves to wrong path | Mount to `/packages/schema:ro` not `/app/packages/schema:ro` |
| Health check fails         | Container has no `curl`             | Use `wget --no-verbose --tries=1 --spider` instead           |
| Start block too high       | Block > chain height                | Lower start block, ensure it's below current finalized block |
| Events not indexed         | Blocks not finalized yet            | Wait ~13 min for Sepolia PoS finality                        |
| Indexer stuck              | RPC rate limit or connectivity      | Check `docker compose logs subquery-node`                    |
| grantRole reverts          | Admin role changed                  | Grant deployer the new admin role first (see Phase 5 fix)    |

## Hardhat Network Config

The playground uses Hardhat v3 with viem plugin. Network is configured in `playgrounds/evm/hardhat.config.ts`. Set `PRIVATE_KEY` and optionally `SEPOLIA_RPC_URL` as environment variables.
