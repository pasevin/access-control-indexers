import { describe, it, expect, vi } from "vitest";
import {
  validateRequiredFields,
  validateArrayElements,
  isValidEvent,
  logAndSkipIfInvalid,
  isValidBlockNumber,
  isValidTimestamp,
  isValidHex,
} from "../validation";
import type { EventContext, EventValidationResult } from "../validation";

const baseContext: EventContext = {
  network: "ethereum-mainnet",
  blockNumber: 12345,
  transactionHash: "0xabc",
  eventType: "RoleGranted",
};

describe("validateRequiredFields", () => {
  it("returns valid when all required fields are present", () => {
    const data = { name: "Alice", role: "admin" };
    const result = validateRequiredFields(data, ["name", "role"], baseContext);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("returns failure when a field is undefined", () => {
    const data = { name: "Alice", role: undefined } as Record<string, unknown>;
    const result = validateRequiredFields(data, ["name", "role"], baseContext);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Missing required field "role"');
  });

  it("returns failure when a field is null", () => {
    const data = { name: null, role: "admin" } as Record<string, unknown>;
    const result = validateRequiredFields(data, ["name", "role"], baseContext);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Missing required field "name"');
  });

  it("returns valid when no required fields are specified", () => {
    const data = {};
    const result = validateRequiredFields(data, [], baseContext);
    expect(result.valid).toBe(true);
  });

  it("includes event context in error message", () => {
    const data = { field: undefined } as Record<string, unknown>;
    const result = validateRequiredFields(data, ["field"], baseContext);
    expect(result.error).toContain("RoleGranted");
    expect(result.error).toContain("12345");
    expect(result.error).toContain("ethereum-mainnet");
  });

  it("includes transaction hash in error context when present", () => {
    const data = { field: undefined } as Record<string, unknown>;
    const result = validateRequiredFields(data, ["field"], baseContext);
    expect(result.error).toContain("0xabc");
  });

  it("omits transaction hash in error context when not present", () => {
    const ctxNoTx: EventContext = {
      network: "stellar-mainnet",
      blockNumber: 100,
      eventType: "RoleGranted",
    };
    const data = { field: undefined } as Record<string, unknown>;
    const result = validateRequiredFields(data, ["field"], ctxNoTx);
    expect(result.error).not.toContain("tx:");
  });

  it("catches the first missing field and stops", () => {
    const data = { a: undefined, b: undefined } as Record<string, unknown>;
    const result = validateRequiredFields(data, ["a", "b"], baseContext);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('"a"');
  });

  it("treats 0 and empty string as valid (not missing)", () => {
    const data = { count: 0, label: "" };
    const result = validateRequiredFields(
      data,
      ["count", "label"],
      baseContext
    );
    expect(result.valid).toBe(true);
  });
});

describe("validateArrayElements", () => {
  it("returns valid when all required indices are present", () => {
    const arr = ["a", "b", "c"];
    const result = validateArrayElements(arr, [0, 1, 2], "topics", baseContext);
    expect(result.valid).toBe(true);
  });

  it("returns failure when array is null", () => {
    const result = validateArrayElements(null, [0], "topics", baseContext);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Missing topics");
  });

  it("returns failure when array is undefined", () => {
    const result = validateArrayElements(undefined, [0], "topics", baseContext);
    expect(result.valid).toBe(false);
  });

  it("returns failure when a required index is missing (undefined)", () => {
    const arr = ["a", undefined, "c"] as (string | undefined)[];
    const result = validateArrayElements(arr, [0, 1], "topics", baseContext);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("topics[1]");
  });

  it("returns failure when array is shorter than required index", () => {
    const arr = ["a"];
    const result = validateArrayElements(arr, [0, 1], "topics", baseContext);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("topics[1]");
  });

  it("returns valid when no indices are required", () => {
    const arr = ["a"];
    const result = validateArrayElements(arr, [], "topics", baseContext);
    expect(result.valid).toBe(true);
  });

  it("returns valid when no indices required and array is empty", () => {
    const result = validateArrayElements([], [], "topics", baseContext);
    expect(result.valid).toBe(true);
  });
});

describe("isValidEvent", () => {
  it("returns true for a valid result", () => {
    const result: EventValidationResult = { valid: true };
    expect(isValidEvent(result)).toBe(true);
  });

  it("returns false and logs for an invalid result", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result: EventValidationResult = {
      valid: false,
      error: "test error",
    };
    expect(isValidEvent(result)).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(
      "Skipping malformed event: test error"
    );
    warnSpy.mockRestore();
  });
});

describe("logAndSkipIfInvalid", () => {
  it("returns false (should not skip) for valid result", () => {
    const result: EventValidationResult = { valid: true };
    expect(logAndSkipIfInvalid(result)).toBe(false);
  });

  it("returns true (should skip) and logs for invalid result", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result: EventValidationResult = {
      valid: false,
      error: "bad event",
    };
    expect(logAndSkipIfInvalid(result)).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith("Skipping malformed event: bad event");
    warnSpy.mockRestore();
  });
});

