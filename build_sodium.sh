#!/usr/bin/env sh
set -eu

(
  cd libsodium

  emcc -v

  #-Iinclude \
  # - Optimizations see https://emscripten.org/docs/optimizing/Optimizing-Code.html
  # - SIMD see https://emscripten.org/docs/porting/simd.html
  # - Compiler settings see https://emscripten.org/docs/tools_reference/settings_reference.html
  # - Clang CLI flags see https://clang.llvm.org/docs/ClangCommandLineReference.html#webassembly
  emcc -std=gnu11 -Wall -Wextra -Wno-error -Wno-type-limits -Wno-unused-function \
    -O3 -flto -msimd128 -msse4.1 -mavx \
    --no-entry \
    -sSTRICT \
    -sWASM_BIGINT \
    -sNO_ASSERTIONS \
    -sNO_FILESYSTEM \
    -sMALLOC=emmalloc \
    -sALLOW_MEMORY_GROWTH \
    -sEXPORTED_FUNCTIONS=_malloc,_free,_argon2_hash,_argon2_verify,__crypto_pwhash_argon2_pick_best_implementation,__crypto_generichash_blake2b_pick_best_implementation \
    -DARGON2_NO_THREADS \
    -DNATIVE_LITTLE_ENDIAN \
    -DHAVE_EMMINTRIN_H \
    -DHAVE_TMMINTRIN_H \
    -DHAVE_SMMINTRIN_H \
    -DHAVE_PMMINTRIN_H \
    -DHAVE_AVXINTRIN_H \
    --cache=../.emscripten \
    -o ../src/argon2.wasm \
    -Isrc/libsodium/include/sodium \
    src/libsodium/sodium/runtime.c \
    src/libsodium/crypto_pwhash/argon2/pwhash_argon2id.c \
    src/libsodium/crypto_pwhash/argon2/argon2.c \
    src/libsodium/crypto_pwhash/argon2/argon2-core.c \
    src/libsodium/crypto_pwhash/argon2/argon2-fill-block-ref.c \
    src/libsodium/crypto_pwhash/argon2/argon2-fill-block-ssse3.c \
    src/libsodium/crypto_pwhash/argon2/argon2-fill-block-avx2.c \
    src/libsodium/crypto_pwhash/argon2/blake2b-long.c \
    src/libsodium/crypto_pwhash/argon2/argon2-encoding.c \
    src/libsodium/sodium/core.c \
    src/libsodium/sodium/utils.c \
    src/libsodium/sodium/codecs.c \
    src/libsodium/crypto_generichash/blake2b/ref/blake2b-ref.c \
    src/libsodium/crypto_generichash/blake2b/ref/generichash_blake2b.c \
    src/libsodium/crypto_generichash/blake2b/ref/blake2b-compress-ref.c \
    src/libsodium/crypto_generichash/blake2b/ref/blake2b-compress-sse41.c \
    src/libsodium/randombytes/randombytes.c

  #src/libsodium/crypto_pwhash/argon2/blamka-round-ssse3.h

  sha1sum ../src/argon2.wasm
  sha256sum ../src/argon2.wasm
  stat -c "%n %s" ../src/argon2.wasm
)
