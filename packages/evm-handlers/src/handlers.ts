/**
 * Shared EVM mapping handlers for OpenZeppelin Access Control events
 *
 * These handlers process events from AccessControl, Ownable, and Ownable2Step contracts.
 * They normalize data into the unified superset schema format.
 *
 * Each network indexer re-exports these handlers and provides network-specific configuration.
 */

import { EthereumLog } from '@subql/types-ethereum';
import {
  EventType,
  ContractType,
  generateEventId,
  generateRoleMembershipId,
  generateContractOwnershipId,
  generateContractId,
  isValidEvent,
} from '@oz-indexers/common';
import { formatRole, normalizeAddress, isOwnershipRenounce } from './utils';
import { validateEvmEvent } from './validation';
import { getContext } from './context';

/**
 * Updates or creates contract metadata
 */
async function updateContractMetadata(
  contractAddress: string,
  eventType: EventType,
  timestamp: Date
): Promise<void> {
  const {
    networkId: NETWORK_ID,
    entities: { Contract },
  } = getContext();
  const contractId = generateContractId(NETWORK_ID, contractAddress);
  let contract = await Contract.get(contractId);

  // Determine contract type based on event
  let type: ContractType;
  if (
    eventType === EventType.ROLE_GRANTED ||
    eventType === EventType.ROLE_REVOKED ||
    eventType === EventType.ROLE_ADMIN_CHANGED ||
    eventType === EventType.DEFAULT_ADMIN_TRANSFER_SCHEDULED ||
    eventType === EventType.DEFAULT_ADMIN_TRANSFER_CANCELED ||
    eventType === EventType.DEFAULT_ADMIN_DELAY_CHANGE_SCHEDULED ||
    eventType === EventType.DEFAULT_ADMIN_DELAY_CHANGE_CANCELED
  ) {
    type = ContractType.ACCESS_CONTROL;
  } else {
    type = ContractType.OWNABLE;
  }

  if (!contract) {
    contract = Contract.create({
      id: contractId,
      network: NETWORK_ID,
      address: contractAddress,
      type,
      firstSeenAt: timestamp,
      lastActivityAt: timestamp,
    });
  } else {
    // Update type if we see both AccessControl and Ownable events
    if (
      (contract.type === ContractType.ACCESS_CONTROL &&
        type === ContractType.OWNABLE) ||
      (contract.type === ContractType.OWNABLE &&
        type === ContractType.ACCESS_CONTROL)
    ) {
      contract.type = ContractType.ACCESS_CONTROL_OWNABLE;
    }
    contract.lastActivityAt = timestamp;
  }

  await contract.save();
}

/**
 * Handles RoleGranted events from AccessControl contracts
 *
 * Event: RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
 */
export async function handleRoleGranted(log: EthereumLog): Promise<void> {
  const {
    networkId: NETWORK_ID,
    entities: { AccessControlEvent, RoleMembership },
  } = getContext();

  const validation = validateEvmEvent(
    log.topics,
    'RoleGranted',
    NETWORK_ID,
    log.blockNumber,
    log.transactionHash
  );
  if (!isValidEvent(validation)) return;

  const contractAddress = normalizeAddress(log.address);
  const role = formatRole(log.topics[1]);
  const account = normalizeAddress(`0x${log.topics[2].slice(26)}`);
  const sender = normalizeAddress(`0x${log.topics[3].slice(26)}`);
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

  // Create event record
  const event = AccessControlEvent.create({
    id: generateEventId(log.transactionHash, log.logIndex),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.ROLE_GRANTED,
    blockNumber: BigInt(log.blockNumber),
    timestamp,
    txHash: log.transactionHash,
    role,
    account,
    sender,
  });
  await event.save();

  // Create/update role membership
  const membershipId = generateRoleMembershipId(
    NETWORK_ID,
    contractAddress,
    role,
    account
  );
  const membership = RoleMembership.create({
    id: membershipId,
    network: NETWORK_ID,
    contract: contractAddress,
    role,
    account,
    grantedAt: timestamp,
    grantedBy: sender,
    txHash: log.transactionHash,
  });
  await membership.save();

  // Update contract metadata
  await updateContractMetadata(
    contractAddress,
    EventType.ROLE_GRANTED,
    timestamp
  );
}

/**
 * Handles RoleRevoked events from AccessControl contracts
 *
 * Event: RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
 */
