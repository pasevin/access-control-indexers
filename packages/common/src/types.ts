/**
 * Shared types for Access Control indexers
 */

/**
 * Event types matching the GraphQL schema
 */
export enum EventType {
  // Role events (EVM + Stellar)
  ROLE_GRANTED = 'ROLE_GRANTED',
  ROLE_REVOKED = 'ROLE_REVOKED',
  ROLE_ADMIN_CHANGED = 'ROLE_ADMIN_CHANGED',

  // Ownership events (EVM + Stellar)
  OWNERSHIP_TRANSFERRED = 'OWNERSHIP_TRANSFERRED',
  OWNERSHIP_TRANSFER_STARTED = 'OWNERSHIP_TRANSFER_STARTED',
  OWNERSHIP_RENOUNCED = 'OWNERSHIP_RENOUNCED',

  // Admin events (Stellar only)
  ADMIN_TRANSFER_INITIATED = 'ADMIN_TRANSFER_INITIATED',
  ADMIN_TRANSFER_COMPLETED = 'ADMIN_TRANSFER_COMPLETED',
  ADMIN_RENOUNCED = 'ADMIN_RENOUNCED',
}

/**
 * Contract types matching the GraphQL schema
 */
export enum ContractType {
  ACCESS_CONTROL = 'ACCESS_CONTROL',
  OWNABLE = 'OWNABLE',
  ACCESS_CONTROL_OWNABLE = 'ACCESS_CONTROL_OWNABLE',
}

/**
 * Ecosystem types
 */
export type Ecosystem = 'evm' | 'stellar';

/**
 * Network type (mainnet or testnet)
 */
export type NetworkType = 'mainnet' | 'testnet';

/**
 * Base event data shared across all ecosystems
 */
export interface BaseEventData {
  network: string;
  contract: string;
  eventType: EventType;
  blockNumber: bigint;
  timestamp: Date;
  txHash: string;
}

/**
 * Role event data
 */
export interface RoleEventData extends BaseEventData {
  eventType: EventType.ROLE_GRANTED | EventType.ROLE_REVOKED;
  role: string;
  account: string;
  sender: string;
}

/**
 * Role admin changed event data
 */
export interface RoleAdminChangedEventData extends BaseEventData {
  eventType: EventType.ROLE_ADMIN_CHANGED;
  role: string;
  previousAdminRole: string;
  newAdminRole: string;
}

/**
 * Ownership event data
 */
export interface OwnershipEventData extends BaseEventData {
  eventType:
    | EventType.OWNERSHIP_TRANSFERRED
    | EventType.OWNERSHIP_TRANSFER_STARTED
    | EventType.OWNERSHIP_RENOUNCED;
  previousOwner: string;
  newOwner: string | null;
  liveUntilLedger?: number; // Stellar only
}

/**
 * Admin event data (Stellar only)
 */
export interface AdminEventData extends BaseEventData {
  eventType:
    | EventType.ADMIN_TRANSFER_INITIATED
    | EventType.ADMIN_TRANSFER_COMPLETED
    | EventType.ADMIN_RENOUNCED;
  previousAdmin: string;
  newAdmin: string | null;
  liveUntilLedger?: number;
}

/**
 * Union type for all event data
 */
export type AccessControlEventData =
  | RoleEventData
  | RoleAdminChangedEventData
  | OwnershipEventData
  | AdminEventData;
