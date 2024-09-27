// @ts-expect-error Polyfill `Symbol.dispose`
// see https://github.com/evanw/esbuild/issues/3920#issuecomment-2367183692
Symbol.dispose ??= Symbol("Symbol.dispose");

export enum Argon2Type {
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
  if (encoded.startsWith("$argon2i$")) return Argon2Type.Argon2i;
  if (encoded.startsWith("$argon2id$")) return Argon2Type.Argon2id;
};

export const typeToString = (type: Argon2Type): string => {
  switch (type) {
    case Argon2Type.Argon2i:
      return "argon2i";
    case Argon2Type.Argon2id:
      return "argon2id";
  }
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
  _crypto_pwhash_argon2_pick_best_implementation: () => void;
  _crypto_generichash_blake2b_pick_best_implementation: () => void;
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

const errorCode = {
  ARGON2_OK: 0,
  ARGON2_OUTPUT_PTR_NULL: -1,

  ARGON2_OUTPUT_TOO_SHORT: -2,
  ARGON2_OUTPUT_TOO_LONG: -3,

  ARGON2_PWD_TOO_SHORT: -4,
  ARGON2_PWD_TOO_LONG: -5,

  ARGON2_SALT_TOO_SHORT: -6,
  ARGON2_SALT_TOO_LONG: -7,

  ARGON2_AD_TOO_SHORT: -8,
  ARGON2_AD_TOO_LONG: -9,

  ARGON2_SECRET_TOO_SHORT: -10,
  ARGON2_SECRET_TOO_LONG: -11,

  ARGON2_TIME_TOO_SMALL: -12,
  ARGON2_TIME_TOO_LARGE: -13,

  ARGON2_MEMORY_TOO_LITTLE: -14,
  ARGON2_MEMORY_TOO_MUCH: -15,

  ARGON2_LANES_TOO_FEW: -16,
  ARGON2_LANES_TOO_MANY: -17,

  ARGON2_PWD_PTR_MISMATCH: -18 /* NULL ptr with non-zero length */,
  ARGON2_SALT_PTR_MISMATCH: -19 /* NULL ptr with non-zero length */,
  ARGON2_SECRET_PTR_MISMATCH: -20 /* NULL ptr with non-zero length */,
  ARGON2_AD_PTR_MISMATCH: -21 /* NULL ptr with non-zero length */,

  ARGON2_MEMORY_ALLOCATION_ERROR: -22,

  ARGON2_FREE_MEMORY_CBK_NULL: -23,
  ARGON2_ALLOCATE_MEMORY_CBK_NULL: -24,

  ARGON2_INCORRECT_PARAMETER: -25,
  ARGON2_INCORRECT_TYPE: -26,

  ARGON2_OUT_PTR_MISMATCH: -27,

  ARGON2_THREADS_TOO_FEW: -28,
  ARGON2_THREADS_TOO_MANY: -29,

  ARGON2_MISSING_ARGS: -30,

  ARGON2_ENCODING_FAIL: -31,

  ARGON2_DECODING_FAIL: -32,

  ARGON2_THREAD_FAIL: -33,

  ARGON2_DECODING_LENGTH_FAIL: -34,

  ARGON2_VERIFY_MISMATCH: -35
};

const errorMessage = (error: number) => {
  switch (error) {
    case errorCode.ARGON2_OK:
      return "OK";
    case errorCode.ARGON2_OUTPUT_PTR_NULL:
      return "Output pointer is NULL";
    case errorCode.ARGON2_OUTPUT_TOO_SHORT:
      return "Output is too short";
    case errorCode.ARGON2_OUTPUT_TOO_LONG:
      return "Output is too long";
    case errorCode.ARGON2_PWD_TOO_SHORT:
      return "Password is too short";
    case errorCode.ARGON2_PWD_TOO_LONG:
      return "Password is too long";
    case errorCode.ARGON2_SALT_TOO_SHORT:
      return "Salt is too short";
    case errorCode.ARGON2_SALT_TOO_LONG:
      return "Salt is too long";
    case errorCode.ARGON2_AD_TOO_SHORT:
      return "Associated data is too short";
    case errorCode.ARGON2_AD_TOO_LONG:
      return "Associated data is too long";
    case errorCode.ARGON2_SECRET_TOO_SHORT:
      return "Secret is too short";
    case errorCode.ARGON2_SECRET_TOO_LONG:
      return "Secret is too long";
    case errorCode.ARGON2_TIME_TOO_SMALL:
      return "Time cost is too small";
    case errorCode.ARGON2_TIME_TOO_LARGE:
      return "Time cost is too large";
    case errorCode.ARGON2_MEMORY_TOO_LITTLE:
      return "Memory cost is too small";
    case errorCode.ARGON2_MEMORY_TOO_MUCH:
      return "Memory cost is too large";
    case errorCode.ARGON2_LANES_TOO_FEW:
      return "Too few lanes";
    case errorCode.ARGON2_LANES_TOO_MANY:
      return "Too many lanes";
    case errorCode.ARGON2_PWD_PTR_MISMATCH:
      return "Password pointer is NULL, but password length is not 0";
    case errorCode.ARGON2_SALT_PTR_MISMATCH:
      return "Salt pointer is NULL, but salt length is not 0";
    case errorCode.ARGON2_SECRET_PTR_MISMATCH:
      return "Secret pointer is NULL, but secret length is not 0";
    case errorCode.ARGON2_AD_PTR_MISMATCH:
      return "Associated data pointer is NULL, but ad length is not 0";
    case errorCode.ARGON2_MEMORY_ALLOCATION_ERROR:
      return "Memory allocation error";
    case errorCode.ARGON2_FREE_MEMORY_CBK_NULL:
      return "The free memory callback is NULL";
    case errorCode.ARGON2_ALLOCATE_MEMORY_CBK_NULL:
      return "The allocate memory callback is NULL";
    case errorCode.ARGON2_INCORRECT_PARAMETER:
      return "Argon2_Context context is NULL";
    case errorCode.ARGON2_INCORRECT_TYPE:
      return "There is no such version of Argon2";
    case errorCode.ARGON2_OUT_PTR_MISMATCH:
      return "Output pointer mismatch";
    case errorCode.ARGON2_THREADS_TOO_FEW:
      return "Not enough threads";
    case errorCode.ARGON2_THREADS_TOO_MANY:
      return "Too many threads";
    case errorCode.ARGON2_MISSING_ARGS:
      return "Missing arguments";
    case errorCode.ARGON2_ENCODING_FAIL:
      return "Encoding failed";
    case errorCode.ARGON2_DECODING_FAIL:
      return "Decoding failed";
    case errorCode.ARGON2_THREAD_FAIL:
      return "Threading failure";
    case errorCode.ARGON2_DECODING_LENGTH_FAIL:
      return "Some of encoded parameters are too long or too short";
    case errorCode.ARGON2_VERIFY_MISMATCH:
      return "The password does not match the supplied hash";
    default:
      return "Unknown error code";
  }
};

const base64Length = (len: number) => {
  return Math.trunc((len * 4 + 3 - 1) / 3);
  const olen = Math.trunc(len / 3) << 2;
  //const olen = Math.trunc(len / 3) * 4;

  const mod3 = len % 3;
  if (mod3 === 1) return olen + 2;
  if (mod3 === 2) return olen + 3;

  return olen;
};

class Argon2 {
  readonly #exports: Argon2Exports;
  readonly #encoder = new TextEncoder();
  readonly #decoder = new TextDecoder("utf8");

  constructor(instance: WebAssembly.Instance) {
    this.#exports = instance.exports as Argon2Exports;
    this.#exports._initialize();
    this.#exports._crypto_pwhash_argon2_pick_best_implementation();
    this.#exports._crypto_generichash_blake2b_pick_best_implementation();
  }

  static initialize = async (
    create: (
      imports: WebAssembly.Imports
    ) => WebAssembly.Instance | PromiseLike<WebAssembly.Instance>
  ): Promise<Argon2> => {
    const imports = {
      emscripten_notify_memory_growth: noop,
      emscripten_asm_const_int: noop,
      fd_close: noop,
      fd_write: noop,
      fd_seek: noop
    };
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

  /*
  #errorMessage = (error: number): string =>
    this.#fromCString(this.#exports.argon2_error_message(error));
    */

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

    /*
    const b64len = (len: number) => {
      let olen = Math.floor(len / 3) << 2;

      switch (len % 3) {
        case 2:
          olen++;
        // fall through
        case 1:
          olen += 2;
          break;
      }

      return olen;
    };
*/

    const encodedLength =
      "$$v=$m=,t=,p=$$".length +
      typeToString(opts.type).length +
      String(opts.timeCost).length +
      String(opts.memoryCost).length +
      String(opts.parallelism).length +
      base64Length(salt.length) +
      base64Length(opts.hashLength) +
      String(opts.version).length +
      1;

    /*
    const encodedLength = this.#exports.argon2_encodedlen(
      opts.timeCost,
      opts.memoryCost,
      opts.parallelism,
      salt.length,
      opts.hashLength,
      opts.type
    );
    */

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

    if (result !== 0) return { success: false, error: errorMessage(result) };

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

    if (result !== 0) return { success: false, error: errorMessage(result) };

    return { success: true };
  };

  verify = (encoded: string, password: string, type?: Argon2Type): void => {
    const result = this.tryVerify(encoded, password, type);
    if (!result.success) throw Error(result.error);
  };
}

export default Argon2;
