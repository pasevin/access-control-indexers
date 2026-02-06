import { describe, it, expect } from "vitest";
import {
  isValidEvmAddress,
  isValidEvmRole,
  isValidEvmTxHash,
  isValidEvmBlockNumber,
  validateEvmTopics,
  validateEvmEvent,
  EVM_EVENT_TOPIC_REQUIREMENTS,
} from "../validation";
import type { EventContext } from "@oz-indexers/common";

const baseContext: EventContext = {
  network: "ethereum-mainnet",
  blockNumber: 100,
  eventType: "RoleGranted",
};

describe("isValidEvmAddress", () => {
  it("returns true for a valid lowercase address with 0x prefix", () => {
    expect(
      isValidEvmAddress("0xabcdef1234567890abcdef1234567890abcdef12")
    ).toBe(true);
  });

  it("returns true for a valid mixed-case (checksummed) address", () => {
    expect(
      isValidEvmAddress("0xAbCdEf1234567890AbCdEf1234567890AbCdEf12")
    ).toBe(true);
  });

  it("returns true for the zero address", () => {
    expect(
      isValidEvmAddress("0x0000000000000000000000000000000000000000")
    ).toBe(true);
  });

  it("returns false for address without 0x prefix", () => {
    expect(isValidEvmAddress("abcdef1234567890abcdef1234567890abcdef12")).toBe(
      false
    );
  });

  it("returns false for too-short address", () => {
    expect(isValidEvmAddress("0xabcdef")).toBe(false);
  });

  it("returns false for too-long address", () => {
    expect(
      isValidEvmAddress("0xabcdef1234567890abcdef1234567890abcdef1234")
    ).toBe(false);
  });

  it("returns false for invalid hex characters", () => {
    expect(
      isValidEvmAddress("0xZZZZZZ1234567890abcdef1234567890abcdef12")
    ).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidEvmAddress("")).toBe(false);
  });
});

describe("isValidEvmRole", () => {
  it("returns true for a valid bytes32 role (0x + 64 hex chars)", () => {
    expect(isValidEvmRole("0x" + "a".repeat(64))).toBe(true);
  });

  it("returns true for the default admin role (all zeros)", () => {
    expect(isValidEvmRole("0x" + "0".repeat(64))).toBe(true);
  });

  it("returns false without 0x prefix", () => {
    expect(isValidEvmRole("a".repeat(64))).toBe(false);
  });

  it("returns false for too-short role", () => {
    expect(isValidEvmRole("0xabcdef")).toBe(false);
  });

  it("returns false for too-long role", () => {
    expect(isValidEvmRole("0x" + "a".repeat(65))).toBe(false);
  });

  it("returns false for invalid hex characters", () => {
    expect(isValidEvmRole("0x" + "g".repeat(64))).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidEvmRole("")).toBe(false);
  });
});

describe("isValidEvmTxHash", () => {
  it("returns true for a valid tx hash (0x + 64 hex chars)", () => {
    expect(isValidEvmTxHash("0x" + "a".repeat(64))).toBe(true);
  });

  it("returns true for a mixed-case tx hash", () => {
    expect(isValidEvmTxHash("0x" + "AbCdEf".repeat(10) + "AbCd")).toBe(true);
  });

  it("returns false without 0x prefix", () => {
    expect(isValidEvmTxHash("a".repeat(64))).toBe(false);
  });

  it("returns false for too-short hash", () => {
    expect(isValidEvmTxHash("0xabcdef")).toBe(false);
  });

  it("returns false for too-long hash", () => {
    expect(isValidEvmTxHash("0x" + "a".repeat(65))).toBe(false);
  });

  it("returns false for invalid hex characters", () => {
    expect(isValidEvmTxHash("0x" + "z".repeat(64))).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidEvmTxHash("")).toBe(false);
  });
});

