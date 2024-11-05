#!/usr/bin/env sh
set -eu

(
  cd phc-winner-argon2

  emcc -v

  # - Optimizations see https://emscripten.org/docs/optimizing/Optimizing-Code.html
  # - SIMD see https://emscripten.org/docs/porting/simd.html
  # - Compiler settings see https://emscripten.org/docs/tools_reference/settings_reference.html
  # - Clang CLI flags see https://clang.llvm.org/docs/ClangCommandLineReference.html#webassembly
  emcc -std=c89 -Wall -Wextra -Werror -Wno-type-limits -Wno-error=incompatible-pointer-types \
    -O3 -flto -msimd128 -mavx2 \
    --no-entry \
    -sSTRICT \
    -sWASM_BIGINT \
    -sNO_ASSERTIONS \
    -sNO_FILESYSTEM \
    -sMALLOC=emmalloc \
    -sALLOW_MEMORY_GROWTH \
    -sEXPORTED_FUNCTIONS=_malloc,_free,_argon2_hash,_argon2_verify,_argon2_error_message,_argon2_encodedlen \
    -DARGON2_NO_THREADS \
    -D__AVX2__ \
    --cache=../.emscripten \
    -Iinclude \
    -o ../src/argon2.wasm \
    src/argon2.c src/core.c src/blake2/blake2b.c src/encoding.c src/opt.c

  sha1sum ../src/argon2.wasm
  sha256sum ../src/argon2.wasm
  stat -c "%n %s" ../src/argon2.wasm
)
