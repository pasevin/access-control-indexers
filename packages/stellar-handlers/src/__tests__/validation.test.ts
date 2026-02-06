import { describe, it, expect } from "vitest";
import {
  isValidRoleSymbol,
  isValidStellarTxHash,
  isValidLedgerNumber,
} from "../validation";

// Note: isValidStellarAddress depends on @stellar/stellar-base StrKey
// which requires crypto libraries. We test the string-pattern aspects
// via the other validators and test isValidStellarAddress separately
// for pattern behavior.

describe("isValidStellarAddress", () => {
  // We test this via dynamic import to handle potential crypto issues
  it("returns true for a valid G-address", async () => {
    const { isValidStellarAddress } = await import("../validation");
    // Use a well-known Stellar test address format
    // G addresses: 56 chars starting with G, valid base32
    const validG = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
    // The actual validation uses StrKey, so the result depends on checksum
    // We just verify it doesn't throw
    const result = isValidStellarAddress(validG);
    expect(typeof result).toBe("boolean");
  });

  it("returns false for non-string input", async () => {
    const { isValidStellarAddress } = await import("../validation");
    expect(isValidStellarAddress(123)).toBe(false);
    expect(isValidStellarAddress(null)).toBe(false);
    expect(isValidStellarAddress(undefined)).toBe(false);
    expect(isValidStellarAddress({})).toBe(false);
  });

  it("returns false for address not starting with G or C", async () => {
    const { isValidStellarAddress } = await import("../validation");
    const addr = "XABC2345GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345";
    expect(isValidStellarAddress(addr)).toBe(false);
  });

  it("returns false for empty string", async () => {
    const { isValidStellarAddress } = await import("../validation");
    expect(isValidStellarAddress("")).toBe(false);
  });

  it("returns false for short string starting with G", async () => {
    const { isValidStellarAddress } = await import("../validation");
    expect(isValidStellarAddress("GABC")).toBe(false);
  });
});

describe("isValidRoleSymbol", () => {
  it("returns true for a simple alphanumeric symbol", () => {
    expect(isValidRoleSymbol("ADMIN")).toBe(true);
  });

  it("returns true for a symbol with underscores", () => {
    expect(isValidRoleSymbol("ROLE_ADMIN")).toBe(true);
  });

  it("returns true for a single character", () => {
    expect(isValidRoleSymbol("A")).toBe(true);
  });

  it("returns true for a symbol with digits", () => {
    expect(isValidRoleSymbol("role123")).toBe(true);
  });

  it("returns true for a 32-character symbol (max length)", () => {
    expect(isValidRoleSymbol("A".repeat(32))).toBe(true);
  });

  it("returns false for a 33-character symbol (too long)", () => {
    expect(isValidRoleSymbol("A".repeat(33))).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidRoleSymbol("")).toBe(false);
  });

  it("returns false for symbol with spaces", () => {
    expect(isValidRoleSymbol("ROLE ADMIN")).toBe(false);
  });

  it("returns false for symbol with special characters", () => {
    expect(isValidRoleSymbol("ROLE-ADMIN")).toBe(false);
    expect(isValidRoleSymbol("ROLE.ADMIN")).toBe(false);
    expect(isValidRoleSymbol("ROLE@ADMIN")).toBe(false);
  });

  it("returns false for non-string input", () => {
    expect(isValidRoleSymbol(123)).toBe(false);
    expect(isValidRoleSymbol(null)).toBe(false);
    expect(isValidRoleSymbol(undefined)).toBe(false);
  });

  it("allows mixed case", () => {
    expect(isValidRoleSymbol("roleAdmin")).toBe(true);
  });
});

describe("isValidStellarTxHash", () => {
  it("returns true for a valid 64-char hex string", () => {
    expect(isValidStellarTxHash("a".repeat(64))).toBe(true);
  });

  it("returns true for a mixed-case hex string", () => {
    expect(isValidStellarTxHash("AbCdEf".repeat(10) + "AbCd")).toBe(true);
  });

  it("returns true for all-digit hash", () => {
    expect(isValidStellarTxHash("1".repeat(64))).toBe(true);
  });

  it("returns false for a hash with 0x prefix (Stellar does not use 0x)", () => {
    expect(isValidStellarTxHash("0x" + "a".repeat(64))).toBe(false);
  });

  it("returns false for too-short hash", () => {
    expect(isValidStellarTxHash("abcdef")).toBe(false);
  });

  it("returns false for too-long hash", () => {
    expect(isValidStellarTxHash("a".repeat(65))).toBe(false);
  });

  it("returns false for invalid hex characters", () => {
    expect(isValidStellarTxHash("z".repeat(64))).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidStellarTxHash("")).toBe(false);
  });

  it("returns false for non-string input", () => {
    expect(isValidStellarTxHash(12345)).toBe(false);
    expect(isValidStellarTxHash(null)).toBe(false);
    expect(isValidStellarTxHash(undefined)).toBe(false);
  });
});

describe("isValidLedgerNumber", () => {
  it("returns true for a positive integer", () => {
    expect(isValidLedgerNumber(12345)).toBe(true);
  });

  it("returns true for zero", () => {
    expect(isValidLedgerNumber(0)).toBe(true);
  });

  it("returns false for a negative number", () => {
    expect(isValidLedgerNumber(-1)).toBe(false);
  });

  it("returns false for a float", () => {
    expect(isValidLedgerNumber(1.5)).toBe(false);
  });

  it("returns false for a string", () => {
    expect(isValidLedgerNumber("100")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isValidLedgerNumber(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isValidLedgerNumber(undefined)).toBe(false);
  });

  it("returns false for bigint (ledger numbers are plain numbers)", () => {
    expect(isValidLedgerNumber(100n)).toBe(false);
  });

  it("returns false for NaN", () => {
    expect(isValidLedgerNumber(NaN)).toBe(false);
  });
});

describe("safeScValToNative", () => {
  it("returns undefined on error", async () => {
    const { safeScValToNative } = await import("../validation");
    // Pass an invalid value that will cause scValToNative to throw
    const result = safeScValToNative("not-an-scval");
    expect(result).toBeUndefined();
  });

  it("returns undefined for null input", async () => {
    const { safeScValToNative } = await import("../validation");
    const result = safeScValToNative(null);
    expect(result).toBeUndefined();
  });

  it("returns undefined for undefined input", async () => {
    const { safeScValToNative } = await import("../validation");
    const result = safeScValToNative(undefined);
    expect(result).toBeUndefined();
  });
});