describe("isValidBlockNumber", () => {
  it("returns true for a positive integer", () => {
    expect(isValidBlockNumber(100)).toBe(true);
  });

  it("returns true for zero", () => {
    expect(isValidBlockNumber(0)).toBe(true);
  });

  it("returns true for a positive bigint", () => {
    expect(isValidBlockNumber(100n)).toBe(true);
  });

  it("returns true for bigint zero", () => {
    expect(isValidBlockNumber(0n)).toBe(true);
  });

  it("returns false for a negative number", () => {
    expect(isValidBlockNumber(-1)).toBe(false);
  });

  it("returns false for a negative bigint", () => {
    expect(isValidBlockNumber(-1n)).toBe(false);
  });

  it("returns false for a non-integer (float)", () => {
    expect(isValidBlockNumber(1.5)).toBe(false);
  });

  it("returns false for a string", () => {
    expect(isValidBlockNumber("100")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isValidBlockNumber(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isValidBlockNumber(undefined)).toBe(false);
  });
});

describe("isValidTimestamp", () => {
  it("returns true for a valid Date", () => {
    expect(isValidTimestamp(new Date("2024-01-01"))).toBe(true);
  });

  it("returns true for Date.now() wrapped in Date", () => {
    expect(isValidTimestamp(new Date())).toBe(true);
  });

  it("returns false for an invalid Date", () => {
    expect(isValidTimestamp(new Date("not-a-date"))).toBe(false);
  });

  it("returns false for a number (epoch timestamp)", () => {
    expect(isValidTimestamp(1700000000)).toBe(false);
  });

  it("returns false for a string", () => {
    expect(isValidTimestamp("2024-01-01")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isValidTimestamp(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isValidTimestamp(undefined)).toBe(false);
  });
});

describe("isValidHex", () => {
  it("returns true for a valid hex with 0x prefix", () => {
    expect(isValidHex("0xabcdef")).toBe(true);
  });

  it("returns true for a valid hex with prefix and expected length", () => {
    expect(isValidHex("0xabcdef1234", 10)).toBe(true);
  });

  it("returns false when expected length does not match", () => {
    expect(isValidHex("0xabcdef", 10)).toBe(false);
  });

  it("returns false for hex without prefix when prefix is required (default)", () => {
    expect(isValidHex("abcdef")).toBe(false);
  });

  it("returns true for hex without prefix when prefix is not required", () => {
    expect(isValidHex("abcdef", undefined, false)).toBe(true);
  });

  it("returns true for hex with prefix when prefix is not required", () => {
    expect(isValidHex("0xabcdef", undefined, false)).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isValidHex("")).toBe(false);
  });

  it("returns false for non-hex characters with prefix", () => {
    expect(isValidHex("0xGHIJKL")).toBe(false);
  });

  it("validates expected length excluding prefix", () => {
    // 0x + 64 chars = valid bytes32
    const bytes32 = "0x" + "a".repeat(64);
    expect(isValidHex(bytes32, 64)).toBe(true);
  });

  it("validates expected length without prefix", () => {
    const hash = "a".repeat(64);
    expect(isValidHex(hash, 64, false)).toBe(true);
  });

  it('returns false for just "0x" with no hex body', () => {
    expect(isValidHex("0x")).toBe(false);
  });
});
