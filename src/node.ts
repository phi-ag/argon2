import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import Argon2 from "./index.js";

const initializeNode = async (path?: string): Promise<Argon2> =>
  Argon2.initialize(async (imports) => {
    const $path = path ?? resolve(import.meta.dirname, "./argon2.wasm");
    const wasm = await readFile($path);
    const { instance } = await WebAssembly.instantiate(wasm, imports);
    return instance;
  });

export default initializeNode;
