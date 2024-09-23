// @ts-ignore
import wasm from "@phi-ag/argon2/argon2.wasm";

import Argon2, { type Argon2Module } from "./index";

const initializeWorkerd = async (overrides?: Partial<Argon2Module>): Promise<Argon2> =>
  Argon2.initialize({
    instantiateWasm: (imports, cb) => {
      const instance = new WebAssembly.Instance(wasm, imports);
      cb(instance);
      return instance.exports;
    },
    ...overrides
  });

export default initializeWorkerd;
