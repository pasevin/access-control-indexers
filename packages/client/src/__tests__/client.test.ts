import { describe, it, expect, vi, beforeEach } from "vitest";
import { AccessControlClient } from "../client";

describe("AccessControlClient", () => {
  const mockFetch = vi.fn();
  let client: AccessControlClient;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new AccessControlClient({
      endpoints: {
        "ethereum-mainnet": "https://api.example.com/eth",
        "stellar-mainnet": "https://api.example.com/stellar",
      },
      fetch: mockFetch as any,
      retry: { maxRetries: 0 }, // Disable retries for unit tests
    });
  });

  // Helper to create a successful fetch response
  function mockSuccessResponse(data: unknown) {
    return {
      ok: true,
      json: async () => ({ data }),
    };
  }

  describe("listEndpoints", () => {
    it("returns all configured endpoints", () => {
      const endpoints = client.listEndpoints();
      expect(endpoints).toHaveLength(2);
      expect(endpoints).toContainEqual({
        network: "ethereum-mainnet",
        url: "https://api.example.com/eth",
      });
      expect(endpoints).toContainEqual({
        network: "stellar-mainnet",
        url: "https://api.example.com/stellar",
      });
    });
  });

  describe("setEndpoint", () => {
    it("adds a new endpoint", () => {
      client.setEndpoint("base-mainnet", "https://api.example.com/base");
      const endpoints = client.listEndpoints();
      expect(endpoints).toHaveLength(3);
      expect(endpoints).toContainEqual({
        network: "base-mainnet",
        url: "https://api.example.com/base",
      });
    });

    it("updates an existing endpoint", () => {
      client.setEndpoint("ethereum-mainnet", "https://new-api.example.com/eth");
      const endpoints = client.listEndpoints();
      const eth = endpoints.find((e) => e.network === "ethereum-mainnet");
      expect(eth?.url).toBe("https://new-api.example.com/eth");
    });
  });

  describe("getEndpoint (via queryEvents)", () => {
    it("throws for unknown network", async () => {
      await expect(
        client.queryEvents({ network: "unknown-network" })
      ).rejects.toThrow("No endpoint configured for network: unknown-network");
    });
  });

  describe("buildFilter (via queryEvents)", () => {
    it("preserves EVM address casing (lowercased) for contract", async () => {
      mockFetch.mockResolvedValueOnce(
        mockSuccessResponse({
          accessControlEvents: {
            nodes: [],
            totalCount: 0,
            pageInfo: { hasNextPage: false, hasPreviousPage: false },
          },
        })
      );

      await client.queryEvents({
        network: "ethereum-mainnet",
        contract: "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12",
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.variables.filter.contract.equalTo).toBe(
        "0xabcdef1234567890abcdef1234567890abcdef12"
      );
    });

    it("preserves Stellar address casing (no lowercase)", async () => {
      mockFetch.mockResolvedValueOnce(
        mockSuccessResponse({
          accessControlEvents: {
            nodes: [],
            totalCount: 0,
            pageInfo: { hasNextPage: false, hasPreviousPage: false },
          },
        })
      );

      const stellarAddr =
        "GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345";
      await client.queryEvents({
        network: "stellar-mainnet",
        contract: stellarAddr,
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.variables.filter.contract.equalTo).toBe(stellarAddr);
    });

    it("lowercases EVM account addresses", async () => {
      mockFetch.mockResolvedValueOnce(
        mockSuccessResponse({
          accessControlEvents: {
            nodes: [],
            totalCount: 0,
            pageInfo: { hasNextPage: false, hasPreviousPage: false },
          },
        })
      );

      await client.queryEvents({
        network: "ethereum-mainnet",
        account: "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12",
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.variables.filter.account.equalTo).toBe(
        "0xabcdef1234567890abcdef1234567890abcdef12"
      );
    });
  });

  describe("queryEvents", () => {
    it("requires network parameter", async () => {
      await expect(client.queryEvents({})).rejects.toThrow(
        "Network is required for querying events"
      );
    });

    it("sends correct GraphQL query with filter", async () => {
      mockFetch.mockResolvedValueOnce(
        mockSuccessResponse({
          accessControlEvents: {
            nodes: [
              {
                id: "evt-1",
                network: "ethereum-mainnet",
                contract: "0xabc",
                eventType: "ROLE_GRANTED",
              },
            ],
            totalCount: 1,
            pageInfo: { hasNextPage: false, hasPreviousPage: false },
          },
        })
      );

      const result = await client.queryEvents({
        network: "ethereum-mainnet",
        limit: 10,
        offset: 0,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/eth",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query).toContain("accessControlEvents");
      expect(body.variables.first).toBe(10);
      expect(body.variables.offset).toBe(0);
      expect(result.nodes).toHaveLength(1);
      expect(result.totalCount).toBe(1);
    });

    it("uses default limit of 100 and offset of 0", async () => {
      mockFetch.mockResolvedValueOnce(
        mockSuccessResponse({
          accessControlEvents: {
            nodes: [],
            totalCount: 0,
            pageInfo: { hasNextPage: false, hasPreviousPage: false },
          },
        })
      );

      await client.queryEvents({ network: "ethereum-mainnet" });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.variables.first).toBe(100);
      expect(body.variables.offset).toBe(0);
    });
  });

  describe("hasRole", () => {
    it("constructs correct ID with normalized EVM addresses", async () => {
      mockFetch.mockResolvedValueOnce(
        mockSuccessResponse({
          roleMembership: { id: "test-id" },
        })
      );

      const result = await client.hasRole(
        "ethereum-mainnet",
        "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12",
        "0x" + "0".repeat(64),
        "0xFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFf"
      );

      expect(result).toBe(true);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const id = body.variables.id;
      expect(id).toBe(
        `ethereum-mainnet-0xabcdef1234567890abcdef1234567890abcdef12-0x${"0".repeat(
          64
        )}-0xffffffffffffffffffffffffffffffffffffffff`
      );
    });

    it("returns false when role membership is null", async () => {
      mockFetch.mockResolvedValueOnce(
        mockSuccessResponse({
          roleMembership: null,
        })
      );

      const result = await client.hasRole(
        "ethereum-mainnet",
        "0xabc",
        "0xrole",
        "0xaccount"
      );

      expect(result).toBe(false);
    });

    it("preserves Stellar address casing in ID", async () => {
      const stellarContract =
        "CABC2345GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345";
      const stellarAccount =
        "GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345";
      mockFetch.mockResolvedValueOnce(
        mockSuccessResponse({ roleMembership: null })
      );

      await client.hasRole(
        "stellar-mainnet",
        stellarContract,
        "ADMIN",
        stellarAccount
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.variables.id).toBe(
        `stellar-mainnet-${stellarContract}-ADMIN-${stellarAccount}`
      );
    });
  });

  describe("getContractOwner", () => {
    it("constructs correct ID from network and contract", async () => {
      mockFetch.mockResolvedValueOnce(
        mockSuccessResponse({
          contractOwnership: {
            id: "ethereum-mainnet-0xabc",
            owner: "0xowner",
          },
        })
      );

      const result = await client.getContractOwner(
        "ethereum-mainnet",
        "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12"
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.variables.id).toBe(
        "ethereum-mainnet-0xabcdef1234567890abcdef1234567890abcdef12"
      );
      expect(result).not.toBeNull();
    });

    it("returns null when no ownership found", async () => {
      mockFetch.mockResolvedValueOnce(
        mockSuccessResponse({ contractOwnership: null })
      );

      const result = await client.getContractOwner("ethereum-mainnet", "0xabc");
      expect(result).toBeNull();
    });
  });

  describe("retry logic", () => {
    it("retries on network error", async () => {
      const retryClient = new AccessControlClient({
        endpoints: { "ethereum-mainnet": "https://api.example.com/eth" },
        fetch: mockFetch as any,
        retry: { maxRetries: 2, baseDelayMs: 1 },
      });

      mockFetch
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(
          mockSuccessResponse({
            accessControlEvents: {
              nodes: [],
              totalCount: 0,
              pageInfo: { hasNextPage: false, hasPreviousPage: false },
            },
          })
        );

      const result = await retryClient.queryEvents({
        network: "ethereum-mainnet",
      });

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result.nodes).toHaveLength(0);
    });

    it("does not retry on GraphQL error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          errors: [{ message: "Field not found" }],
        }),
      });

      const retryClient = new AccessControlClient({
        endpoints: { "ethereum-mainnet": "https://api.example.com/eth" },
        fetch: mockFetch as any,
        retry: { maxRetries: 2, baseDelayMs: 1 },
      });

      await expect(
        retryClient.queryEvents({ network: "ethereum-mainnet" })
      ).rejects.toThrow("GraphQL errors:");

      // Only one call — no retries
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("throws after exhausting retries", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(
        client.queryEvents({ network: "ethereum-mainnet" })
      ).rejects.toThrow("Network error");

      // maxRetries: 0 means 1 attempt total
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("timeout (AbortController)", () => {
    it("passes abort signal to fetch", async () => {
      mockFetch.mockResolvedValueOnce(
        mockSuccessResponse({
          accessControlEvents: {
            nodes: [],
            totalCount: 0,
            pageInfo: { hasNextPage: false, hasPreviousPage: false },
          },
        })
      );

      await client.queryEvents({ network: "ethereum-mainnet" });

      const fetchCall = mockFetch.mock.calls[0][1];
      expect(fetchCall.signal).toBeInstanceOf(AbortSignal);
    });
  });

  describe("getRoleMembers", () => {
    it("returns role members for a contract", async () => {
      mockFetch.mockResolvedValueOnce(
        mockSuccessResponse({
          roleMemberships: {
            nodes: [
              {
                id: "member-1",
                network: "ethereum-mainnet",
                contract: "0xabc",
                role: "0xrole",
                account: "0xaccount",
                grantedAt: "2024-01-01T00:00:00Z",
                txHash: "0xtx",
              },
            ],
          },
        })
      );

      const result = await client.getRoleMembers(
        "ethereum-mainnet",
        "0xAbC",
        "0xrole"
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("member-1");
    });

    it("normalizes EVM contract address to lowercase", async () => {
      mockFetch.mockResolvedValueOnce(
        mockSuccessResponse({ roleMemberships: { nodes: [] } })
      );

      await client.getRoleMembers(
        "ethereum-mainnet",
        "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12"
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.variables.filter.contract.equalTo).toBe(
        "0xabcdef1234567890abcdef1234567890abcdef12"
      );
    });
  });

  describe("getContract", () => {
    it("returns contract metadata", async () => {
      mockFetch.mockResolvedValueOnce(
        mockSuccessResponse({
          contract: {
            id: "ethereum-mainnet-0xabc",
            network: "ethereum-mainnet",
            address: "0xabc",
            type: "ACCESS_CONTROL",
            firstSeenAt: "2024-01-01T00:00:00Z",
            lastActivityAt: "2024-06-01T00:00:00Z",
          },
        })
      );

      const result = await client.getContract(
        "ethereum-mainnet",
        "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12"
      );
      expect(result).not.toBeNull();
      expect(result?.type).toBe("ACCESS_CONTROL");
    });

    it("returns null for unknown contract", async () => {
      mockFetch.mockResolvedValueOnce(mockSuccessResponse({ contract: null }));

      const result = await client.getContract("ethereum-mainnet", "0xunknown");
      expect(result).toBeNull();
    });
  });

  describe("HTTP error handling", () => {
    it("throws on non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Internal Server Error",
      });

      await expect(
        client.queryEvents({ network: "ethereum-mainnet" })
      ).rejects.toThrow("GraphQL request failed: Internal Server Error");
    });
  });
});