export async function handleRoleRevoked(log: EthereumLog): Promise<void> {
  const {
    networkId: NETWORK_ID,
    entities: { AccessControlEvent },
    store,
  } = getContext();

  const validation = validateEvmEvent(
    log.topics,
    'RoleRevoked',
    NETWORK_ID,
    log.blockNumber,
    log.transactionHash
  );
  if (!isValidEvent(validation)) return;

  const contractAddress = normalizeAddress(log.address);
  const role = formatRole(log.topics[1]);
  const account = normalizeAddress(`0x${log.topics[2].slice(26)}`);
  const sender = normalizeAddress(`0x${log.topics[3].slice(26)}`);
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

  // Create event record
  const event = AccessControlEvent.create({
    id: generateEventId(log.transactionHash, log.logIndex),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.ROLE_REVOKED,
    blockNumber: BigInt(log.blockNumber),
    timestamp,
    txHash: log.transactionHash,
    role,
    account,
    sender,
  });
  await event.save();

  // Remove role membership
  const membershipId = generateRoleMembershipId(
    NETWORK_ID,
    contractAddress,
    role,
    account
  );
  await store.remove('RoleMembership', membershipId);

  // Update contract metadata
  await updateContractMetadata(
    contractAddress,
    EventType.ROLE_REVOKED,
    timestamp
  );
}

/**
 * Handles RoleAdminChanged events from AccessControl contracts
 *
 * Event: RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
 */
export async function handleRoleAdminChanged(log: EthereumLog): Promise<void> {
  const {
    networkId: NETWORK_ID,
    entities: { AccessControlEvent },
  } = getContext();

  const validation = validateEvmEvent(
    log.topics,
    'RoleAdminChanged',
    NETWORK_ID,
    log.blockNumber,
    log.transactionHash
  );
  if (!isValidEvent(validation)) return;

  const contractAddress = normalizeAddress(log.address);
  const role = formatRole(log.topics[1]);
  const previousAdminRole = formatRole(log.topics[2]);
  const newAdminRole = formatRole(log.topics[3]);
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

  // Create event record
  const event = AccessControlEvent.create({
    id: generateEventId(log.transactionHash, log.logIndex),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.ROLE_ADMIN_CHANGED,
    blockNumber: BigInt(log.blockNumber),
    timestamp,
    txHash: log.transactionHash,
    role,
    previousAdminRole,
    newAdminRole,
  });
  await event.save();

  // Update contract metadata
  await updateContractMetadata(
    contractAddress,
    EventType.ROLE_ADMIN_CHANGED,
    timestamp
  );
}

/**
 * Handles OwnershipTransferred events from Ownable contracts
 *
 * Event: OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
 */
export async function handleOwnershipTransferred(
  log: EthereumLog
): Promise<void> {
  const {
    networkId: NETWORK_ID,
    entities: { AccessControlEvent, ContractOwnership },
  } = getContext();

  const validation = validateEvmEvent(
    log.topics,
    'OwnershipTransferred',
    NETWORK_ID,
    log.blockNumber,
    log.transactionHash
  );
  if (!isValidEvent(validation)) return;

  const contractAddress = normalizeAddress(log.address);
  const previousOwner = normalizeAddress(`0x${log.topics[1].slice(26)}`);
  const newOwner = normalizeAddress(`0x${log.topics[2].slice(26)}`);
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

  // Determine if this is a renounce (transfer to zero address)
  const eventType = isOwnershipRenounce(newOwner)
    ? EventType.OWNERSHIP_RENOUNCED
    : EventType.OWNERSHIP_TRANSFER_COMPLETED;

  // Create event record
  const event = AccessControlEvent.create({
    id: generateEventId(log.transactionHash, log.logIndex),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType,
    blockNumber: BigInt(log.blockNumber),
    timestamp,
    txHash: log.transactionHash,
    previousOwner,
    newOwner:
      eventType === EventType.OWNERSHIP_RENOUNCED ? undefined : newOwner,
  });
  await event.save();

  // Update contract ownership
  const ownershipId = generateContractOwnershipId(NETWORK_ID, contractAddress);
  let ownership = await ContractOwnership.get(ownershipId);

  if (!ownership) {
    ownership = ContractOwnership.create({
      id: ownershipId,
      network: NETWORK_ID,
      contract: contractAddress,
      owner: newOwner,
      previousOwner,
      transferredAt: timestamp,
      txHash: log.transactionHash,
    });
  } else {
    ownership.previousOwner = previousOwner;
    ownership.owner = newOwner;
    ownership.pendingOwner = undefined; // Clear pending owner after transfer
    ownership.transferredAt = timestamp;
    ownership.txHash = log.transactionHash;
  }
  await ownership.save();

  // Update contract metadata
  await updateContractMetadata(contractAddress, eventType, timestamp);
}