describe("isValidEvmBlockNumber", () => {
  it("returns true for a positive integer", () => {
    expect(isValidEvmBlockNumber(12345)).toBe(true);
  });

  it("returns true for zero", () => {
    expect(isValidEvmBlockNumber(0)).toBe(true);
  });

  it("returns true for a positive bigint", () => {
    expect(isValidEvmBlockNumber(12345n)).toBe(true);
  });

  it("returns true for bigint zero", () => {
    expect(isValidEvmBlockNumber(0n)).toBe(true);
  });

  it("returns false for a negative number", () => {
    expect(isValidEvmBlockNumber(-1)).toBe(false);
  });

  it("returns false for a negative bigint", () => {
    expect(isValidEvmBlockNumber(-5n)).toBe(false);
  });

  it("returns false for a float", () => {
    expect(isValidEvmBlockNumber(1.5)).toBe(false);
  });

  it("returns false for a string", () => {
    expect(isValidEvmBlockNumber("100")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isValidEvmBlockNumber(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isValidEvmBlockNumber(undefined)).toBe(false);
  });
});

describe("validateEvmTopics", () => {
  it("validates RoleGranted needs topics [1,2,3]", () => {
    const topics = ["sig", "role", "account", "sender"];
    const result = validateEvmTopics(topics, "RoleGranted", baseContext);
    expect(result.valid).toBe(true);
  });

  it("fails RoleGranted when topic[3] is missing", () => {
    const topics = ["sig", "role", "account"];
    const result = validateEvmTopics(topics, "RoleGranted", baseContext);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("topics[3]");
  });

  it("validates OwnershipTransferred needs topics [1,2]", () => {
    const topics = ["sig", "prevOwner", "newOwner"];
    const result = validateEvmTopics(
      topics,
      "OwnershipTransferred",
      baseContext
    );
    expect(result.valid).toBe(true);
  });

  it("fails OwnershipTransferred when topic[2] is missing", () => {
    const topics = ["sig", "prevOwner"];
    const result = validateEvmTopics(
      topics,
      "OwnershipTransferred",
      baseContext
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain("topics[2]");
  });

  it("validates DefaultAdminTransferCanceled needs no topics", () => {
    const topics: string[] = [];
    const result = validateEvmTopics(
      topics,
      "DefaultAdminTransferCanceled",
      baseContext
    );
    expect(result.valid).toBe(true);
  });

  it("validates DefaultAdminDelayChangeScheduled needs no topics", () => {
    const result = validateEvmTopics(
      [],
      "DefaultAdminDelayChangeScheduled",
      baseContext
    );
    expect(result.valid).toBe(true);
  });

  it("fails when topics array is null", () => {
    const result = validateEvmTopics(null, "RoleGranted", baseContext);
    expect(result.valid).toBe(false);
  });

  it("fails when topics array is undefined", () => {
    const result = validateEvmTopics(undefined, "RoleGranted", baseContext);
    expect(result.valid).toBe(false);
  });

  it("returns valid for unknown event types (no requirements)", () => {
    const result = validateEvmTopics([], "UnknownEvent", baseContext);
    expect(result.valid).toBe(true);
  });
});

describe("validateEvmEvent", () => {
  it("validates a valid RoleGranted event", () => {
    const topics = ["sig", "role", "account", "sender"];
    const result = validateEvmEvent(
      topics,
      "RoleGranted",
      "ethereum-mainnet",
      100,
      "0xabc"
    );
    expect(result.valid).toBe(true);
  });

  it("fails for invalid RoleGranted event", () => {
    const topics = ["sig"];
    const result = validateEvmEvent(
      topics,
      "RoleGranted",
      "ethereum-mainnet",
      100
    );
    expect(result.valid).toBe(false);
  });

  it("accepts bigint block numbers", () => {
    const topics = ["sig", "role", "account", "sender"];
    const result = validateEvmEvent(
      topics,
      "RoleGranted",
      "ethereum-mainnet",
      100n
    );
    expect(result.valid).toBe(true);
  });

  it("works without transactionHash", () => {
    const topics = ["sig", "prev", "new"];
    const result = validateEvmEvent(
      topics,
      "OwnershipTransferred",
      "base-mainnet",
      50
    );
    expect(result.valid).toBe(true);
  });
});

describe("EVM_EVENT_TOPIC_REQUIREMENTS", () => {
  it("has the correct requirements for RoleGranted", () => {
    expect(EVM_EVENT_TOPIC_REQUIREMENTS.RoleGranted).toEqual([1, 2, 3]);
  });

  it("has the correct requirements for OwnershipTransferred", () => {
    expect(EVM_EVENT_TOPIC_REQUIREMENTS.OwnershipTransferred).toEqual([1, 2]);
  });

  it("has empty requirements for DefaultAdminTransferCanceled", () => {
    expect(EVM_EVENT_TOPIC_REQUIREMENTS.DefaultAdminTransferCanceled).toEqual(
      []
    );
  });

  it("has requirements for DefaultAdminTransferScheduled", () => {
    expect(EVM_EVENT_TOPIC_REQUIREMENTS.DefaultAdminTransferScheduled).toEqual([
      1,
    ]);
  });
});
