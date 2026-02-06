import { describe, it, expect } from "vitest";
import {
  generateEventId,
  generateRoleMembershipId,
  generateContractOwnershipId,
  generateContractId,
  isRoleEvent,
  isOwnershipEvent,
} from "../utils";
import { EventType } from "../types";

describe("generateEventId", () => {
  it("generates an event ID from txHash and numeric logIndex", () => {
    expect(generateEventId("0xabc123", 5)).toBe("0xabc123-5");
  });

  it("generates an event ID from txHash and string logIndex", () => {
    expect(generateEventId("0xabc123", "42")).toBe("0xabc123-42");
  });

  it("is deterministic (same inputs produce same output)", () => {
    const id1 = generateEventId("0xdeadbeef", 10);
    const id2 = generateEventId("0xdeadbeef", 10);
    expect(id1).toBe(id2);
  });

  it("produces different IDs for different txHashes", () => {
    const id1 = generateEventId("0xabc", 0);
    const id2 = generateEventId("0xdef", 0);
    expect(id1).not.toBe(id2);
  });

  it("produces different IDs for different logIndexes", () => {
    const id1 = generateEventId("0xabc", 0);
    const id2 = generateEventId("0xabc", 1);
    expect(id1).not.toBe(id2);
  });

  it("handles logIndex of 0", () => {
    expect(generateEventId("0xabc", 0)).toBe("0xabc-0");
  });
});

describe("generateRoleMembershipId", () => {
  it("generates an ID from network, contract, role, and account", () => {
    expect(
      generateRoleMembershipId(
        "ethereum-mainnet",
        "0xcontract",
        "0xrole",
        "0xaccount"
      )
    ).toBe("ethereum-mainnet-0xcontract-0xrole-0xaccount");
  });

  it("is deterministic", () => {
    const id1 = generateRoleMembershipId("net", "contract", "role", "account");
    const id2 = generateRoleMembershipId("net", "contract", "role", "account");
    expect(id1).toBe(id2);
  });

  it("produces different IDs when any component differs", () => {
    const base = generateRoleMembershipId("net", "c", "r", "a");
    expect(generateRoleMembershipId("net2", "c", "r", "a")).not.toBe(base);
    expect(generateRoleMembershipId("net", "c2", "r", "a")).not.toBe(base);
    expect(generateRoleMembershipId("net", "c", "r2", "a")).not.toBe(base);
    expect(generateRoleMembershipId("net", "c", "r", "a2")).not.toBe(base);
  });
});

describe("generateContractOwnershipId", () => {
  it("generates an ID from network and contract", () => {
    expect(generateContractOwnershipId("ethereum-mainnet", "0xcontract")).toBe(
      "ethereum-mainnet-0xcontract"
    );
  });

  it("is deterministic", () => {
    const id1 = generateContractOwnershipId("net", "c");
    const id2 = generateContractOwnershipId("net", "c");
    expect(id1).toBe(id2);
  });

  it("produces different IDs for different networks", () => {
    expect(generateContractOwnershipId("net1", "c")).not.toBe(
      generateContractOwnershipId("net2", "c")
    );
  });

  it("produces different IDs for different contracts", () => {
    expect(generateContractOwnershipId("net", "c1")).not.toBe(
      generateContractOwnershipId("net", "c2")
    );
  });
});

describe("generateContractId", () => {
  it("generates an ID from network and contract", () => {
    expect(generateContractId("stellar-mainnet", "CABC")).toBe(
      "stellar-mainnet-CABC"
    );
  });

  it("is deterministic", () => {
    const id1 = generateContractId("n", "c");
    const id2 = generateContractId("n", "c");
    expect(id1).toBe(id2);
  });

  it("has the same format as generateContractOwnershipId", () => {
    expect(generateContractId("net", "contract")).toBe(
      generateContractOwnershipId("net", "contract")
    );
  });
});

describe("isRoleEvent", () => {
  it("returns true for ROLE_GRANTED", () => {
    expect(isRoleEvent(EventType.ROLE_GRANTED)).toBe(true);
  });

  it("returns true for ROLE_REVOKED", () => {
    expect(isRoleEvent(EventType.ROLE_REVOKED)).toBe(true);
  });

  it("returns true for ROLE_ADMIN_CHANGED", () => {
    expect(isRoleEvent(EventType.ROLE_ADMIN_CHANGED)).toBe(true);
  });

  it("returns false for OWNERSHIP_TRANSFER_COMPLETED", () => {
    expect(isRoleEvent(EventType.OWNERSHIP_TRANSFER_COMPLETED)).toBe(false);
  });

  it("returns false for OWNERSHIP_TRANSFER_STARTED", () => {
    expect(isRoleEvent(EventType.OWNERSHIP_TRANSFER_STARTED)).toBe(false);
  });

  it("returns false for OWNERSHIP_RENOUNCED", () => {
    expect(isRoleEvent(EventType.OWNERSHIP_RENOUNCED)).toBe(false);
  });

  it("returns false for DEFAULT_ADMIN_TRANSFER_SCHEDULED", () => {
    expect(isRoleEvent(EventType.DEFAULT_ADMIN_TRANSFER_SCHEDULED)).toBe(false);
  });

  it("returns false for ADMIN_TRANSFER_INITIATED (Stellar)", () => {
    expect(isRoleEvent(EventType.ADMIN_TRANSFER_INITIATED)).toBe(false);
  });
});

describe("isOwnershipEvent", () => {
  it("returns true for OWNERSHIP_TRANSFER_COMPLETED", () => {
    expect(isOwnershipEvent(EventType.OWNERSHIP_TRANSFER_COMPLETED)).toBe(true);
  });

  it("returns true for OWNERSHIP_TRANSFER_STARTED", () => {
    expect(isOwnershipEvent(EventType.OWNERSHIP_TRANSFER_STARTED)).toBe(true);
  });

  it("returns true for OWNERSHIP_RENOUNCED", () => {
    expect(isOwnershipEvent(EventType.OWNERSHIP_RENOUNCED)).toBe(true);
  });

  it("returns false for ROLE_GRANTED", () => {
    expect(isOwnershipEvent(EventType.ROLE_GRANTED)).toBe(false);
  });

  it("returns false for ROLE_REVOKED", () => {
    expect(isOwnershipEvent(EventType.ROLE_REVOKED)).toBe(false);
  });

  it("returns false for ROLE_ADMIN_CHANGED", () => {
    expect(isOwnershipEvent(EventType.ROLE_ADMIN_CHANGED)).toBe(false);
  });

  it("returns false for DEFAULT_ADMIN_TRANSFER_CANCELED", () => {
    expect(isOwnershipEvent(EventType.DEFAULT_ADMIN_TRANSFER_CANCELED)).toBe(
      false
    );
  });

  it("returns false for ADMIN_RENOUNCED (Stellar)", () => {
    expect(isOwnershipEvent(EventType.ADMIN_RENOUNCED)).toBe(false);
  });
});