/**
 * Handles OwnershipTransferStarted events from Ownable2Step contracts
 *
 * Event: OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner)
 */
export async function handleOwnershipTransferStarted(
  log: EthereumLog
): Promise<void> {
  const {
    networkId: NETWORK_ID,
    entities: { AccessControlEvent, ContractOwnership },
  } = getContext();

  const validation = validateEvmEvent(
    log.topics,
    'OwnershipTransferStarted',
    NETWORK_ID,
    log.blockNumber,
    log.transactionHash
  );
  if (!isValidEvent(validation)) return;

  const contractAddress = normalizeAddress(log.address);
  const previousOwner = normalizeAddress(`0x${log.topics[1].slice(26)}`);
  const newOwner = normalizeAddress(`0x${log.topics[2].slice(26)}`);
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

  // Create event record
  const event = AccessControlEvent.create({
    id: generateEventId(log.transactionHash, log.logIndex),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.OWNERSHIP_TRANSFER_STARTED,
    blockNumber: BigInt(log.blockNumber),
    timestamp,
    txHash: log.transactionHash,
    previousOwner,
    newOwner,
  });
  await event.save();

  // Update contract ownership with pending owner
  const ownershipId = generateContractOwnershipId(NETWORK_ID, contractAddress);
  let ownership = await ContractOwnership.get(ownershipId);

  if (!ownership) {
    ownership = ContractOwnership.create({
      id: ownershipId,
      network: NETWORK_ID,
      contract: contractAddress,
      owner: previousOwner,
      pendingOwner: newOwner,
      transferredAt: timestamp,
      txHash: log.transactionHash,
    });
  } else {
    ownership.pendingOwner = newOwner;
  }
  await ownership.save();

  // Update contract metadata
  await updateContractMetadata(
    contractAddress,
    EventType.OWNERSHIP_TRANSFER_STARTED,
    timestamp
  );
}

/**
 * Handles DefaultAdminTransferScheduled events from AccessControlDefaultAdminRules contracts
 *
 * Event: DefaultAdminTransferScheduled(address indexed newAdmin, uint48 acceptSchedule)
 */
export async function handleDefaultAdminTransferScheduled(
  log: EthereumLog
): Promise<void> {
  const {
    networkId: NETWORK_ID,
    entities: { AccessControlEvent, ContractOwnership },
  } = getContext();

  const validation = validateEvmEvent(
    log.topics,
    'DefaultAdminTransferScheduled',
    NETWORK_ID,
    log.blockNumber,
    log.transactionHash
  );
  if (!isValidEvent(validation)) return;

  const contractAddress = normalizeAddress(log.address);
  const newAdmin = normalizeAddress(`0x${log.topics[1].slice(26)}`);
  // acceptSchedule is in the data field (non-indexed uint48)
  // log.data includes 0x prefix, so first 32-byte word is at [2, 66)
  const acceptSchedule = BigInt('0x' + log.data.slice(2, 66));
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

  // Create event record
  const event = AccessControlEvent.create({
    id: generateEventId(log.transactionHash, log.logIndex),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.DEFAULT_ADMIN_TRANSFER_SCHEDULED,
    blockNumber: BigInt(log.blockNumber),
    timestamp,
    txHash: log.transactionHash,
    account: newAdmin,
    acceptSchedule,
  });
  await event.save();

  // Update contract ownership with pending admin
  const ownershipId = generateContractOwnershipId(NETWORK_ID, contractAddress);
  let ownership = await ContractOwnership.get(ownershipId);

  if (ownership) {
    ownership.pendingOwner = newAdmin;
    await ownership.save();
  }

  // Update contract metadata
  await updateContractMetadata(
    contractAddress,
    EventType.DEFAULT_ADMIN_TRANSFER_SCHEDULED,
    timestamp
  );
}

