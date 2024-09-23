import { type Argon2Module } from "./index.js";

export default Argon2ModuleFactory;

declare function Argon2ModuleFactory(
  overrides?: Partial<Argon2Module>
): Promise<Argon2Module>;
