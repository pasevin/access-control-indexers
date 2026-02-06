import { describe, it, expect, afterEach } from "vitest";
import { ensurePolyfills } from "../polyfills";

describe("ensurePolyfills", () => {
  it("does not throw when called", () => {
    expect(() => ensurePolyfills()).not.toThrow();
  });

  it("can be called multiple times without error", () => {
    expect(() => {
      ensurePolyfills();
      ensurePolyfills();
      ensurePolyfills();
    }).not.toThrow();
  });

  it("TextEncoder exists after calling ensurePolyfills", () => {
    ensurePolyfills();
    expect(typeof TextEncoder).not.toBe("undefined");
  });

  it("TextDecoder exists after calling ensurePolyfills", () => {
    ensurePolyfills();
    expect(typeof TextDecoder).not.toBe("undefined");
  });

  it("TextEncoder encodes ASCII text correctly", () => {
    ensurePolyfills();
    const encoder = new TextEncoder();
    const encoded = encoder.encode("hello");
    expect(encoded).toBeInstanceOf(Uint8Array);
    expect(encoded.length).toBe(5);
    expect(encoded[0]).toBe(104); // 'h'
    expect(encoded[1]).toBe(101); // 'e'
    expect(encoded[2]).toBe(108); // 'l'
    expect(encoded[3]).toBe(108); // 'l'
    expect(encoded[4]).toBe(111); // 'o'
  });

  it("TextDecoder decodes ASCII bytes correctly", () => {
    ensurePolyfills();
    const decoder = new TextDecoder();
    const bytes = new Uint8Array([104, 101, 108, 108, 111]);
    expect(decoder.decode(bytes)).toBe("hello");
  });

  it("round-trips ASCII text through encode/decode", () => {
    ensurePolyfills();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const text = "The quick brown fox jumps over the lazy dog";
    expect(decoder.decode(encoder.encode(text))).toBe(text);
  });

  it("round-trips Unicode text through encode/decode", () => {
    ensurePolyfills();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    // Multi-byte characters: é is 2 bytes, 中 is 3 bytes
    const text = "café 中文";
    expect(decoder.decode(encoder.encode(text))).toBe(text);
  });

  it("encodes empty string", () => {
    ensurePolyfills();
    const encoder = new TextEncoder();
    const encoded = encoder.encode("");
    expect(encoded.length).toBe(0);
  });

  it("decodes empty Uint8Array", () => {
    ensurePolyfills();
    const decoder = new TextDecoder();
    expect(decoder.decode(new Uint8Array([]))).toBe("");
  });

  it("handles 2-byte UTF-8 characters", () => {
    ensurePolyfills();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    // ñ = U+00F1, 2-byte in UTF-8: 0xC3 0xB1
    const text = "ñ";
    const encoded = encoder.encode(text);
    expect(encoded.length).toBe(2);
    expect(decoder.decode(encoded)).toBe(text);
  });

  it("handles 3-byte UTF-8 characters", () => {
    ensurePolyfills();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    // 中 = U+4E2D, 3-byte in UTF-8
    const text = "中";
    const encoded = encoder.encode(text);
    expect(encoded.length).toBe(3);
    expect(decoder.decode(encoded)).toBe(text);
  });
});
