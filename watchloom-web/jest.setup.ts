import { webcrypto } from "node:crypto";
import { TextDecoder, TextEncoder } from "node:util";

Object.defineProperty(globalThis, "crypto", {
  configurable: true,
  value: webcrypto,
});

Object.defineProperty(globalThis, "TextDecoder", {
  configurable: true,
  value: TextDecoder,
});

Object.defineProperty(globalThis, "TextEncoder", {
  configurable: true,
  value: TextEncoder,
});
