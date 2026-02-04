/**
 * EVM Mapping Handlers for Arbitrum One
 * Adapted for unified superset schema
 */

import { EthereumLog } from '@subql/types-ethereum';
import { AccessControlEvent, RoleMembership, ContractOwnership, Contract, EventType, ContractType } from './types';
import { normalizeEvmAddress, isZeroAddress } from '@oz-indexers/common';

const NETWORK_ID = 'arbitrum-mainnet';

function formatRole(role: string): string {
  const normalized = role.startsWith('0x') ? role : `0x${role}`;
  return normalized.toLowerCase();
}

function normalizeAddress(address: string): string {
  return normalizeEvmAddress(address);
}

function generateEventId(txHash: string, logIndex: number): string {
  return `${txHash}-${logIndex}`;
}

function generateRoleMembershipId(contract: string, role: string, account: string): string {
  return `${NETWORK_ID}-${contract}-${role}-${account}`;
}

function generateContractId(contract: string): string {
  return `${NETWORK_ID}-${contract}`;
}

async function updateContractMetadata(contractAddress: string, type: ContractType, timestamp: Date): Promise<void> {
  const contractId = generateContractId(contractAddress);
  let contract = await Contract.get(contractId);

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
    if ((contract.type === ContractType.ACCESS_CONTROL && type === ContractType.OWNABLE) ||
        (contract.type === ContractType.OWNABLE && type === ContractType.ACCESS_CONTROL)) {
      contract.type = ContractType.ACCESS_CONTROL_OWNABLE;
    }
    contract.lastActivityAt = timestamp;
  }
  await contract.save();
}

export async function handleRoleGranted(log: EthereumLog): Promise<void> {
  const contractAddress = normalizeAddress(log.address);
  const role = formatRole(log.topics[1]);
  const account = normalizeAddress(`0x${log.topics[2].slice(26)}`);
  const sender = normalizeAddress(`0x${log.topics[3].slice(26)}`);
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

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

  const membershipId = generateRoleMembershipId(contractAddress, role, account);
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

  await updateContractMetadata(contractAddress, ContractType.ACCESS_CONTROL, timestamp);
}

export async function handleRoleRevoked(log: EthereumLog): Promise<void> {
  const contractAddress = normalizeAddress(log.address);
  const role = formatRole(log.topics[1]);
  const account = normalizeAddress(`0x${log.topics[2].slice(26)}`);
  const sender = normalizeAddress(`0x${log.topics[3].slice(26)}`);
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

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

  const membershipId = generateRoleMembershipId(contractAddress, role, account);
  await store.remove('RoleMembership', membershipId);
  await updateContractMetadata(contractAddress, ContractType.ACCESS_CONTROL, timestamp);
}

export async function handleRoleAdminChanged(log: EthereumLog): Promise<void> {
  const contractAddress = normalizeAddress(log.address);
  const role = formatRole(log.topics[1]);
  const previousAdminRole = formatRole(log.topics[2]);
  const newAdminRole = formatRole(log.topics[3]);
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

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

  await updateContractMetadata(contractAddress, ContractType.ACCESS_CONTROL, timestamp);
}

export async function handleOwnershipTransferred(log: EthereumLog): Promise<void> {
  const contractAddress = normalizeAddress(log.address);
  const previousOwner = normalizeAddress(`0x${log.topics[1].slice(26)}`);
  const newOwner = normalizeAddress(`0x${log.topics[2].slice(26)}`);
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

  const eventType = isZeroAddress(newOwner) ? EventType.OWNERSHIP_RENOUNCED : EventType.OWNERSHIP_TRANSFERRED;

  const event = AccessControlEvent.create({
    id: generateEventId(log.transactionHash, log.logIndex),
    network: NETWORK_ID,
    contract: contractAddress,
    eventType,
    blockNumber: BigInt(log.blockNumber),
    timestamp,
    txHash: log.transactionHash,
    previousOwner,
    newOwner: eventType === EventType.OWNERSHIP_RENOUNCED ? undefined : newOwner,
  });
  await event.save();

  const ownershipId = generateContractId(contractAddress);
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
    ownership.pendingOwner = undefined;
    ownership.transferredAt = timestamp;
    ownership.txHash = log.transactionHash;
  }
  await ownership.save();

  await updateContractMetadata(contractAddress, ContractType.OWNABLE, timestamp);
}

export async function handleOwnershipTransferStarted(log: EthereumLog): Promise<void> {
  const contractAddress = normalizeAddress(log.address);
  const previousOwner = normalizeAddress(`0x${log.topics[1].slice(26)}`);
  const newOwner = normalizeAddress(`0x${log.topics[2].slice(26)}`);
  const timestamp = new Date(Number(log.block.timestamp) * 1000);

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

  const ownershipId = generateContractId(contractAddress);
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

  await updateContractMetadata(contractAddress, ContractType.OWNABLE, timestamp);
}
