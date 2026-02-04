/**
 * Stellar Access Control Mapping Handlers
 * Adapted for unified superset schema
 */

// Polyfills for Stellar SDK
if (typeof TextEncoder === 'undefined') {
  (globalThis as any).TextEncoder = class TextEncoder {
    encode(input: string): Uint8Array {
      const bytes: number[] = [];
      for (let i = 0; i < input.length; i++) {
        let c = input.charCodeAt(i);
        if (c < 0x80) {
          bytes.push(c);
        } else if (c < 0x800) {
          bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
        } else if (c < 0xd800 || c >= 0xe000) {
          bytes.push(
            0xe0 | (c >> 12),
            0x80 | ((c >> 6) & 0x3f),
            0x80 | (c & 0x3f)
          );
        } else {
          i++;
          c = 0x10000 + (((c & 0x3ff) << 10) | (input.charCodeAt(i) & 0x3ff));
          bytes.push(
            0xf0 | (c >> 18),
            0x80 | ((c >> 12) & 0x3f),
            0x80 | ((c >> 6) & 0x3f),
            0x80 | (c & 0x3f)
          );
        }
      }
      return new Uint8Array(bytes);
    }
  };
}

if (typeof TextDecoder === 'undefined') {
  (globalThis as any).TextDecoder = class TextDecoder {
    decode(input: Uint8Array): string {
      let result = '';
      let i = 0;
      while (i < input.length) {
        const c = input[i];
        if (c < 0x80) {
          result += String.fromCharCode(c);
          i++;
        } else if ((c & 0xe0) === 0xc0) {
          result += String.fromCharCode(
            ((c & 0x1f) << 6) | (input[i + 1] & 0x3f)
          );
          i += 2;
        } else if ((c & 0xf0) === 0xe0) {
          result += String.fromCharCode(
            ((c & 0x0f) << 12) |
              ((input[i + 1] & 0x3f) << 6) |
              (input[i + 2] & 0x3f)
          );
          i += 3;
        } else {
          const codePoint =
            ((c & 0x07) << 18) |
            ((input[i + 1] & 0x3f) << 12) |
            ((input[i + 2] & 0x3f) << 6) |
            (input[i + 3] & 0x3f);
          const adjusted = codePoint - 0x10000;
          result += String.fromCharCode(
            0xd800 + (adjusted >> 10),
            0xdc00 + (adjusted & 0x3ff)
          );
          i += 4;
        }
      }
      return result;
    }
  };
}

import {
  AccessControlEvent,
  RoleMembership,
  ContractOwnership,
  Contract,
  EventType,
  ContractType,
} from '../types';
import { SorobanEvent } from '@subql/types-stellar';
import {
  isValidStellarAddress,
  isValidRoleSymbol,
  safeScValToNative,
  getContractAddress,
  hasValidLedgerInfo,
} from './validation';

// Network identifier for this indexer
const NETWORK_ID = 'stellar-testnet';

/**
 * Helper to generate event ID
 */
function generateEventId(eventId: string, suffix: string): string {
  return `${eventId}-${suffix}`;
}

/**
 * Helper to generate role membership ID
 */
function generateRoleMembershipId(
  contract: string,
  role: string,
  account: string
): string {
  return `${NETWORK_ID}-${contract}-${role}-${account}`;
}

/**
 * Helper to generate contract ID
 */
function generateContractId(contract: string): string {
  return `${NETWORK_ID}-${contract}`;
}

/**
 * Update or create contract metadata
 */
async function updateContractMetadata(
  contractAddress: string,
  type: ContractType,
  lastActivity: Date
): Promise<void> {
  const contractId = generateContractId(contractAddress);
  let contract = await Contract.get(contractId);

  if (!contract) {
    contract = Contract.create({
      id: contractId,
      network: NETWORK_ID,
      address: contractAddress,
      type: type,
      firstSeenAt: lastActivity,
      lastActivityAt: lastActivity,
    });
  } else {
    contract.lastActivityAt = lastActivity;
    if (
      type !== contract.type &&
      (type === ContractType.ACCESS_CONTROL || type === ContractType.OWNABLE)
    ) {
      contract.type = ContractType.ACCESS_CONTROL_OWNABLE;
    }
  }

  await contract.save();
}

