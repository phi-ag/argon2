// @ts-expect-error Polyfill `Symbol.dispose`
// see https://github.com/evanw/esbuild/issues/3920#issuecomment-2367183692
Symbol.dispose ??= Symbol("Symbol.dispose");

export enum Argon2Type {
  Argon2d = 0,
  Argon2i = 1,
  Argon2id = 2
}

export enum Argon2Version {
  Version10 = 0x10,
  Version13 = 0x13
}

export interface Argon2HashOptions {
  salt?: Uint8Array;
  hashLength: number;
  timeCost: number;
  memoryCost: number;
  parallelism: number;
  type: Argon2Type;
  version: Argon2Version;
}

export interface Argon2HashData {
  encoded: string;
  hash: Uint8Array;
}

export interface Argon2TryHashSuccess {
  success: true;
  error?: never;
  data: Argon2HashData;
}

export interface Argon2TryHashError {
  success: false;
  error: string;
  data?: never;
}

export type Argon2TryHashResult = Argon2TryHashSuccess | Argon2TryHashError;

export interface Argon2TryVerifySuccess {
  success: true;
  error?: never;
}

export interface Argon2TryVerifyError {
  success: false;
  error: string;
}

export type Argon2TryVerifyResult = Argon2TryVerifySuccess | Argon2TryVerifyError;

export const typeFromEncoded = (encoded: string): Argon2Type | undefined => {
  if (!encoded?.length) return;
  if (encoded.startsWith("$argon2d$")) return Argon2Type.Argon2d;
  if (encoded.startsWith("$argon2i$")) return Argon2Type.Argon2i;
  if (encoded.startsWith("$argon2id$")) return Argon2Type.Argon2id;
};

export const defaultHashOptions: Argon2HashOptions = {
  hashLength: 32,
  timeCost: 3,
  memoryCost: 65_536,
  parallelism: 4,
  type: Argon2Type.Argon2id,
  version: Argon2Version.Version13
};

const validateHashOptions = (opts: Argon2HashOptions): string | undefined => {
  if (!Number.isInteger(opts.hashLength)) return "Hash length must be an integer";
  if (!Number.isInteger(opts.timeCost)) return "Time cost must be an integer";
  if (!Number.isInteger(opts.memoryCost)) return "Memory cost must be an integer";
  if (!Number.isInteger(opts.parallelism)) return "Parallelism must be an integer";

  if (opts.hashLength < 4) return "Hash length is too small";
  if (opts.timeCost < 1) return "Time cost is too small";
  if (opts.memoryCost < 32) return "Memory cost is too small";
  if (opts.parallelism < 1) return "Parallelism is too small";

  if (!(opts.type in Argon2Type)) return "Invalid type";
  if (!(opts.version in Argon2Version)) return "Invalid version";

  if (opts.salt) {
    if (!(opts.salt instanceof Uint8Array)) return "Salt must be of type Uint8Array";
    if (opts.salt.length < 8) return "Salt length is too small";
  }
};

type Ptr = number;

type DisposablePtr = Disposable & { ptr: Ptr };

interface Argon2Exports extends WebAssembly.Exports {
  memory: WebAssembly.Memory;
  _initialize: () => void;
  malloc(length: number): number;
  free(ptr: Ptr): void;
  argon2_hash(
    timeCost: number,
    memoryCost: number,
    parallelism: number,
    password: Ptr,
    passwordLength: number,
    salt: Ptr,
    saltLength: number,
    hash: Ptr,
    hashLength: number,
    encoded: Ptr,
    encodedLength: number,
    type: Argon2Type,
    version: Argon2Version
  ): number;
  argon2_verify(
    encoded: Ptr,
    password: Ptr,
    passwordLength: number,
    type: Argon2Type
  ): number;
  argon2_error_message(error: Ptr): number;
  argon2_encodedlen(
    timeCost: number,
    memoryCost: number,
    parallelism: number,
    saltLength: number,
    hashLength: number,
    type: Argon2Type
  ): number;
}

export const toHex = (array: Uint8Array): string =>
  Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export const generateSalt = (length: number): Uint8Array => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

class Argon2 {
  readonly #exports: Argon2Exports;
  readonly #encoder = new TextEncoder();
  readonly #decoder = new TextDecoder("utf8");

  constructor(instance: WebAssembly.Instance) {
    this.#exports = instance.exports as Argon2Exports;
    this.#exports._initialize();
  }

