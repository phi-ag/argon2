#!/usr/bin/env sh
set -eu

(
  cd phc-winner-argon2

  emcc -v

  # - Optimizations see https://emscripten.org/docs/optimizing/Optimizing-Code.html
  # - SIMD see https://emscripten.org/docs/porting/simd.html
  # - Compiler settings see https://emscripten.org/docs/tools_reference/settings_reference.html
  # - Clang CLI flags see https://clang.llvm.org/docs/ClangCommandLineReference.html#webassembly
  emcc -std=c89 -Wall -Wextra -Werror -Wno-type-limits \
    -O3 -flto -msimd128 -msse4.2 -mavx \
    --no-entry \
    -sSTRICT \
    -sWASM_BIGINT \
    -sNO_ASSERTIONS \
    -sNO_FILESYSTEM \
    -sMALLOC=emmalloc \
    -sALLOW_MEMORY_GROWTH \
    -sEXPORTED_FUNCTIONS=_malloc,_free,_argon2_hash,_argon2_verify,_argon2_error_message,_argon2_encodedlen \
    -DARGON2_NO_THREADS \
    --cache=../.emscripten \
    -Iinclude \
    -o ../src/argon2.wasm \
    src/argon2.c src/core.c src/blake2/blake2b.c src/encoding.c src/opt.c

  shasum ../src/argon2.wasm
  stat -c "%n %s" ../src/argon2.wasm
)
