import { describe, it, expect } from "vitest";
import {
  normalizeEvmAddress,
  normalizeStellarAddress,
  isValidEvmAddress,
  isValidStellarAddress,
  isZeroAddress,
  ZERO_ADDRESS,
} from "../address";

describe("normalizeEvmAddress", () => {
  it("normalizes a valid lowercase address", () => {
    const addr = "0xabcdef1234567890abcdef1234567890abcdef12";
    expect(normalizeEvmAddress(addr)).toBe(addr);
  });

  it("normalizes a valid mixed-case (checksummed) address to lowercase", () => {
    const addr = "0xAbCdEf1234567890AbCdEf1234567890AbCdEf12";
    expect(normalizeEvmAddress(addr)).toBe(addr.toLowerCase());
  });

  it("adds 0x prefix when missing", () => {
    const raw = "abcdef1234567890abcdef1234567890abcdef12";
    expect(normalizeEvmAddress(raw)).toBe(`0x${raw}`);
  });

  it("trims whitespace before normalizing", () => {
    const addr = "  0xabcdef1234567890abcdef1234567890abcdef12  ";
    expect(normalizeEvmAddress(addr)).toBe(
      "0xabcdef1234567890abcdef1234567890abcdef12"
    );
  });

  it("throws on empty string", () => {
    expect(() => normalizeEvmAddress("")).toThrow("Address is required");
  });

  it("throws on wrong length (too short)", () => {
    expect(() => normalizeEvmAddress("0xabcdef")).toThrow(
      "Invalid EVM address length"
    );
  });

  it("throws on wrong length (too long)", () => {
    expect(() =>
      normalizeEvmAddress("0xabcdef1234567890abcdef1234567890abcdef1234")
    ).toThrow("Invalid EVM address length");
  });

  it("throws on invalid hex characters", () => {
    expect(() =>
      normalizeEvmAddress("0xZZZZZZ1234567890abcdef1234567890abcdef12")
    ).toThrow("Invalid EVM address format");
  });

  it("throws on address without hex body", () => {
    expect(() =>
      normalizeEvmAddress("0xgggggggggggggggggggggggggggggggggggggggg")
    ).toThrow("Invalid EVM address format");
  });

  it("normalizes the zero address", () => {
    expect(
      normalizeEvmAddress("0x0000000000000000000000000000000000000000")
    ).toBe("0x0000000000000000000000000000000000000000");
  });
});

describe("normalizeStellarAddress", () => {
  it("returns a valid G-address as-is", () => {
    // Valid Stellar G-address (56 chars, G + 55 uppercase base32)
    const addr = "GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345";
    expect(normalizeStellarAddress(addr)).toBe(addr);
  });

  it("returns a valid C-address (contract) as-is", () => {
    const addr = "CABC2345GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345";
    expect(normalizeStellarAddress(addr)).toBe(addr);
  });

  it("trims whitespace", () => {
    const addr = "GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345";
    expect(normalizeStellarAddress(`  ${addr}  `)).toBe(addr);
  });

  it("throws on empty string", () => {
    expect(() => normalizeStellarAddress("")).toThrow("Address is required");
  });

  it("throws on wrong prefix (not G or C)", () => {
    const addr = "XABC2345GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345";
    expect(() => normalizeStellarAddress(addr)).toThrow(
      "Invalid Stellar address format"
    );
  });

  it("throws on wrong length (too short)", () => {
    expect(() => normalizeStellarAddress("GABC2345")).toThrow(
      "Invalid Stellar address format"
    );
  });

  it("throws on wrong length (too long)", () => {
    const addr =
      "GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345EXTRA";
    expect(() => normalizeStellarAddress(addr)).toThrow(
      "Invalid Stellar address format"
    );
  });

  it("throws on lowercase characters", () => {
    const addr = "Gabc2345gabc2345gabc2345gabc2345gabc2345gabc2345gabc2345";
    expect(() => normalizeStellarAddress(addr)).toThrow(
      "Invalid Stellar address format"
    );
  });

  it("throws on invalid base32 characters (1, 8, 9, 0 are invalid in Stellar base32)", () => {
    // Stellar uses RFC 4648 base32: A-Z and 2-7 only (no 0, 1, 8, 9)
    const addr = "G1892345GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345";
    expect(() => normalizeStellarAddress(addr)).toThrow(
      "Invalid Stellar address format"
    );
  });
});

describe("isValidEvmAddress", () => {
  it("returns true for a valid address", () => {
    expect(
      isValidEvmAddress("0xabcdef1234567890abcdef1234567890abcdef12")
    ).toBe(true);
  });

  it("returns true for a valid address without 0x prefix", () => {
    expect(isValidEvmAddress("abcdef1234567890abcdef1234567890abcdef12")).toBe(
      true
    );
  });

  it("returns false for an empty string", () => {
    expect(isValidEvmAddress("")).toBe(false);
  });

  it("returns false for a short address", () => {
    expect(isValidEvmAddress("0xabcdef")).toBe(false);
  });

  it("returns false for invalid characters", () => {
    expect(
      isValidEvmAddress("0xZZZZZZ1234567890abcdef1234567890abcdef12")
    ).toBe(false);
  });
});

describe("isValidStellarAddress", () => {
  it("returns true for a valid G-address", () => {
    const addr = "GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345";
    expect(isValidStellarAddress(addr)).toBe(true);
  });

  it("returns true for a valid C-address", () => {
    const addr = "CABC2345GABC2345GABC2345GABC2345GABC2345GABC2345GABC2345";
    expect(isValidStellarAddress(addr)).toBe(true);
  });

  it("returns false for an invalid address", () => {
    expect(isValidStellarAddress("INVALID")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isValidStellarAddress("")).toBe(false);
  });
});

describe("isZeroAddress", () => {
  it("returns true for the zero address", () => {
    expect(isZeroAddress("0x0000000000000000000000000000000000000000")).toBe(
      true
    );
  });

  it("returns true for the zero address without prefix", () => {
    expect(isZeroAddress("0000000000000000000000000000000000000000")).toBe(
      true
    );
  });

  it("returns false for a non-zero address", () => {
    expect(isZeroAddress("0xabcdef1234567890abcdef1234567890abcdef12")).toBe(
      false
    );
  });

  it("returns false for an invalid address", () => {
    expect(isZeroAddress("not-an-address")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isZeroAddress("")).toBe(false);
  });
});

describe("ZERO_ADDRESS constant", () => {
  it("is the 40-char zero address with 0x prefix", () => {
    expect(ZERO_ADDRESS).toBe("0x0000000000000000000000000000000000000000");
  });

  it("has length 42 (0x + 40 zeros)", () => {
    expect(ZERO_ADDRESS.length).toBe(42);
  });

  it("starts with 0x", () => {
    expect(ZERO_ADDRESS.startsWith("0x")).toBe(true);
  });
});
