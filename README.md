# Argon2

[![Version](https://img.shields.io/npm/v/%40phi-ag%2Fargon2?style=for-the-badge&color=blue)](https://www.npmjs.com/package/@phi-ag/argon2)
[![Coverage](https://img.shields.io/codecov/c/github/phi-ag/argon2?style=for-the-badge)](https://app.codecov.io/github/phi-ag/argon2)
[![Downloads](https://img.shields.io/npm/d18m/%40phi-ag%2Fargon2?style=for-the-badge)](https://www.npmjs.com/package/@phi-ag/argon2)
[![Size](https://img.shields.io/npm/unpacked-size/%40phi-ag%2Fargon2?style=for-the-badge&label=size&color=lightgray)](https://www.npmjs.com/package/@phi-ag/argon2)

Minimal Argon2 WebAssembly SIMD build for all runtimes inspired by [antelle/argon2-browser](https://github.com/antelle/argon2-browser)

## Usage

    pnpm add @phi-ag/argon2

### Examples

Node.js / Deno / Bun

```ts
import initialize from "@phi-ag/argon2/node";

const argon2 = await initialize();

const password = "my secret password";
const { encoded } = argon2.hash(password);

argon2.verify(encoded, password);
```

Browser

```ts
import wasm from "@phi-ag/argon2/argon2.wasm?url";
import initialize from "@phi-ag/argon2/fetch";

const argon2 = await initialize(wasm);
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

    RUN  v2.1.1

    ✓ src/index.bench.ts (2) 23114ms
      ✓ hash and verify (2) 23112ms
        name                hz     min     max    mean     p75     p99    p995    p999     rme  samples
      · @phi-ag/argon2  5.4920  174.15  189.89  182.08  185.94  189.89  189.89  189.89  ±0.66%       55   fastest
      · hash-wasm       2.8805  335.22  369.88  347.16  352.52  369.88  369.88  369.88  ±0.94%       29

    BENCH  Summary

      @phi-ag/argon2 - src/index.bench.ts > hash and verify
        1.91x faster than hash-wasm

For the latest results see [Benchmark Action](https://github.com/phi-ag/argon2/actions/workflows/bench.yml)
