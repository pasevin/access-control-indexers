import { describe, it, expect } from "vitest";
import { formatRole, normalizeAddress, isOwnershipRenounce } from "../utils";

describe("formatRole", () => {
  it("normalizes a role with 0x prefix to lowercase", () => {
    const role =
      "0xABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890";
    expect(formatRole(role)).toBe(role.toLowerCase());
  });

  it("adds 0x prefix when missing and lowercases", () => {
    const role =
      "ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890";
    expect(formatRole(role)).toBe(`0x${role.toLowerCase()}`);
  });

  it("returns already-lowercase role with prefix unchanged", () => {
    const role = "0x" + "a".repeat(64);
    expect(formatRole(role)).toBe(role);
  });

  it("handles the default admin role (all zeros)", () => {
    const role = "0x" + "0".repeat(64);
    expect(formatRole(role)).toBe(role);
  });

  it("handles short role identifiers", () => {
    expect(formatRole("0xABCD")).toBe("0xabcd");
  });

  it("handles role without prefix", () => {
    expect(formatRole("ABCD")).toBe("0xabcd");
  });
});

describe("normalizeAddress", () => {
  it("normalizes a valid EVM address to lowercase with 0x prefix", () => {
    const addr = "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12";
    expect(normalizeAddress(addr)).toBe(addr.toLowerCase());
  });

  it("adds 0x prefix if missing", () => {
    const addr = "abcdef1234567890abcdef1234567890abcdef12";
    expect(normalizeAddress(addr)).toBe(`0x${addr}`);
  });

  it("throws on invalid address", () => {
    expect(() => normalizeAddress("invalid")).toThrow();
  });

  it("throws on empty string", () => {
    expect(() => normalizeAddress("")).toThrow("Address is required");
  });
});

describe("isOwnershipRenounce", () => {
  it("returns true for the zero address", () => {
    expect(
      isOwnershipRenounce("0x0000000000000000000000000000000000000000")
    ).toBe(true);
  });

  it("returns true for the zero address without prefix", () => {
    expect(
      isOwnershipRenounce("0000000000000000000000000000000000000000")
    ).toBe(true);
  });

  it("returns false for a non-zero address", () => {
    expect(
      isOwnershipRenounce("0xabcdef1234567890abcdef1234567890abcdef12")
    ).toBe(false);
  });

  it("returns false for an invalid address", () => {
    expect(isOwnershipRenounce("not-an-address")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isOwnershipRenounce("")).toBe(false);
  });

  it("returns false for address with only some zeros", () => {
    expect(
      isOwnershipRenounce("0x0000000000000000000000000000000000000001")
    ).toBe(false);
  });
});
