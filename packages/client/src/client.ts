/**
 * Unified client for querying Access Control indexers
 */

import {
  QueryOptions,
  AccessControlEventResponse,
  RoleMembershipResponse,
  ContractOwnershipResponse,
  ContractResponse,
  PaginatedResponse,
  IndexerEndpoint,
} from './types';

/**
 * Client configuration options
 */
export interface ClientConfig {
  /** Map of network ID to GraphQL endpoint URL */
  endpoints: Record<string, string>;
  /** Optional fetch function for custom HTTP client */
  fetch?: typeof fetch;
}

/**
 * Access Control Indexer Client
 *
 * Unified client for querying any Access Control indexer across all networks.
 *
 * @example
 * ```typescript
 * const client = new AccessControlClient({
 *   endpoints: {
 *     'ethereum-mainnet': 'https://api.subquery.network/sq/oz/ethereum-mainnet',
 *     'stellar-testnet': 'https://api.subquery.network/sq/oz/stellar-testnet',
 *   },
 * });
 *
 * const events = await client.queryEvents({
 *   network: 'ethereum-mainnet',
 *   contract: '0x...',
 *   limit: 10,
 * });
 * ```
 */
export class AccessControlClient {
  private endpoints: Record<string, string>;
  private fetchFn: typeof fetch;

  constructor(config: ClientConfig) {
    this.endpoints = config.endpoints;
    this.fetchFn = config.fetch || fetch;
  }

  /**
   * Get the endpoint URL for a network
   */
  private getEndpoint(network: string): string {
    const endpoint = this.endpoints[network];
    if (!endpoint) {
      throw new Error(`No endpoint configured for network: ${network}`);
    }
    return endpoint;
  }

  /**
   * Execute a GraphQL query
   */
  private async executeQuery<T>(
    endpoint: string,
    query: string,
    variables: Record<string, unknown> = {}
  ): Promise<T> {
    const response = await this.fetchFn(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const result = (await response.json()) as { data?: T; errors?: unknown[] };
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data as T;
  }

  /**
   * Build a filter object for GraphQL queries
   */
  private buildFilter(options: QueryOptions): Record<string, unknown> {
    const filter: Record<string, unknown> = {};

    if (options.network) {
      filter.network = { equalTo: options.network };
    }
    if (options.contract) {
      filter.contract = { equalTo: options.contract.toLowerCase() };
    }
    if (options.account) {
      filter.account = { equalTo: options.account.toLowerCase() };
    }
    if (options.role) {
      filter.role = { equalTo: options.role };
    }
    if (options.eventType) {
      filter.eventType = { equalTo: options.eventType };
    }
    if (options.fromTimestamp) {
      filter.timestamp = {
        ...(filter.timestamp as object),
        greaterThanOrEqualTo: options.fromTimestamp.toISOString(),
      };
    }
    if (options.toTimestamp) {
      filter.timestamp = {
        ...(filter.timestamp as object),
        lessThanOrEqualTo: options.toTimestamp.toISOString(),
      };
    }

    return filter;
  }

  /**
   * Query access control events
   */
  async queryEvents(
    options: QueryOptions = {}
  ): Promise<PaginatedResponse<AccessControlEventResponse>> {
    const network = options.network;
    if (!network) {
      throw new Error('Network is required for querying events');
    }

    const endpoint = this.getEndpoint(network);
    const filter = this.buildFilter(options);

    const query = `
      query QueryEvents($filter: AccessControlEventFilter, $first: Int, $offset: Int) {
        accessControlEvents(
          filter: $filter
          first: $first
          offset: $offset
          orderBy: TIMESTAMP_DESC
        ) {
          nodes {
            id
            network
            contract
            eventType
            blockNumber
            timestamp
            txHash
            role
            account
            sender
            previousAdminRole
            newAdminRole
            previousOwner
            newOwner
            previousAdmin
            newAdmin
            liveUntilLedger
          }
          totalCount
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        }
      }
    `;

    const result = await this.executeQuery<{
      accessControlEvents: PaginatedResponse<AccessControlEventResponse>;
    }>(endpoint, query, {
      filter,
      first: options.limit || 100,
      offset: options.offset || 0,
    });

    return result.accessControlEvents;
  }

  /**
   * Get role members for a contract
   */
  async getRoleMembers(
    network: string,
    contract: string,
    role?: string
  ): Promise<RoleMembershipResponse[]> {
    const endpoint = this.getEndpoint(network);
    const filter: Record<string, unknown> = {
      network: { equalTo: network },
      contract: { equalTo: contract.toLowerCase() },
    };

    if (role) {
      filter.role = { equalTo: role };
    }

    const query = `
      query GetRoleMembers($filter: RoleMembershipFilter) {
        roleMemberships(filter: $filter, orderBy: GRANTED_AT_DESC) {
          nodes {
            id
            network
            contract
            role
            account
            grantedAt
            grantedBy
            txHash
          }
        }
      }
    `;

    const result = await this.executeQuery<{
      roleMemberships: { nodes: RoleMembershipResponse[] };
    }>(endpoint, query, { filter });

    return result.roleMemberships.nodes;
  }

  /**
   * Get contract owner
   */
  async getContractOwner(
    network: string,
    contract: string
  ): Promise<ContractOwnershipResponse | null> {
    const endpoint = this.getEndpoint(network);

    const query = `
      query GetContractOwner($id: String!) {
        contractOwnership(id: $id) {
          id
          network
          contract
          owner
          previousOwner
          pendingOwner
          transferredAt
          txHash
        }
      }
    `;

    const id = `${network}-${contract.toLowerCase()}`;
    const result = await this.executeQuery<{
      contractOwnership: ContractOwnershipResponse | null;
    }>(endpoint, query, { id });

    return result.contractOwnership;
  }

  /**
   * Check if an account has a specific role
   */
  async hasRole(
    network: string,
    contract: string,
    role: string,
    account: string
  ): Promise<boolean> {
    const endpoint = this.getEndpoint(network);

    const query = `
      query CheckRole($id: String!) {
        roleMembership(id: $id) {
          id
        }
      }
    `;

    const id = `${network}-${contract.toLowerCase()}-${role}-${account.toLowerCase()}`;
    const result = await this.executeQuery<{
      roleMembership: { id: string } | null;
    }>(endpoint, query, { id });

    return result.roleMembership !== null;
  }

  /**
   * Get contract metadata
   */
  async getContract(
    network: string,
    contract: string
  ): Promise<ContractResponse | null> {
    const endpoint = this.getEndpoint(network);

    const query = `
      query GetContract($id: String!) {
        contract(id: $id) {
          id
          network
          address
          type
          firstSeenAt
          lastActivityAt
          deployTxHash
        }
      }
    `;

    const id = `${network}-${contract.toLowerCase()}`;
    const result = await this.executeQuery<{
      contract: ContractResponse | null;
    }>(endpoint, query, { id });

    return result.contract;
  }

  /**
   * List all configured endpoints
   */
  listEndpoints(): IndexerEndpoint[] {
    return Object.entries(this.endpoints).map(([network, url]) => ({
      network,
      url,
    }));
  }

  /**
   * Add or update an endpoint
   */
  setEndpoint(network: string, url: string): void {
    this.endpoints[network] = url;
  }
}