  static initialize = async (
    create: (
      imports: WebAssembly.Imports
    ) => WebAssembly.Instance | PromiseLike<WebAssembly.Instance>
  ): Promise<Argon2> => {
    const imports = { emscripten_notify_memory_growth: noop };
    const $imports = { env: imports, wasi_snapshot_preview1: imports };
    return new Argon2(await create($imports));
  };

  static initializeModule = async (module: WebAssembly.Module): Promise<Argon2> =>
    this.initialize((imports) => new WebAssembly.Instance(module, imports));

  // see https://github.com/WebAssembly/design/issues/1296
  #heap = () => new Uint8Array(this.#exports.memory.buffer);

  #toCString = (value: string): Uint8Array => this.#encoder.encode(value + "\0");

  #fromCString = (ptr: Ptr, length?: number): string => {
    const heap = this.#heap();
    if (length) return this.#decoder.decode(heap.subarray(ptr, ptr + length));

    let end = ptr;
    while (heap[end]) ++end;
    return this.#decoder.decode(heap.subarray(ptr, end));
  };

  #malloc = (length: number): DisposablePtr => {
    const ptr = this.#exports.malloc(length);
    return {
      ptr,
      [Symbol.dispose]: () => this.#exports.free(ptr)
    };
  };

  #copyToHeap = (array: Uint8Array): DisposablePtr => {
    const ptr = this.#malloc(array.length);
    this.#heap().set(array, ptr.ptr);
    return ptr;
  };

  #copyFromHeap = (ptr: Ptr, length: number): Uint8Array =>
    this.#heap().slice(ptr, ptr + length);

  #copyStringToHeap = (value: string): DisposablePtr =>
    this.#copyToHeap(this.#toCString(value));

  #errorMessage = (error: number): string =>
    this.#fromCString(this.#exports.argon2_error_message(error));

  tryHash = (
    password: string,
    options?: Partial<Argon2HashOptions>
  ): Argon2TryHashResult => {
    const opts = {
      ...defaultHashOptions,
      ...options
    };

    const error = validateHashOptions(opts);
    if (error) return { success: false, error };

    const salt = opts.salt ?? generateSalt(16);

    const encodedLength = this.#exports.argon2_encodedlen(
      opts.timeCost,
      opts.memoryCost,
      opts.parallelism,
      salt.length,
      opts.hashLength,
      opts.type
    );

    using passwordPtr = this.#copyStringToHeap(password);
    using saltPtr = this.#copyToHeap(salt);

    using hashPtr = this.#malloc(opts.hashLength + 1);
    using encodedPtr = this.#malloc(encodedLength);

    const result = this.#exports.argon2_hash(
      opts.timeCost,
      opts.memoryCost,
      opts.parallelism,
      passwordPtr.ptr,
      password.length,
      saltPtr.ptr,
      salt.length,
      hashPtr.ptr,
      opts.hashLength,
      encodedPtr.ptr,
      encodedLength,
      opts.type,
      opts.version
    );

    if (result !== 0) return { success: false, error: this.#errorMessage(result) };

    const hash = this.#copyFromHeap(hashPtr.ptr, opts.hashLength);
    const encoded = this.#fromCString(encodedPtr.ptr, encodedLength - 1);

    return { success: true, data: { encoded, hash } };
  };

  hash = (password: string, options?: Partial<Argon2HashOptions>): Argon2HashData => {
    const result = this.tryHash(password, options);
    if (result.success) return result.data;
    throw Error(result.error);
  };

  tryVerify = (
    encoded: string,
    password: string,
    type?: Argon2Type
  ): Argon2TryVerifyResult => {
    const $type = type ?? typeFromEncoded(encoded);

    if ($type === undefined || !($type in Argon2Type))
      return { success: false, error: "Invalid type" };

    using encodedPtr = this.#copyStringToHeap(encoded);
    using passwordPtr = this.#copyStringToHeap(password);

    const result = this.#exports.argon2_verify(
      encodedPtr.ptr,
      passwordPtr.ptr,
      password.length,
      $type
    );

    if (result !== 0) return { success: false, error: this.#errorMessage(result) };

    return { success: true };
  };

  verify = (encoded: string, password: string, type?: Argon2Type): void => {
    const result = this.tryVerify(encoded, password, type);
    if (!result.success) throw Error(result.error);
  };
}

export default Argon2;