/**
 * Handler for RoleGranted events
 */
export async function handleRoleGranted(event: SorobanEvent): Promise<void> {
  if (!hasValidLedgerInfo(event)) return;
  if (event.topic.length !== 3) return;

  const contractAddress = getContractAddress(event);
  if (!contractAddress) return;

  const role = safeScValToNative<string>(event.topic[1]);
  const account = safeScValToNative<string>(event.topic[2]);

  if (!isValidRoleSymbol(role) || !isValidStellarAddress(account)) return;

  let sender: string | undefined;
  if (event.value) {
    const decodedValue = safeScValToNative<Record<string, unknown>>(
      event.value
    );
    if (
      decodedValue &&
      typeof decodedValue === 'object' &&
      'caller' in decodedValue &&
      isValidStellarAddress(decodedValue.caller)
    ) {
      sender = decodedValue.caller as string;
    }
  }

  const timestamp = new Date(event.ledgerClosedAt);

  // Create event with superset schema
  const accessEvent = AccessControlEvent.create({
    id: generateEventId(event.id, 'granted'),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.ROLE_GRANTED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || 'unknown',
    role,
    account,
    sender,
  });

  // Create role membership with network prefix
  const membershipId = generateRoleMembershipId(contractAddress, role, account);
  const membership = RoleMembership.create({
    id: membershipId,
    network: NETWORK_ID,
    contract: contractAddress,
    role,
    account,
    grantedAt: timestamp,
    grantedBy: sender,
    txHash: event.transaction?.hash || 'unknown',
  });

  await updateContractMetadata(
    contractAddress,
    ContractType.ACCESS_CONTROL,
    timestamp
  );
  await Promise.all([accessEvent.save(), membership.save()]);
}

/**
 * Handler for RoleRevoked events
 */
export async function handleRoleRevoked(event: SorobanEvent): Promise<void> {
  if (!hasValidLedgerInfo(event)) return;
  if (event.topic.length !== 3) return;

  const contractAddress = getContractAddress(event);
  if (!contractAddress) return;

  const role = safeScValToNative<string>(event.topic[1]);
  const account = safeScValToNative<string>(event.topic[2]);

  if (!isValidRoleSymbol(role) || !isValidStellarAddress(account)) return;

  let sender: string | undefined;
  if (event.value) {
    const decodedValue = safeScValToNative<Record<string, unknown>>(
      event.value
    );
    if (
      decodedValue &&
      typeof decodedValue === 'object' &&
      'caller' in decodedValue &&
      isValidStellarAddress(decodedValue.caller)
    ) {
      sender = decodedValue.caller as string;
    }
  }

  const timestamp = new Date(event.ledgerClosedAt);

  const accessEvent = AccessControlEvent.create({
    id: generateEventId(event.id, 'revoked'),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.ROLE_REVOKED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || 'unknown',
    role,
    account,
    sender,
  });

  const membershipId = generateRoleMembershipId(contractAddress, role, account);
  await store.remove('RoleMembership', membershipId);
  await updateContractMetadata(
    contractAddress,
    ContractType.ACCESS_CONTROL,
    timestamp
  );
  await accessEvent.save();
}

/**
 * Handler for RoleAdminChanged events
 */
