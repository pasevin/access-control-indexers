/**
 * Client types for querying Access Control indexers
 */

import { EventType, ContractType } from '@oz-indexers/common';

export { EventType, ContractType };

/**
 * Query filter options
 */
export interface QueryOptions {
  /** Filter by network (e.g., "ethereum-mainnet", "stellar-testnet") */
  network?: string;
  /** Filter by contract address */
  contract?: string;
  /** Filter by account address */
  account?: string;
  /** Filter by role */
  role?: string;
  /** Filter by event type */
  eventType?: EventType;
  /** Filter by minimum timestamp */
  fromTimestamp?: Date;
  /** Filter by maximum timestamp */
  toTimestamp?: Date;
  /** Maximum number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Access control event from indexer
 */
export interface AccessControlEventResponse {
  id: string;
  network: string;
  contract: string;
  eventType: EventType;
  blockNumber: string;
  timestamp: string;
  txHash: string;
  role?: string;
  account?: string;
  sender?: string;
  previousAdminRole?: string;
  newAdminRole?: string;
  previousOwner?: string;
  newOwner?: string;
  previousAdmin?: string;
  newAdmin?: string;
  liveUntilLedger?: number;
  acceptSchedule?: string;
  newDelay?: string;
  effectSchedule?: string;
}

/**
 * Role membership from indexer
 */
export interface RoleMembershipResponse {
  id: string;
  network: string;
  contract: string;
  role: string;
  account: string;
  grantedAt: string;
  grantedBy?: string;
  txHash: string;
}

/**
 * Contract ownership from indexer
 */
export interface ContractOwnershipResponse {
  id: string;
  network: string;
  contract: string;
  owner: string;
  previousOwner?: string;
  pendingOwner?: string;
  transferredAt: string;
  txHash: string;
}

/**
 * Contract metadata from indexer
 */
export interface ContractResponse {
  id: string;
  network: string;
  address: string;
  type: ContractType;
  firstSeenAt: string;
  lastActivityAt: string;
  deployTxHash?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  nodes: T[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Indexer endpoint configuration
 */
export interface IndexerEndpoint {
  network: string;
  url: string;
}

/**
 * Retry configuration for client requests
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in ms between retries (default: 1000) */
  baseDelayMs?: number;
  /** Request timeout in ms (default: 30000) */
  timeoutMs?: number;
}
