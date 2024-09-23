export default Argon2ModuleFactory;

declare function Argon2ModuleFactory(
  overrides?: Partial<import("./index.js").Argon2Module>
): Promise<import("./index.js").Argon2Module>;
