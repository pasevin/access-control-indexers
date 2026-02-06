/**
 * Utility functions for Access Control indexers
 */

import { EventType } from './types';

/**
 * Generates a unique event ID
 * @param txHash - Transaction hash
 * @param logIndex - Log index within the transaction
 * @returns Unique event ID
 */
export function generateEventId(
  txHash: string,
  logIndex: number | string
): string {
  return `${txHash}-${logIndex}`;
}

/**
 * Generates a role membership ID
 * @param network - Network identifier
 * @param contract - Contract address
 * @param role - Role identifier
 * @param account - Account address
 * @returns Unique role membership ID
 */
export function generateRoleMembershipId(
  network: string,
  contract: string,
  role: string,
  account: string
): string {
  return `${network}-${contract}-${role}-${account}`;
}

/**
 * Generates a contract ownership ID
 * @param network - Network identifier
 * @param contract - Contract address
 * @returns Unique contract ownership ID
 */
export function generateContractOwnershipId(
  network: string,
  contract: string
): string {
  return `${network}-${contract}`;
}

/**
 * Generates a contract ID
 * @param network - Network identifier
 * @param contract - Contract address
 * @returns Unique contract ID
 */
export function generateContractId(network: string, contract: string): string {
  return `${network}-${contract}`;
}

/**
 * Checks if an event type is a role event
 */
export function isRoleEvent(eventType: EventType): boolean {
  return (
    eventType === EventType.ROLE_GRANTED ||
    eventType === EventType.ROLE_REVOKED ||
    eventType === EventType.ROLE_ADMIN_CHANGED
  );
}

/**
 * Checks if an event type is an ownership event
 */
export function isOwnershipEvent(eventType: EventType): boolean {
  return (
    eventType === EventType.OWNERSHIP_TRANSFER_COMPLETED ||
    eventType === EventType.OWNERSHIP_TRANSFER_STARTED ||
    eventType === EventType.OWNERSHIP_RENOUNCED
  );
}

