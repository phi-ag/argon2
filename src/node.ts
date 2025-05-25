import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import Argon2 from "./index.js";

export default async function initialize(path?: string): Promise<Argon2> {
  const $path = path ?? resolve(import.meta.dirname, "./argon2.wasm");
  const wasm = await readFile($path);
  const { instance } = await WebAssembly.instantiate(wasm);
  return new Argon2(instance);
}
