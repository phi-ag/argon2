# Argon2

[![Version](https://img.shields.io/npm/v/%40phi-ag%2Fargon2?style=for-the-badge&color=blue)](https://www.npmjs.com/package/@phi-ag/argon2)
[![Coverage](https://img.shields.io/codecov/c/github/phi-ag/argon2?style=for-the-badge)](https://app.codecov.io/github/phi-ag/argon2)
[![Downloads](https://img.shields.io/npm/d18m/%40phi-ag%2Fargon2?style=for-the-badge)](https://www.npmjs.com/package/@phi-ag/argon2)
[![Size](https://img.shields.io/npm/unpacked-size/%40phi-ag%2Fargon2?style=for-the-badge&label=size&color=lightgray)](https://www.npmjs.com/package/@phi-ag/argon2)

Minimal Argon2 WebAssembly SIMD build inspired by [antelle/argon2-browser](https://github.com/antelle/argon2-browser)

## Usage

    pnpm add @phi-ag/argon2

### Examples

Node.js / Deno / Bun (see [node.ts](src/node.ts))

```ts
import initialize from "@phi-ag/argon2/node";

const argon2 = await initialize();

const password = "my secret password";
const { encoded } = argon2.hash(password);

argon2.verify(encoded, password);
```

Browser (Vite, see [fetch.ts](src/fetch.ts))

```ts
import wasm from "@phi-ag/argon2/argon2.wasm?url";
import initialize from "@phi-ag/argon2/fetch";

const argon2 = await initialize(wasm);
const { encoded } = argon2.hash("my secret password");
```

Browser (Vanilla, see [e2e/index.html](e2e/index.html))

```ts
import initialize from "/fetch.js";

const argon2 = await initialize("/argon2.wasm");
const { encoded } = argon2.hash("my secret password");
```

Astro endpoint running on [Cloudflare](https://developers.cloudflare.com/workers/runtime-apis/webassembly/javascript/#use-from-javascript)

```ts
import Argon2 from "@phi-ag/argon2";
// @ts-expect-error
import wasm from "@phi-ag/argon2/argon2.wasm";

const argon2 = await Argon2.initializeModule(wasm);

export const GET = async () => {
  const { encoded } = argon2.hash("my secret password");
  return new Response(encoded);
};
```

If you don't want to throw errors, use `tryHash` and `tryVerify`

```ts
argon2.tryHash("my secret password");
// => { success: true; data: { encoded, hash } }

argon2.tryHash("my secret password", { timeCost: 0 });
// => { success: false; error: "Time cost is too small" }

argon2.tryVerify(encoded, "my secret password");
// => { success: true }

argon2.tryVerify(encoded, "not my password");
// => { success: false, error: "The password does not match the supplied hash" }
```

## Benchmark

See [index.bench.ts](src/index.bench.ts) for caveats

    pnpm bench

Example results

    RUN  v2.1.1 /projects/phi-ag/argon2

    ✓ src/index.bench.ts (6) 44543ms
      ✓ hash and verify 'defaults' (2) 23411ms
        name                hz     min     max    mean     p75     p99    p995    p999     rme  samples
      · @phi-ag/argon2  5.5338  178.39  185.45  180.71  180.96  185.45  185.45  185.45  ±0.15%       56   fastest
      · hash-wasm       2.9151  339.32  359.78  343.04  344.10  359.78  359.78  359.78  ±0.44%       30
      ✓ hash and verify 'fast' (2) 21129ms
        name                hz     min     max    mean     p75     p99    p995    p999     rme  samples
      · @phi-ag/argon2  330.82  2.9909  3.7024  3.0228  3.0351  3.1311  3.1985  3.3719  ±0.03%     3309   fastest
      · hash-wasm       158.71  5.9113  8.4492  6.3007  6.3645  7.7453  7.8111  7.9284  ±0.38%     1588

    BENCH  Summary

      @phi-ag/argon2 - src/index.bench.ts > hash and verify 'defaults'
        1.90x faster than hash-wasm

      @phi-ag/argon2 - src/index.bench.ts > hash and verify 'fast'
        2.08x faster than hash-wasm

See [Benchmark Action](https://github.com/phi-ag/argon2/actions/workflows/bench.yml) for the latest results
