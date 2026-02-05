---
name: commit
description: Creates commits following the monorepo's Conventional Commits standard with proper GPG signing, scope selection, and pre-commit validation. Use when creating commits, writing commit messages, or when the user asks to commit changes.
---

# Commit Skill for Access Control Indexers Monorepo

This skill guides committing changes following the project's Conventional Commits standard.

## Critical Requirements

1. **Always run commits outside sandbox** - Full shell permissions required for GPG signing and pre-commit hooks
2. **Never use `--no-gpg-sign`** - All commits must be GPG-signed
3. **Never use `--no-verify`** - Pre-commit hooks must run

## Commit Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Rules

| Rule               | Requirement                                                          |
| ------------------ | -------------------------------------------------------------------- |
| Header max length  | 100 characters                                                       |
| Subject case       | lowercase (never sentence-case, start-case, pascal-case, upper-case) |
| Subject ending     | No period                                                            |
| Scope              | **Recommended** for clarity                                          |
| Body line length   | Max 100 characters                                                   |
| Body leading blank | Required if body present                                             |

## Commit Types

| Type       | Description                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature                                             |
| `fix`      | Bug fix                                                 |
| `docs`     | Documentation only                                      |
| `style`    | Formatting, whitespace (no code change)                 |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                                 |
| `test`     | Adding or correcting tests                              |
| `build`    | Build system or external dependencies                   |
| `ci`       | CI configuration changes                                |
| `chore`    | Other changes (not src or test)                         |
| `revert`   | Reverts a previous commit                               |
| `wip`      | Work in progress (avoid if possible)                    |

## Allowed Scopes

### Package Scopes

| Scope            | Description                   |
| ---------------- | ----------------------------- |
| `schema`         | GraphQL schema package        |
| `common`         | Shared common utilities       |
| `evm-handlers`   | EVM event handlers package    |
| `client`         | Indexer client package        |
| `network-config` | Network configuration package |

### Network Scopes

| Scope     | Description                            |
| --------- | -------------------------------------- |
| `evm`     | All EVM networks (generic changes)     |
| `stellar` | All Stellar networks (generic changes) |

For specific network changes, use the network name:

| Scope           | Description              |
| --------------- | ------------------------ |
| `ethereum`      | Ethereum mainnet/sepolia |
| `arbitrum`      | Arbitrum mainnet/sepolia |
| `optimism`      | Optimism mainnet/sepolia |
| `base`          | Base mainnet/sepolia     |
| `polygon`       | Polygon mainnet/amoy     |
| `polygon-zkevm` | Polygon zkEVM networks   |
| `avalanche`     | Avalanche mainnet/fuji   |
| `bsc`           | BSC mainnet/testnet      |
| `linea`         | Linea mainnet/sepolia    |
| `scroll`        | Scroll mainnet/sepolia   |
| `zksync`        | zkSync Era networks      |
| `moonbeam`      | Moonbeam mainnet         |
| `moonriver`     | Moonriver mainnet        |
| `moonbase`      | Moonbase Alpha testnet   |
| `monad`         | Monad testnet            |
| `polkadot-hub`  | Polkadot Asset Hub       |

### General Scopes

| Scope        | Description                  |
| ------------ | ---------------------------- |
| `scripts`    | Build/generation scripts     |
| `docs`       | Documentation                |
| `playground` | Playground/test environments |
| `config`     | Configuration files          |
| `deps`       | Dependencies                 |
| `ci`         | CI/CD configuration          |
| `tests`      | Test-related changes         |

## Commit Workflow

```bash
# 1. Stage changes
git add <files>

# 2. Commit with HEREDOC (recommended for multi-line messages)
git commit -m "$(cat <<'EOF'
feat(evm-handlers): add support for new access control events

Implements handlers for RoleGranted, RoleRevoked, and
OwnershipTransferred events with proper validation.
EOF
)"
```

## Pre-commit Hooks

The following checks run automatically:

1. **Schema sync validation**: `pnpm run sync:schema` - Ensures all networks reference the shared schema correctly

If pre-commit fails, fix the issues and commit again.

## Breaking Changes

Indicate breaking changes with `!` after type/scope:

```bash
feat(schema)!: change role field type to bytes32
```

Or with a footer:

```
feat(schema): change role field type

BREAKING CHANGE: Role field changed from string to bytes32.
All dependent code must update their queries.
```

## Common Pitfalls

### Sandbox Mode Errors

**Symptom**: Commit fails with permission errors, GPG signing fails, or hooks don't run.

**Fix**: Run commit commands with full shell permissions (outside sandbox).

### Subject Case Error

**Symptom**: `subject-case` error.

**Fix**: Use lowercase for the entire subject:

- Bad: `Add new feature`
- Good: `add new feature`

### Missing Scope Context

**Symptom**: Unclear what the change affects.

**Fix**: Always use a scope that identifies the affected package or network:

- Bad: `feat: add validation`
- Good: `feat(evm-handlers): add validation for role events`

## Examples from Commit History

```bash
# Feature with package scope
feat(evm-handlers): add initialization API for shared handlers

# Refactor with package scope
refactor(scripts): update generate-network to use shared handlers

# Fix with package scope
fix(schema): rename OWNERSHIP_TRANSFERRED to OWNERSHIP_TRANSFER_COMPLETED

# Documentation
docs: add alignment issues documentation

# Chore with broader scope
chore: add husky pre-commit hook for schema validation

# Network-specific changes
feat(evm): migrate all networks to shared handlers

# Playground changes
feat(playground): upgrade to Hardhat 3 with viem
```

## Quick Reference

```bash
# Stage and commit
git add . && git commit -m "feat(scope): description"

# View recent commit formats for reference
git log --oneline -10

# Amend last commit (only if not pushed!)
git commit --amend

# Check staged changes before committing
git diff --staged
```
