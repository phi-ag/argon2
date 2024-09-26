import { argon2Verify, argon2id } from "hash-wasm";
import { bench, describe } from "vitest";

import {
  type Argon2HashOptions,
  Argon2Type,
  Argon2Version,
  generateSalt
} from "./index.js";
import initialize from "./node.js";

describe("hash and verify", async () => {
  const password = "my secret password";

  const options: Argon2HashOptions = {
    hashLength: 32,
    timeCost: 3,
    memoryCost: 65_536,
    parallelism: 4,
    type: Argon2Type.Argon2id,
    version: Argon2Version.Version13
  };

  // NOTE: `hash-wasm` doesn't provide a initialize function,
  // using 1 second warmup time trying to compensate for this.
  const argon2 = await initialize();

  bench(
    "@phi-ag/argon2",
    () => {
      const { encoded } = argon2.hash(password, options);
      // NOTE: Passing type to `verify` would skip parsing type from encoded string.
      argon2.verify(encoded, password);
    },
    { time: 10_000 }
  );

  // NOTE: `hash-wasm` functions are async, while ours are sync.
  bench(
    "hash-wasm",
    async () => {
      // NOTE: Identical function call in `argon2.hash`.
      const salt = generateSalt(16);

      // NOTE: It's not possible to provide password and options separately.
      const hash = await argon2id({
        password,
        salt,
        parallelism: options.parallelism,
        iterations: options.timeCost,
        memorySize: options.memoryCost,
        hashLength: options.hashLength,
        outputType: "encoded"
      });

      await argon2Verify({
        password,
        hash
      });
    },
    { time: 10_000, warmupTime: 1_000 }
  );
});

describe.skip("memory view", async () => {
  const buffer = new ArrayBuffer(128 * 1024 * 1024);
  const fixed = new Uint8Array(buffer);

  bench("fixed", () => {
    fixed.subarray(65_536, 65_536 + 100);
  });

  bench("recreate", () => {
    new Uint8Array(buffer).subarray(65_536, 65_536 + 100);
  });
});