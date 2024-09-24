/// <reference types="emscripten" preserve="true" />
import factory from "./argon2.js";

// @ts-expect-error Polyfill `Symbol.dispose`
// see https://github.com/evanw/esbuild/issues/3920#issuecomment-2367183692
Symbol.dispose ??= Symbol("Symbol.dispose");

/**
 * Argon2 primitive type
 *
 * see https://github.com/P-H-C/phc-winner-argon2/blob/master/include/argon2.h#L220
 */
export const enum Argon2Type {
  Argon2d = 0,
  Argon2i = 1,
  Argon2id = 2
}

/**
 * Argon2 version
 *
 * see https://github.com/P-H-C/phc-winner-argon2/blob/master/include/argon2.h#L227
 */
export const enum Argon2Version {
  Version10 = 0x10,
  Version13 = 0x13
}

type Ptr = number;

type DisposablePtr = Disposable & { ptr: Ptr };

export interface Argon2Module extends EmscriptenModule {
  _malloc(length: number): number;
  _free(ptr: Ptr): void;
  UTF8ToString(ptr: Ptr, maxBytesToRead?: number | undefined): string;
  _argon2_hash(
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
  _argon2_verify(
    encoded: Ptr,
    password: Ptr,
    passwordLength: number,
    type: Argon2Type
  ): number;
  _argon2_error_message(error: Ptr): number;
  _argon2_encodedlen(
    timeCost: number,
    memoryCost: number,
    parallelism: number,
    saltLength: number,
    hashLength: number,
    type: Argon2Type
  ): number;
}

export const toUtf8Array = (value: string): Uint8Array => new TextEncoder().encode(value);

export const toCString = (value: string): Uint8Array => toUtf8Array(value + "\0");

export const toHex = (array: Uint8Array): string =>
  Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export const generateSalt = (length: number): Uint8Array => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
};

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
  hash: Uint8Array;
  encoded: string;
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

export const defaultHashOptions: Partial<Argon2HashOptions> = {
  hashLength: 32,
  timeCost: 3,
  memoryCost: 65536,
  parallelism: 4,
  type: Argon2Type.Argon2id,
  version: Argon2Version.Version13
};

class Argon2 {
  #module: Argon2Module;

  constructor(module: Argon2Module) {
    this.#module = module;
  }

  static initialize = async (overrides?: Partial<Argon2Module>): Promise<Argon2> =>
    new Argon2(await factory(overrides));

  static initializeModule = async (
    module: WebAssembly.Module,
    overrides?: Partial<Argon2Module>
  ): Promise<Argon2> =>
    this.initialize({
      instantiateWasm: (imports, cb) => {
        const instance = new WebAssembly.Instance(module, imports);
        cb(instance);
        return instance.exports;
      },
      ...overrides
    });

  static initializeBuffer = async (
    buffer: BufferSource,
    overrides?: Partial<Argon2Module>
  ): Promise<Argon2> =>
    this.initialize({
      instantiateWasm: (imports, cb) => {
        WebAssembly.instantiate(buffer, imports).then((module) => cb(module.instance));
        return {};
      },
      ...overrides
    });

  static initializeStreaming = async (
    response: Response | PromiseLike<Response>,
    overrides?: Partial<Argon2Module>
  ): Promise<Argon2> =>
    this.initialize({
      instantiateWasm: (imports, cb) => {
        WebAssembly.instantiateStreaming(response, imports).then((module) =>
          cb(module.instance)
        );
        return {};
      },
      ...overrides
    });

  #errorMessage = (error: number): string =>
    this.#module.UTF8ToString(this.#module._argon2_error_message(error));

  #malloc = (length: number): DisposablePtr => {
    const ptr = this.#module._malloc(length);
    return {
      ptr,
      [Symbol.dispose]: () => this.#module._free(ptr)
    };
  };

  #copyToHeap = (array: Uint8Array): DisposablePtr => {
    const ptr = this.#malloc(array.length);
    this.#module.HEAPU8.set(array, ptr.ptr);
    return ptr;
  };

  #copyFromHeap = (ptr: Ptr, length: number): Uint8Array =>
    this.#module.HEAPU8.slice(ptr, ptr + length);

  tryHash = (
    password: string,
    options?: Partial<Argon2HashOptions>
  ): Argon2TryHashResult => {
    const opts = {
      ...defaultHashOptions,
      ...options
    } as Argon2HashOptions;

    const salt = opts.salt ?? generateSalt(16);

    const encodedLength = this.#module._argon2_encodedlen(
      opts.timeCost,
      opts.memoryCost,
      opts.parallelism,
      salt.length,
      opts.hashLength,
      opts.type
    );

    using passwordPtr = this.#copyToHeap(toCString(password));
    using saltPtr = this.#copyToHeap(salt);

    using hashPtr = this.#malloc(opts.hashLength + 1);
    using encodedPtr = this.#malloc(encodedLength + 1);

    const result = this.#module._argon2_hash(
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

    if (result !== 0) {
      return { success: false, error: this.#errorMessage(result) };
    }

    const hash = this.#copyFromHeap(hashPtr.ptr, opts.hashLength);
    const encoded = this.#module.UTF8ToString(encodedPtr.ptr);

    return { success: true, data: { hash, encoded } };
  };

  hash = (password: string, options?: Partial<Argon2HashOptions>): Argon2HashData => {
    const result = this.tryHash(password, options);
    if (result.success) return result.data;
    throw Error(result.error);
  };

  tryVerify = (
    encoded: string,
    password: string,
    type: Argon2Type = Argon2Type.Argon2id
  ): Argon2TryVerifyResult => {
    using encodedPtr = this.#copyToHeap(toCString(encoded));
    using passwordPtr = this.#copyToHeap(toCString(password));

    const result = this.#module._argon2_verify(
      encodedPtr.ptr,
      passwordPtr.ptr,
      password.length,
      type
    );

    if (result !== 0) {
      return { success: false, error: this.#errorMessage(result) };
    }

    return { success: true };
  };

  verify = (
    encoded: string,
    password: string,
    type: Argon2Type = Argon2Type.Argon2id
  ): void => {
    const result = this.tryVerify(encoded, password, type);
    if (!result.success) throw Error(result.error);
  };
}

export default Argon2;
