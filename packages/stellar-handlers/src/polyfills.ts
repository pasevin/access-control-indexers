/**
 * Polyfills for Stellar SDK compatibility in SubQuery sandbox
 *
 * The SubQuery sandbox environment may not provide TextEncoder/TextDecoder
 * which are required by the Stellar SDK. These polyfills ensure compatibility.
 */
export function ensurePolyfills(): void {
  if (typeof TextEncoder === 'undefined') {
    (globalThis as any).TextEncoder = class TextEncoder {
      encode(input: string): Uint8Array {
        const bytes: number[] = [];
        for (let i = 0; i < input.length; i++) {
          let c = input.charCodeAt(i);
          if (c < 0x80) {
            bytes.push(c);
          } else if (c < 0x800) {
            bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
          } else if (c < 0xd800 || c >= 0xe000) {
            bytes.push(
              0xe0 | (c >> 12),
              0x80 | ((c >> 6) & 0x3f),
              0x80 | (c & 0x3f)
            );
          } else {
            i++;
            c =
              0x10000 +
              (((c & 0x3ff) << 10) | (input.charCodeAt(i) & 0x3ff));
            bytes.push(
              0xf0 | (c >> 18),
              0x80 | ((c >> 12) & 0x3f),
              0x80 | ((c >> 6) & 0x3f),
              0x80 | (c & 0x3f)
            );
          }
        }
        return new Uint8Array(bytes);
      }
    };
  }

  if (typeof TextDecoder === 'undefined') {
    (globalThis as any).TextDecoder = class TextDecoder {
      decode(input: Uint8Array): string {
        let result = '';
        let i = 0;
        while (i < input.length) {
          const c = input[i];
          if (c < 0x80) {
            result += String.fromCharCode(c);
            i++;
          } else if ((c & 0xe0) === 0xc0) {
            result += String.fromCharCode(
              ((c & 0x1f) << 6) | (input[i + 1] & 0x3f)
            );
            i += 2;
          } else if ((c & 0xf0) === 0xe0) {
            result += String.fromCharCode(
              ((c & 0x0f) << 12) |
                ((input[i + 1] & 0x3f) << 6) |
                (input[i + 2] & 0x3f)
            );
            i += 3;
          } else {
            const codePoint =
              ((c & 0x07) << 18) |
              ((input[i + 1] & 0x3f) << 12) |
              ((input[i + 2] & 0x3f) << 6) |
              (input[i + 3] & 0x3f);
            const adjusted = codePoint - 0x10000;
            result += String.fromCharCode(
              0xd800 + (adjusted >> 10),
              0xdc00 + (adjusted & 0x3ff)
            );
            i += 4;
          }
        }
        return result;
      }
    };
  }
}
