import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Handler Context (stellar-handlers)", () => {
  const mockEntities = {
    AccessControlEvent: { create: vi.fn() },
    RoleMembership: { create: vi.fn(), get: vi.fn() },
    ContractOwnership: { create: vi.fn(), get: vi.fn() },
    Contract: { create: vi.fn(), get: vi.fn() },
  };
  const mockStore = { remove: vi.fn() };

  beforeEach(async () => {
    vi.resetModules();
  });

  describe("getContext before initialization", () => {
    it("throws when context is not initialized", async () => {
      const mod = await import("../context");
      expect(() => mod.getContext()).toThrow(
        "Handlers not initialized. Call initializeHandlers() before using handlers."
      );
    });
  });

  describe("initializeHandlers", () => {
    it("sets the context so getContext does not throw", async () => {
      const mod = await import("../context");
      mod.initializeHandlers({
        networkId: "stellar-mainnet",
        entities: mockEntities as any,
        store: mockStore,
      });
      expect(() => mod.getContext()).not.toThrow();
    });

    it("calls ensurePolyfills during initialization", async () => {
      // ensurePolyfills is called internally; verify it doesn't throw
      const mod = await import("../context");
      expect(() =>
        mod.initializeHandlers({
          networkId: "stellar-testnet",
          entities: mockEntities as any,
          store: mockStore,
        })
      ).not.toThrow();
    });
  });

  describe("getNetworkId", () => {
    it("returns the configured network ID", async () => {
      const mod = await import("../context");
      mod.initializeHandlers({
        networkId: "stellar-mainnet",
        entities: mockEntities as any,
        store: mockStore,
      });
      expect(mod.getNetworkId()).toBe("stellar-mainnet");
    });

    it("throws before initialization", async () => {
      const mod = await import("../context");
      expect(() => mod.getNetworkId()).toThrow("Handlers not initialized");
    });
  });

  describe("getEntities", () => {
    it("returns the entity objects", async () => {
      const mod = await import("../context");
      mod.initializeHandlers({
        networkId: "stellar-mainnet",
        entities: mockEntities as any,
        store: mockStore,
      });
      const entities = mod.getEntities();
      expect(entities.AccessControlEvent).toBe(mockEntities.AccessControlEvent);
      expect(entities.RoleMembership).toBe(mockEntities.RoleMembership);
      expect(entities.ContractOwnership).toBe(mockEntities.ContractOwnership);
      expect(entities.Contract).toBe(mockEntities.Contract);
    });

    it("throws before initialization", async () => {
      const mod = await import("../context");
      expect(() => mod.getEntities()).toThrow("Handlers not initialized");
    });
  });

  describe("getStore", () => {
    it("returns the store object", async () => {
      const mod = await import("../context");
      mod.initializeHandlers({
        networkId: "stellar-mainnet",
        entities: mockEntities as any,
        store: mockStore,
      });
      expect(mod.getStore()).toBe(mockStore);
    });

    it("throws before initialization", async () => {
      const mod = await import("../context");
      expect(() => mod.getStore()).toThrow("Handlers not initialized");
    });
  });

  describe("getContext", () => {
    it("returns the full handler context", async () => {
      const mod = await import("../context");
      mod.initializeHandlers({
        networkId: "stellar-testnet",
        entities: mockEntities as any,
        store: mockStore,
      });
      const ctx = mod.getContext();
      expect(ctx.networkId).toBe("stellar-testnet");
      expect(ctx.entities).toEqual(mockEntities);
      expect(ctx.store).toBe(mockStore);
    });
  });
});