export async function handleRoleAdminChanged(
  event: SorobanEvent
): Promise<void> {
  if (!hasValidLedgerInfo(event)) return;
  if (event.topic.length !== 2) return;

  const contractAddress = getContractAddress(event);
  if (!contractAddress) return;

  const role = safeScValToNative<string>(event.topic[1]);
  if (!isValidRoleSymbol(role)) return;

  const eventData = safeScValToNative<Record<string, unknown>>(event.value);
  if (
    !eventData ||
    typeof eventData !== 'object' ||
    !('previous_admin_role' in eventData) ||
    !('new_admin_role' in eventData)
  )
    return;

  const previousAdminRole = eventData.previous_admin_role as string;
  const newAdminRole = eventData.new_admin_role as string;

  if (typeof previousAdminRole !== 'string' || !isValidRoleSymbol(newAdminRole))
    return;

  const timestamp = new Date(event.ledgerClosedAt);

  const accessEvent = AccessControlEvent.create({
    id: generateEventId(event.id, 'role-admin-changed'),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.ROLE_ADMIN_CHANGED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || 'unknown',
    role,
    previousAdminRole,
    newAdminRole,
  });

  await updateContractMetadata(
    contractAddress,
    ContractType.ACCESS_CONTROL,
    timestamp
  );
  await accessEvent.save();
}

/**
 * Handler for AdminTransferInitiated events (Stellar-specific)
 */
export async function handleAdminTransferInitiated(
  event: SorobanEvent
): Promise<void> {
  if (!hasValidLedgerInfo(event)) return;
  if (event.topic.length !== 2) return;

  const contractAddress = getContractAddress(event);
  if (!contractAddress) return;

  const currentAdmin = safeScValToNative<string>(event.topic[1]);
  if (!isValidStellarAddress(currentAdmin)) return;

  const eventData = safeScValToNative<Record<string, unknown>>(event.value);
  if (
    !eventData ||
    typeof eventData !== 'object' ||
    !('new_admin' in eventData) ||
    !('live_until_ledger' in eventData)
  )
    return;

  const newAdmin = eventData.new_admin as string;
  const liveUntilLedger = eventData.live_until_ledger;

  if (!isValidStellarAddress(newAdmin) || typeof liveUntilLedger !== 'number')
    return;

  const timestamp = new Date(event.ledgerClosedAt);

  const accessEvent = AccessControlEvent.create({
    id: generateEventId(event.id, 'admin-init'),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.ADMIN_TRANSFER_INITIATED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || 'unknown',
    previousAdmin: currentAdmin,
    newAdmin,
    liveUntilLedger,
  });

  await accessEvent.save();
}

/**
 * Handler for AdminTransferCompleted events (Stellar-specific)
 */
export async function handleAdminTransferCompleted(
  event: SorobanEvent
): Promise<void> {
  if (!hasValidLedgerInfo(event)) return;
  if (event.topic.length !== 2) return;

  const contractAddress = getContractAddress(event);
  if (!contractAddress) return;

  const newAdmin = safeScValToNative<string>(event.topic[1]);
  if (!isValidStellarAddress(newAdmin)) return;

  const eventData = safeScValToNative<Record<string, unknown>>(event.value);
  if (
    !eventData ||
    typeof eventData !== 'object' ||
    !('previous_admin' in eventData)
  )
    return;

  const previousAdmin = eventData.previous_admin as string;
  if (!isValidStellarAddress(previousAdmin)) return;

  const timestamp = new Date(event.ledgerClosedAt);

  const accessEvent = AccessControlEvent.create({
    id: generateEventId(event.id, 'admin-complete'),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.ADMIN_TRANSFER_COMPLETED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || 'unknown',
    previousAdmin,
    newAdmin,
  });

  await updateContractMetadata(
    contractAddress,
    ContractType.ACCESS_CONTROL,
    timestamp
  );
  await accessEvent.save();
}

/**
 * Handler for AdminRenounced events (Stellar-specific)
 */
export async function handleAdminRenounced(event: SorobanEvent): Promise<void> {
  if (!hasValidLedgerInfo(event)) return;
  if (event.topic.length !== 2) return;

  const contractAddress = getContractAddress(event);
  if (!contractAddress) return;

  const admin = safeScValToNative<string>(event.topic[1]);
  if (!isValidStellarAddress(admin)) return;

  const timestamp = new Date(event.ledgerClosedAt);

  const accessEvent = AccessControlEvent.create({
    id: generateEventId(event.id, 'admin-renounced'),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.ADMIN_RENOUNCED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || 'unknown',
    previousAdmin: admin,
  });

  await updateContractMetadata(
    contractAddress,
    ContractType.ACCESS_CONTROL,
    timestamp
  );
  await accessEvent.save();
}

