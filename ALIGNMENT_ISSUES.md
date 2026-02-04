# Access Control Indexers - Alignment Issues Checklist

> **Generated**: 2026-02-04  
> **Status**: Pre-deployment verification required

This document tracks alignment issues between the access-control-indexers and the consuming applications (Role Manager, Stellar Adapter).

---

## Critical Issues (Will Break Integration)

### GraphQL Field Naming

- [ ] **`type` vs `eventType` mismatch**
  - Indexer schema uses `eventType: EventType!`
  - Stellar adapter queries for `type`
  - **Fix**: Update indexer schema to use `type` OR update adapter to use `eventType`

### Event Type Enum Values

- [x] **`OWNERSHIP_TRANSFERRED` vs `OWNERSHIP_TRANSFER_COMPLETED` mismatch** ✅ FIXED
  - Indexer now uses `OWNERSHIP_TRANSFER_COMPLETED` for completed ownership transfers
  - Matches Stellar adapter expectations and maintains consistency with `ADMIN_TRANSFER_COMPLETED`

### Field Mapping Issues

- [ ] **Missing `admin` field for ownership/admin transfer events**

  - Adapter expects `admin` field containing the current owner/admin who initiated transfer
  - Indexer uses `previousOwner` / `previousAdmin` instead
  - **Fix**: Add `admin` field alias to indexer OR update adapter field mapping

- [ ] **Missing `account` field mapping for ownership events**

  - Adapter expects `account` field containing the pending new owner
  - Indexer uses `newOwner` field instead
  - **Fix**: Ensure `account` is populated for these events OR update adapter mapping

- [ ] **`blockNumber` vs `blockHeight`/`ledger` mismatch**
  - Indexer schema uses `blockNumber: BigInt!`
  - Stellar adapter expects `blockHeight` (string) and `ledger` (string)
  - **Fix**: Add field aliases to indexer OR update adapter to use `blockNumber`

---

## Medium Priority Issues

### Event Type Coverage

- [ ] **`ROLE_ADMIN_CHANGED` not queried by adapter**

  - Indexer produces this event type
  - Adapter doesn't have queries for it
  - **Impact**: Role admin changes won't appear in history

- [ ] **`OWNERSHIP_RENOUNCED` not handled by adapter**

  - Indexer produces this event type
  - Adapter doesn't have specific handling for renounced ownership
  - **Impact**: Ownership renounce events may not display correctly

- [ ] **`ADMIN_RENOUNCED` not handled by adapter**
  - Indexer produces this event type (Stellar only)
  - Adapter doesn't have specific handling
  - **Impact**: Admin renounce events may not display correctly

---

## Verification Checklist

### Schema Alignment

- [ ] Verify all field names match between indexer schema and adapter types
- [ ] Verify all enum values match between indexer and adapter
- [ ] Verify field types are compatible (BigInt vs string, etc.)

### Query Compatibility

- [ ] Test `queryHistory()` returns expected results
- [ ] Test `discoverRoleIds()` works correctly
- [ ] Test `queryLatestGrants()` returns grant timestamps
- [ ] Test `queryPendingOwnershipTransfer()` detects pending transfers
- [ ] Test `queryPendingAdminTransfer()` detects pending admin transfers

### Integration Testing

- [ ] Deploy indexer to test environment
- [ ] Connect Stellar adapter to test indexer
- [ ] Verify Role Manager displays correct data
- [ ] Test two-step ownership flow end-to-end
- [ ] Test two-step admin transfer flow end-to-end

---

## Decision Required

Choose one approach:

### Option A: Fix Indexer Schema

- [ ] Rename `eventType` to `type` in schema
- [x] Add `OWNERSHIP_TRANSFER_COMPLETED` enum value ✅ DONE
- [ ] Add `admin` field for transfer started events
- [ ] Add `blockHeight` alias for `blockNumber`
- [ ] Ensure `account` field populated for ownership events

### Option B: Fix Stellar Adapter

- [ ] Update `IndexerHistoryEntry` interface to use `eventType`
- [ ] Update all GraphQL queries to use `eventType` filter
- [ ] ~~Change `OWNERSHIP_TRANSFER_COMPLETED` to `OWNERSHIP_TRANSFERRED`~~ (Not needed - indexer fixed instead)
- [ ] Map `previousOwner`/`previousAdmin` instead of `admin`
- [ ] Map `newOwner`/`newAdmin` instead of `account`
- [ ] Use `blockNumber` instead of `blockHeight`/`ledger`

---

## Event Type Mapping Reference

| Indexer EventType              | Adapter HistoryChangeType      | Status         |
| ------------------------------ | ------------------------------ | -------------- |
| `ROLE_GRANTED`                 | `GRANTED`                      | ✅ Aligned     |
| `ROLE_REVOKED`                 | `REVOKED`                      | ✅ Aligned     |
| `ROLE_ADMIN_CHANGED`           | -                              | ⚠️ Not handled |
| `OWNERSHIP_TRANSFER_COMPLETED` | `OWNERSHIP_TRANSFER_COMPLETED` | ✅ Aligned     |
| `OWNERSHIP_TRANSFER_STARTED`   | `OWNERSHIP_TRANSFER_STARTED`   | ✅ Aligned     |
| `OWNERSHIP_RENOUNCED`          | -                              | ⚠️ Not handled |
| `ADMIN_TRANSFER_INITIATED`     | `ADMIN_TRANSFER_INITIATED`     | ✅ Aligned     |
| `ADMIN_TRANSFER_COMPLETED`     | `ADMIN_TRANSFER_COMPLETED`     | ✅ Aligned     |
| `ADMIN_RENOUNCED`              | -                              | ⚠️ Not handled |

---

## Field Mapping Reference

### AccessControlEvent Fields

| Indexer Field     | Adapter Expects                | Status             |
| ----------------- | ------------------------------ | ------------------ |
| `id`              | `id`                           | ✅                 |
| `network`         | -                              | ✅                 |
| `contract`        | -                              | ✅                 |
| `eventType`       | `type`                         | ❌ Mismatch        |
| `blockNumber`     | `blockHeight`, `ledger`        | ❌ Mismatch        |
| `timestamp`       | `timestamp`                    | ✅                 |
| `txHash`          | `txHash`                       | ✅                 |
| `role`            | `role`                         | ✅                 |
| `account`         | `account`                      | ⚠️ Context differs |
| `sender`          | -                              | ✅                 |
| `previousOwner`   | `admin` (for started events)   | ❌ Mismatch        |
| `newOwner`        | `account` (for started events) | ❌ Mismatch        |
| `previousAdmin`   | `admin` (for admin events)     | ❌ Mismatch        |
| `newAdmin`        | `account` (for admin events)   | ❌ Mismatch        |
| `liveUntilLedger` | `liveUntilLedger`              | ✅                 |

---

## Notes

- EVM adapter does not have access-control module (future feature or different approach)
- Role Manager consumes data through adapters, not directly from indexers
- Graceful degradation exists in adapter when indexer unavailable
