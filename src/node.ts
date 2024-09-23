import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import Argon2, { type Argon2Module } from "./index.js";

const initializeNode = async (
  path?: string,
  overrides?: Partial<Argon2Module>
): Promise<Argon2> => {
  const wasmPath = path ?? resolve(import.meta.dirname, "./argon2.wasm");
  const wasm = await readFile(wasmPath);

  return Argon2.initialize({
    instantiateWasm: (imports, cb) => {
      WebAssembly.instantiate(wasm, imports).then((instance) => cb(instance.instance));
      return {};
    },
    ...overrides
  });
};

export default initializeNode;