/**
 * Handler for OwnershipTransferStarted events
 */
export async function handleOwnershipTransferStarted(
  event: SorobanEvent
): Promise<void> {
  if (!hasValidLedgerInfo(event)) return;
  if (event.topic.length !== 1) return;

  const contractAddress = getContractAddress(event);
  if (!contractAddress) return;

  const eventData = safeScValToNative<Record<string, unknown>>(event.value);
  if (
    !eventData ||
    typeof eventData !== 'object' ||
    !('old_owner' in eventData) ||
    !('new_owner' in eventData) ||
    !('live_until_ledger' in eventData)
  )
    return;

  const oldOwner = eventData.old_owner as string;
  const newOwner = eventData.new_owner as string;
  const liveUntilLedger = eventData.live_until_ledger;

  if (
    !isValidStellarAddress(oldOwner) ||
    !isValidStellarAddress(newOwner) ||
    typeof liveUntilLedger !== 'number'
  )
    return;

  const timestamp = new Date(event.ledgerClosedAt);

  const accessEvent = AccessControlEvent.create({
    id: generateEventId(event.id, 'ownership-start'),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.OWNERSHIP_TRANSFER_STARTED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || 'unknown',
    previousOwner: oldOwner,
    newOwner,
    liveUntilLedger,
  });

  await accessEvent.save();
}

/**
 * Handler for OwnershipTransferCompleted events
 */
export async function handleOwnershipTransferCompleted(
  event: SorobanEvent
): Promise<void> {
  if (!hasValidLedgerInfo(event)) return;
  if (event.topic.length !== 1) return;

  const contractAddress = getContractAddress(event);
  if (!contractAddress) return;

  const eventData = safeScValToNative<Record<string, unknown>>(event.value);
  if (
    !eventData ||
    typeof eventData !== 'object' ||
    !('new_owner' in eventData)
  )
    return;

  const newOwner = eventData.new_owner as string;
  if (!isValidStellarAddress(newOwner)) return;

  const timestamp = new Date(event.ledgerClosedAt);

  const accessEvent = AccessControlEvent.create({
    id: generateEventId(event.id, 'ownership'),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.OWNERSHIP_TRANSFER_COMPLETED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || 'unknown',
    newOwner,
  });

  const ownershipId = generateContractId(contractAddress);
  const ownership = ContractOwnership.create({
    id: ownershipId,
    network: NETWORK_ID,
    contract: contractAddress,
    owner: newOwner,
    transferredAt: timestamp,
    txHash: event.transaction?.hash || 'unknown',
  });

  await updateContractMetadata(
    contractAddress,
    ContractType.OWNABLE,
    timestamp
  );
  await Promise.all([accessEvent.save(), ownership.save()]);
}

/**
 * Handler for OwnershipRenounced events
 */
export async function handleOwnershipRenounced(
  event: SorobanEvent
): Promise<void> {
  if (!hasValidLedgerInfo(event)) return;
  if (event.topic.length !== 1) return;

  const contractAddress = getContractAddress(event);
  if (!contractAddress) return;

  const eventData = safeScValToNative<Record<string, unknown>>(event.value);
  if (
    !eventData ||
    typeof eventData !== 'object' ||
    !('old_owner' in eventData)
  )
    return;

  const oldOwner = eventData.old_owner as string;
  if (!isValidStellarAddress(oldOwner)) return;

  const timestamp = new Date(event.ledgerClosedAt);

  const accessEvent = AccessControlEvent.create({
    id: generateEventId(event.id, 'ownership-renounced'),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.OWNERSHIP_RENOUNCED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || 'unknown',
    previousOwner: oldOwner,
  });

  const ownershipId = generateContractId(contractAddress);
  await store.remove('ContractOwnership', ownershipId);
  await updateContractMetadata(
    contractAddress,
    ContractType.OWNABLE,
    timestamp
  );
  await accessEvent.save();
}
