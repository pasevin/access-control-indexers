import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  initializeHandlers,
  getContext,
  getNetworkId,
  getEntities,
  getStore,
} from "../context";

// Reset the module-level context between tests
// by re-importing with a fresh module
describe("Handler Context (evm-handlers)", () => {
  const mockEntities = {
    AccessControlEvent: { create: vi.fn() },
    RoleMembership: { create: vi.fn(), get: vi.fn() },
    ContractOwnership: { create: vi.fn(), get: vi.fn() },
    Contract: { create: vi.fn(), get: vi.fn() },
  };
  const mockStore = { remove: vi.fn() };

  beforeEach(async () => {
    // Re-import the module to reset the `context` variable
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
        networkId: "ethereum-mainnet",
        entities: mockEntities as any,
        store: mockStore,
      });
      expect(() => mod.getContext()).not.toThrow();
    });

    it("sets legacy globals on globalThis", async () => {
      const mod = await import("../context");
      mod.initializeHandlers({
        networkId: "base-mainnet",
        entities: mockEntities as any,
        store: mockStore,
      });
      expect((globalThis as any).NETWORK_ID).toBe("base-mainnet");
      expect((globalThis as any).AccessControlEvent).toBe(
        mockEntities.AccessControlEvent
      );
      expect((globalThis as any).RoleMembership).toBe(
        mockEntities.RoleMembership
      );
      expect((globalThis as any).ContractOwnership).toBe(
        mockEntities.ContractOwnership
      );
      expect((globalThis as any).Contract).toBe(mockEntities.Contract);

      // Clean up
      delete (globalThis as any).NETWORK_ID;
      delete (globalThis as any).AccessControlEvent;
      delete (globalThis as any).RoleMembership;
      delete (globalThis as any).ContractOwnership;
      delete (globalThis as any).Contract;
    });
  });

  describe("getNetworkId", () => {
    it("returns the configured network ID", async () => {
      const mod = await import("../context");
      mod.initializeHandlers({
        networkId: "optimism-mainnet",
        entities: mockEntities as any,
        store: mockStore,
      });
      expect(mod.getNetworkId()).toBe("optimism-mainnet");
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
        networkId: "ethereum-mainnet",
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
        networkId: "ethereum-mainnet",
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
        networkId: "polygon-mainnet",
        entities: mockEntities as any,
        store: mockStore,
      });
      const ctx = mod.getContext();
      expect(ctx.networkId).toBe("polygon-mainnet");
      expect(ctx.entities).toEqual(mockEntities);
      expect(ctx.store).toBe(mockStore);
    });
  });
});
