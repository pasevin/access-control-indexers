/**
 * Stellar Access Control Mapping Handlers
 *
 * Shared handler implementations for Stellar AccessControl and Ownable events.
 * Uses the context module for network-specific configuration instead of
 * hardcoded constants.
 */

import type { SorobanEvent } from '@subql/types-stellar';
import { EventType, ContractType } from '@oz-indexers/common';
import { getContext } from './context';
import {
  isValidStellarAddress,
  isValidRoleSymbol,
  safeScValToNative,
  getContractAddress,
  hasValidLedgerInfo,
} from './validation';

// ============================================================================
// ID Generation Helpers
// ============================================================================

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
  networkId: string,
  contract: string,
  role: string,
  account: string
): string {
  return `${networkId}-${contract}-${role}-${account}`;
}

/**
 * Helper to generate contract ID
 */
function generateContractId(networkId: string, contract: string): string {
  return `${networkId}-${contract}`;
}

// ============================================================================
// Contract Metadata
// ============================================================================

/**
 * Update or create contract metadata
 */
async function updateContractMetadata(
  contractAddress: string,
  type: ContractType,
  lastActivity: Date
): Promise<void> {
  const {
    networkId,
    entities: { Contract },
  } = getContext();

  const contractId = generateContractId(networkId, contractAddress);
  let contract = await Contract.get(contractId);

  if (!contract) {
    contract = Contract.create({
      id: contractId,
      network: networkId,
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

// ============================================================================
// AccessControl Handlers
// ============================================================================

/**
 * Handler for RoleGranted events
 */
export async function handleRoleGranted(event: SorobanEvent): Promise<void> {
  if (!hasValidLedgerInfo(event)) return;
  if (event.topic.length !== 3) return;

  const {
    networkId,
    entities: { AccessControlEvent, RoleMembership },
  } = getContext();

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
    network: networkId,
    contract: contractAddress,
    eventType: EventType.ROLE_GRANTED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || '',
    role,
    account,
    sender,
  });

  // Create role membership with network prefix
  const membershipId = generateRoleMembershipId(
    networkId,
    contractAddress,
    role,
    account
  );
  const membership = RoleMembership.create({
    id: membershipId,
    network: networkId,
    contract: contractAddress,
    role,
    account,
    grantedAt: timestamp,
    grantedBy: sender,
    txHash: event.transaction?.hash || '',
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

  const {
    networkId,
    entities: { AccessControlEvent },
    store,
  } = getContext();

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
    network: networkId,
    contract: contractAddress,
    eventType: EventType.ROLE_REVOKED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || '',
    role,
    account,
    sender,
  });

  // Fix 2: Use store.remove consistently (NOT entity.remove)
  const membershipId = generateRoleMembershipId(
    networkId,
    contractAddress,
    role,
    account
  );
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

  const {
    networkId,
    entities: { AccessControlEvent },
  } = getContext();

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

  // Fix 6: Symmetric validation — validate both roles with isValidRoleSymbol
  if (!isValidRoleSymbol(previousAdminRole) || !isValidRoleSymbol(newAdminRole))
    return;

  const timestamp = new Date(event.ledgerClosedAt);

  const accessEvent = AccessControlEvent.create({
    id: generateEventId(event.id, 'role-admin-changed'),
    network: networkId,
    contract: contractAddress,
    eventType: EventType.ROLE_ADMIN_CHANGED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || '',
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

// ============================================================================
// Admin Transfer Handlers (Stellar-specific)
// ============================================================================

/**
 * Handler for AdminTransferInitiated events (Stellar-specific)
 */
export async function handleAdminTransferInitiated(
  event: SorobanEvent
): Promise<void> {
  if (!hasValidLedgerInfo(event)) return;
  if (event.topic.length !== 2) return;

  const {
    networkId,
    entities: { AccessControlEvent, ContractOwnership },
  } = getContext();

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
    network: networkId,
    contract: contractAddress,
    eventType: EventType.ADMIN_TRANSFER_INITIATED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || '',
    previousAdmin: currentAdmin,
    newAdmin,
    liveUntilLedger,
  });

  // Fix 5: Track pending admin transfer in ContractOwnership
  const ownershipId = generateContractId(networkId, contractAddress);
  let ownership = await ContractOwnership.get(ownershipId);
  if (!ownership) {
    ownership = ContractOwnership.create({
      id: ownershipId,
      network: networkId,
      contract: contractAddress,
      owner: currentAdmin,
      pendingOwner: newAdmin,
      pendingUntilLedger: liveUntilLedger as number,
      transferredAt: timestamp,
      txHash: event.transaction?.hash || '',
    });
  } else {
    ownership.pendingOwner = newAdmin;
    ownership.pendingUntilLedger = liveUntilLedger as number;
  }

  await updateContractMetadata(
    contractAddress,
    ContractType.ACCESS_CONTROL,
    timestamp
  );
  await Promise.all([accessEvent.save(), ownership.save()]);
}

/**
 * Handler for AdminTransferCompleted events (Stellar-specific)
 */
export async function handleAdminTransferCompleted(
  event: SorobanEvent
): Promise<void> {
  if (!hasValidLedgerInfo(event)) return;
  if (event.topic.length !== 2) return;

  const {
    networkId,
    entities: { AccessControlEvent, ContractOwnership },
  } = getContext();

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
    network: networkId,
    contract: contractAddress,
    eventType: EventType.ADMIN_TRANSFER_COMPLETED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || '',
    previousAdmin,
    newAdmin,
  });

  // Update ContractOwnership to reflect completed admin transfer
  const ownershipId = generateContractId(networkId, contractAddress);
  let ownership = await ContractOwnership.get(ownershipId);
  if (!ownership) {
    ownership = ContractOwnership.create({
      id: ownershipId,
      network: networkId,
      contract: contractAddress,
      owner: newAdmin,
      previousOwner: previousAdmin,
      transferredAt: timestamp,
      txHash: event.transaction?.hash || '',
    });
  } else {
    ownership.previousOwner = ownership.owner;
    ownership.owner = newAdmin;
    ownership.pendingOwner = undefined;
    ownership.pendingUntilLedger = undefined;
    ownership.transferredAt = timestamp;
    ownership.txHash = event.transaction?.hash || '';
  }

  await updateContractMetadata(
    contractAddress,
    ContractType.ACCESS_CONTROL,
    timestamp
  );
  await Promise.all([accessEvent.save(), ownership.save()]);
}

/**
 * Handler for AdminRenounced events (Stellar-specific)
 */
export async function handleAdminRenounced(
  event: SorobanEvent
): Promise<void> {
  if (!hasValidLedgerInfo(event)) return;
  if (event.topic.length !== 2) return;

  const {
    networkId,
    entities: { AccessControlEvent },
  } = getContext();

  const contractAddress = getContractAddress(event);
  if (!contractAddress) return;

  const admin = safeScValToNative<string>(event.topic[1]);
  if (!isValidStellarAddress(admin)) return;

  const timestamp = new Date(event.ledgerClosedAt);

  const accessEvent = AccessControlEvent.create({
    id: generateEventId(event.id, 'admin-renounced'),
    network: networkId,
    contract: contractAddress,
    eventType: EventType.ADMIN_RENOUNCED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || '',
    previousAdmin: admin,
  });

  await updateContractMetadata(
    contractAddress,
    ContractType.ACCESS_CONTROL,
    timestamp
  );
  await accessEvent.save();
}

// ============================================================================
// Ownership Handlers
// ============================================================================

/**
 * Handler for OwnershipTransferStarted events
 */
export async function handleOwnershipTransferStarted(
  event: SorobanEvent
): Promise<void> {
  if (!hasValidLedgerInfo(event)) return;
  if (event.topic.length !== 1) return;

  const {
    networkId,
    entities: { AccessControlEvent, ContractOwnership },
  } = getContext();

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
    network: networkId,
    contract: contractAddress,
    eventType: EventType.OWNERSHIP_TRANSFER_STARTED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || '',
    previousOwner: oldOwner,
    newOwner,
    liveUntilLedger,
  });

  // Fix 4: Update ContractOwnership with pendingOwner
  const ownershipId = generateContractId(networkId, contractAddress);
  let ownership = await ContractOwnership.get(ownershipId);
  if (!ownership) {
    ownership = ContractOwnership.create({
      id: ownershipId,
      network: networkId,
      contract: contractAddress,
      owner: oldOwner,
      pendingOwner: newOwner,
      pendingUntilLedger: liveUntilLedger as number,
      transferredAt: timestamp,
      txHash: event.transaction?.hash || '',
    });
  } else {
    ownership.pendingOwner = newOwner;
    ownership.pendingUntilLedger = liveUntilLedger as number;
  }

  await updateContractMetadata(
    contractAddress,
    ContractType.OWNABLE,
    timestamp
  );
  await Promise.all([accessEvent.save(), ownership.save()]);
}

