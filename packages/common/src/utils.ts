/**
 * Utility functions for Access Control indexers
 */

import { ContractType, EventType } from './types';

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
 * Determines contract type based on event types seen
 * @param eventTypes - Set of event types seen from this contract
 * @returns Contract type
 */
export function determineContractType(
  eventTypes: Set<EventType>
): ContractType {
  const hasAccessControl =
    eventTypes.has(EventType.ROLE_GRANTED) ||
    eventTypes.has(EventType.ROLE_REVOKED) ||
    eventTypes.has(EventType.ROLE_ADMIN_CHANGED);

  const hasOwnable =
    eventTypes.has(EventType.OWNERSHIP_TRANSFERRED) ||
    eventTypes.has(EventType.OWNERSHIP_TRANSFER_STARTED) ||
    eventTypes.has(EventType.OWNERSHIP_RENOUNCED);

  if (hasAccessControl && hasOwnable) {
    return ContractType.ACCESS_CONTROL_OWNABLE;
  } else if (hasAccessControl) {
    return ContractType.ACCESS_CONTROL;
  } else {
    return ContractType.OWNABLE;
  }
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
    eventType === EventType.OWNERSHIP_TRANSFERRED ||
    eventType === EventType.OWNERSHIP_TRANSFER_STARTED ||
    eventType === EventType.OWNERSHIP_RENOUNCED
  );
}

/**
 * Checks if an event type is a Stellar-specific admin event
 */
export function isAdminEvent(eventType: EventType): boolean {
  return (
    eventType === EventType.ADMIN_TRANSFER_INITIATED ||
    eventType === EventType.ADMIN_TRANSFER_COMPLETED ||
    eventType === EventType.ADMIN_RENOUNCED
  );
}
