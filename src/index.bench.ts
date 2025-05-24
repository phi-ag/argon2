import { argon2Verify, argon2id } from "hash-wasm";
import libsodium from "libsodium-wrappers-sumo";
import { bench, describe } from "vitest";

import {
  type Argon2HashOptions,
  Argon2Type,
  Argon2Version,
  generateSalt
} from "./index.js";
import initialize from "./node.js";

const defaults: Argon2HashOptions = {
  hashLength: 32,
  timeCost: 3,
  memoryCost: 65_536,
  parallelism: 4,
  type: Argon2Type.Argon2id,
  version: Argon2Version.Version13
};

const fast: Argon2HashOptions = {
  hashLength: 32,
  timeCost: 8,
  memoryCost: 512,
  parallelism: 1,
  type: Argon2Type.Argon2id,
  version: Argon2Version.Version13
};

const password = "my secret password";

describe.each([
  { name: "defaults", options: defaults },
  { name: "fast", options: fast }
])("hash and verify $name", async ({ options }) => {
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

  // NOTE: `hash-wasm` doesn't provide sync hash and verify functions.
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

describe("hash and verify 'libsodium'", async () => {
  /*
   * NOTE:
   * - `hashLength` is 32, see https://github.com/jedisct1/libsodium/blob/master/src/libsodium/crypto_pwhash/argon2/pwhash_argon2id.c#L15
   * - `memoryCost` is divided by 1024, see https://github.com/jedisct1/libsodium/blob/master/src/libsodium/crypto_pwhash/argon2/pwhash_argon2id.c#L168
   * - `parallelism` is 1, see https://github.com/jedisct1/libsodium/blob/master/src/libsodium/crypto_pwhash/argon2/pwhash_argon2id.c#L169
   * - Default salt length is 16, see https://github.com/jedisct1/libsodium/blob/master/src/libsodium/include/sodium/crypto_pwhash_argon2id.h#L37
   */
  const options: Argon2HashOptions = {
    hashLength: 32,
    timeCost: 4,
    memoryCost: 65_536,
    parallelism: 1,
    type: Argon2Type.Argon2id,
    version: Argon2Version.Version13
  };

  const argon2 = await initialize();
  await libsodium.ready;

  bench(
    "@phi-ag/argon2",
    () => {
      const { encoded } = argon2.hash(password, options);
      argon2.verify(encoded, password);
    },
    { time: 10_000 }
  );

  bench(
    "libsodium.js",
    () => {
      const hash = libsodium.crypto_pwhash_str(
        password,
        options.timeCost,
        options.memoryCost * 1024
      );

      if (!libsodium.crypto_pwhash_str_verify(hash, password))
        throw Error("Verify libsodium hash failed");
    },
    { time: 10_000 }
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