/**
 * Handler for OwnershipTransferCompleted events
 */
export async function handleOwnershipTransferCompleted(
  event: SorobanEvent
): Promise<void> {
  if (!hasValidLedgerInfo(event)) return;
  if (event.topic.length !== 1) return;

  const {
    networkId,
    entities: { AccessControlEvent, ContractOwnership },
  } = getContext();

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

  // Fix 8: Look up existing ownership to populate previousOwner
  const ownershipId = generateContractId(networkId, contractAddress);
  const existingOwnership = await ContractOwnership.get(ownershipId);
  const previousOwner = existingOwnership?.owner;

  const accessEvent = AccessControlEvent.create({
    id: generateEventId(event.id, 'ownership'),
    network: networkId,
    contract: contractAddress,
    eventType: EventType.OWNERSHIP_TRANSFER_COMPLETED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || '',
    previousOwner,
    newOwner,
  });

  // Fix 3: Get-then-update for ContractOwnership
  let ownership = existingOwnership;
  if (!ownership) {
    ownership = ContractOwnership.create({
      id: ownershipId,
      network: networkId,
      contract: contractAddress,
      owner: newOwner,
      transferredAt: timestamp,
      txHash: event.transaction?.hash || '',
    });
  } else {
    ownership.previousOwner = ownership.owner;
    ownership.owner = newOwner;
    ownership.pendingOwner = undefined;
    ownership.pendingUntilLedger = undefined;
    ownership.transferredAt = timestamp;
    ownership.txHash = event.transaction?.hash || '';
  }

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

  const {
    networkId,
    entities: { AccessControlEvent },
    store,
  } = getContext();

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
    network: networkId,
    contract: contractAddress,
    eventType: EventType.OWNERSHIP_RENOUNCED,
    blockNumber: BigInt(event.ledger.sequence),
    timestamp,
    txHash: event.transaction?.hash || '',
    previousOwner: oldOwner,
  });

  // Fix 9: Use store.remove consistently
  const ownershipId = generateContractId(networkId, contractAddress);
  await store.remove('ContractOwnership', ownershipId);
  await updateContractMetadata(
    contractAddress,
    ContractType.OWNABLE,
    timestamp
  );
  await accessEvent.save();
}
