# Argon2

[![Version](https://img.shields.io/npm/v/%40phi-ag%2Fargon2?style=for-the-badge)](https://www.npmjs.com/package/@phi-ag/argon2)
[![Downloads](https://img.shields.io/npm/d18m/%40phi-ag%2Fargon2?style=for-the-badge)](https://www.npmjs.com/package/@phi-ag/argon2)

Minimal Argon2 WebAssembly SIMD build for all runtimes inspired by [antelle/argon2-browser](https://github.com/antelle/argon2-browser).

## Usage

    pnpm add @phi-ag/argon2

### Examples

Node.js

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

Astro Server Endpoint running on Cloudflare Pages

```ts
import Argon2 from "@phi-ag/argon2";
// @ts-expect-error
import wasm from "@phi-ag/argon2/argon2.wasm?module";

const argon2 = await Argon2.initializeModule(wasm);

export const GET = async () => {
  const { encoded } = argon2.hash("my secret password");
  return new Response(encoded);
};
```
