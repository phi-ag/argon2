// @ts-ignore
import init from "./phc-winner-argon2/argon2.js";

/**
 * Argon2 primitive type
 *
 * see https://github.com/P-H-C/phc-winner-argon2/blob/master/include/argon2.h#L220
 */
export enum Argon2Type {
  Argon2d = 0,
  Argon2i = 1,
  Argon2id = 2
}

/**
 * Argon2 version
 *
 * see https://github.com/P-H-C/phc-winner-argon2/blob/master/include/argon2.h#L227
 */
export enum Argon2Version {
  Version10 = 0x10,
  Version13 = 0x13
}

type Ptr = number;

type DisposablePtr = Disposable & { ptr: Ptr };

interface Argon2Module {
  HEAPU8: Uint8Array;
  _malloc(length: number): number;
  _free(ptr: Ptr): number;
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

export const encodeUtf8 = (value: string) => new TextEncoder().encode(value);

export const toHex = (array: Uint8Array) =>
  Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export const generateSalt = (length: number) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
};

export interface Argon2HashOptions {
  salt?: Uint8Array;
  hashLength: number;
  type: Argon2Type;
  timeCost: number;
  memoryCost: number;
  parallelism: number;
}

export interface Argon2HashResult {
  hash: Uint8Array;
  encoded: string;
}

export const defaultHashOptions: Partial<Argon2HashOptions> = {
  hashLength: 32,
  type: Argon2Type.Argon2id,
  timeCost: 3,
  memoryCost: 65536,
  parallelism: 4
};

class Argon2 {
  #module: Argon2Module;

  constructor(module: Argon2Module) {
    this.#module = module;
  }

  static initialize = async () => new Argon2(await init());

  #errorMessage = (error: number): string =>
    this.#module.UTF8ToString(this.#module._argon2_error_message(error));

  #malloc = (length: number): DisposablePtr => {
    const ptr = this.#module._malloc(length);

    return {
      ptr,
      [Symbol.dispose]: () => {
        this.#module._free(ptr);
      }
    };
  };

  #copyToHeap = (array: Uint8Array): DisposablePtr => {
    const ptr = this.#malloc(array.length);
    this.#module.HEAPU8.set(array, ptr.ptr);
    return ptr;
  };

  #copyFromHeap = (ptr: Ptr, length: number): Uint8Array =>
    this.#module.HEAPU8.slice(ptr, ptr + length);

  hash = (password: string, options: Partial<Argon2HashOptions>): Argon2HashResult => {
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

    using passwordPtr = this.#copyToHeap(encodeUtf8(password));
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
      Argon2Version.Version13
    );

    if (result !== 0) {
      throw Error(this.#errorMessage(result));
    }

    const hash = this.#copyFromHeap(hashPtr.ptr, opts.hashLength);
    const encoded = this.#module.UTF8ToString(encodedPtr.ptr);

    return { hash, encoded };
  };
}

export default Argon2;
