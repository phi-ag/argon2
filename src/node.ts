import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import Argon2, { type Argon2Module } from "./index.js";

const initializeNode = async (
  path?: string,
  overrides?: Partial<Argon2Module>
): Promise<Argon2> => {
  const wasmPath = path ?? resolve(import.meta.dirname, "./argon2.wasm");
  const wasm = await readFile(wasmPath);
  return await Argon2.initializeBuffer(wasm, overrides);
};

export default initializeNode;