/**
 * Handles DefaultAdminTransferCanceled events from AccessControlDefaultAdminRules contracts
 *
 * Event: DefaultAdminTransferCanceled()
 */
export async function handleDefaultAdminTransferCanceled(
  log: EthereumLog
): Promise<void> {
  const {
    networkId: NETWORK_ID,
    entities: { AccessControlEvent, ContractOwnership },
  } = getContext();

  const validation = validateEvmEvent(
    log.topics,
    'DefaultAdminTransferCanceled',
    NETWORK_ID,
    log.blockNumber,
    log.transactionHash
  );
  if (!isValidEvent(validation)) return;

  const contractAddress = normalizeAddress(log.address);
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

  // Create event record
  const event = AccessControlEvent.create({
    id: generateEventId(log.transactionHash, log.logIndex),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.DEFAULT_ADMIN_TRANSFER_CANCELED,
    blockNumber: BigInt(log.blockNumber),
    timestamp,
    txHash: log.transactionHash,
  });
  await event.save();

  // Clear pending owner if exists
  const ownershipId = generateContractOwnershipId(NETWORK_ID, contractAddress);
  const ownership = await ContractOwnership.get(ownershipId);

  if (ownership && ownership.pendingOwner) {
    ownership.pendingOwner = undefined;
    await ownership.save();
  }

  // Update contract metadata
  await updateContractMetadata(
    contractAddress,
    EventType.DEFAULT_ADMIN_TRANSFER_CANCELED,
    timestamp
  );
}

/**
 * Handles DefaultAdminDelayChangeScheduled events from AccessControlDefaultAdminRules contracts
 *
 * Event: DefaultAdminDelayChangeScheduled(uint48 newDelay, uint48 effectSchedule)
 */
export async function handleDefaultAdminDelayChangeScheduled(
  log: EthereumLog
): Promise<void> {
  const {
    networkId: NETWORK_ID,
    entities: { AccessControlEvent },
  } = getContext();

  const validation = validateEvmEvent(
    log.topics,
    'DefaultAdminDelayChangeScheduled',
    NETWORK_ID,
    log.blockNumber,
    log.transactionHash
  );
  if (!isValidEvent(validation)) return;

  const contractAddress = normalizeAddress(log.address);
  // Both values are in the data field (non-indexed)
  // log.data includes 0x prefix: first word at [2, 66), second at [66, 130)
  const newDelay = BigInt('0x' + log.data.slice(2, 66));
  const effectSchedule = BigInt('0x' + log.data.slice(66, 130));
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

  // Create event record
  const event = AccessControlEvent.create({
    id: generateEventId(log.transactionHash, log.logIndex),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.DEFAULT_ADMIN_DELAY_CHANGE_SCHEDULED,
    blockNumber: BigInt(log.blockNumber),
    timestamp,
    txHash: log.transactionHash,
    newDelay,
    effectSchedule,
  });
  await event.save();

  // Update contract metadata
  await updateContractMetadata(
    contractAddress,
    EventType.DEFAULT_ADMIN_DELAY_CHANGE_SCHEDULED,
    timestamp
  );
}

/**
 * Handles DefaultAdminDelayChangeCanceled events from AccessControlDefaultAdminRules contracts
 *
 * Event: DefaultAdminDelayChangeCanceled()
 */
export async function handleDefaultAdminDelayChangeCanceled(
  log: EthereumLog
): Promise<void> {
  const {
    networkId: NETWORK_ID,
    entities: { AccessControlEvent },
  } = getContext();

  const validation = validateEvmEvent(
    log.topics,
    'DefaultAdminDelayChangeCanceled',
    NETWORK_ID,
    log.blockNumber,
    log.transactionHash
  );
  if (!isValidEvent(validation)) return;

  const contractAddress = normalizeAddress(log.address);
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

  // Create event record
  const event = AccessControlEvent.create({
    id: generateEventId(log.transactionHash, log.logIndex),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType: EventType.DEFAULT_ADMIN_DELAY_CHANGE_CANCELED,
    blockNumber: BigInt(log.blockNumber),
    timestamp,
    txHash: log.transactionHash,
  });
  await event.save();

  // Update contract metadata
  await updateContractMetadata(
    contractAddress,
    EventType.DEFAULT_ADMIN_DELAY_CHANGE_CANCELED,
    timestamp
  );
}
