# Versioning

This document describes the versioning strategy for the Access Control Indexers monorepo.

## Version Types

### 1. Indexer Versions

Each network indexer has its own version in `package.json`:

```json
{
  "name": "@oz-indexers/ethereum-mainnet",
  "version": "1.2.0"
}
```

Indexer versions follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking schema changes, incompatible with previous queries
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, no schema changes

### 2. Schema Version

The shared schema (`packages/schema`) has its own version:

```json
{
  "name": "@oz-indexers/schema",
  "version": "1.0.0"
}
```

Schema version changes require updating all indexers.

### 3. OpenZeppelin Contract Versions

Each indexer tracks its compatibility with OpenZeppelin contracts:

```markdown
## Compatibility

- OpenZeppelin Contracts (EVM): v5.x
- OpenZeppelin Stellar Contracts: v0.5.x
```

## Changelog

Each indexer maintains a `CHANGELOG.md`:

```markdown
# Changelog

## [1.2.0] - 2026-02-03

### Added

- Support for Ownable2Step events

### Changed

- Updated start block for better performance

### Fixed

- Role admin changed event parsing

## [1.1.0] - 2026-01-15

### Added

- Initial release for Ethereum Mainnet
- Supports AccessControl, Ownable events
```

## Deployment Tracking

### Deployment CID

Each deployment generates a Content ID (CID):

```
networks/evm/ethereum-mainnet/.deployment-cid
```

### Deployment Record

```
indexer_version: 1.2.0
schema_version: 1.0.0
oz_contract_version: 5.x
deployed_at: 2026-02-03T10:00:00Z
cid: Qm...
environment: production
```

## Version Bump Workflow

### Minor Schema Change

1. Update `packages/schema/schema.graphql`
2. Bump schema version
3. Update all indexers that use the schema
4. Run `pnpm codegen` in each indexer
5. Test and deploy

### New Event Type

1. Add event to schema
2. Add handler to `packages/evm-handlers` or indexer
3. Bump minor version
4. Deploy affected indexers

### Bug Fix

1. Fix the bug
2. Bump patch version
3. Deploy affected indexer only

## Compatibility Matrix

| Schema Version | EVM Indexers | Stellar Indexers | OZ Contracts             |
| -------------- | ------------ | ---------------- | ------------------------ |
| 1.0.0          | 1.0.0        | 1.0.0            | EVM v5.x, Stellar v0.5.x |

## Breaking Changes

When making breaking changes:

1. Document in CHANGELOG.md
2. Update major version
3. Notify consuming applications
4. Consider running parallel versions during migration

## Git Tags

Release tags follow the pattern:

- Schema: `schema-v1.0.0`
- Indexer: `{network}-v1.0.0` (e.g., `ethereum-mainnet-v1.0.0`)

## Best Practices

1. **Never modify deployed schema fields** - Only add new optional fields
2. **Document compatibility** - Keep changelog updated
3. **Test before deploy** - Run local tests with playground contracts
4. **Version atomically** - Bump version in same commit as changes
5. **Track deployments** - Record CID and metadata for each deployment
