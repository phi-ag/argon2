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
import type { APIRoute } from "astro";

const argon2 = new Argon2(await WebAssembly.instantiate(wasm));

export const GET: APIRoute = ({ params }) => {
  const { encoded } = argon2.hash(params.password!);
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

    RUN  v3.1.4 /projects/phi-ag/argon2


    ✓ src/index.bench.ts > hash and verify 'defaults' 23092ms
        name                hz     min     max    mean     p75     p99    p995    p999     rme  samples
      · @phi-ag/argon2  5.6066  175.24  186.84  178.36  179.25  186.84  186.84  186.84  ±0.33%       57   fastest
      · hash-wasm       3.3434  292.47  327.23  299.10  299.20  327.23  327.23  327.23  ±0.84%       34

    ✓ src/index.bench.ts > hash and verify 'fast' 21120ms
        name                hz     min     max    mean     p75     p99    p995    p999     rme  samples
      · @phi-ag/argon2  330.46  2.9892  4.1449  3.0261  3.0320  3.1223  3.2020  3.6069  ±0.04%     3305   fastest
      · hash-wasm       159.50  5.8934  9.6542  6.2696  6.2504  7.7307  8.1197  9.4353  ±0.35%     1595

    ✓ src/index.bench.ts > hash and verify 'libsodium' 24191ms
        name                hz     min     max    mean     p75     p99    p995    p999     rme  samples
      · @phi-ag/argon2  4.3063  226.39  247.57  232.22  234.18  247.57  247.57  247.57  ±0.68%       44   fastest
      · libsodium.js    3.1743  312.12  321.69  315.03  315.26  321.69  321.69  321.69  ±0.28%       32

    BENCH  Summary

      @phi-ag/argon2 - src/index.bench.ts > hash and verify 'defaults'
        1.68x faster than hash-wasm

      @phi-ag/argon2 - src/index.bench.ts > hash and verify 'fast'
        2.07x faster than hash-wasm

      @phi-ag/argon2 - src/index.bench.ts > hash and verify 'libsodium'
        1.36x faster than libsodium.js

See [Benchmark Action](https://github.com/phi-ag/argon2/actions/workflows/bench.yml) for the latest results
