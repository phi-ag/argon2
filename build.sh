#!/usr/bin/env sh
set -eux

(
  cd phc-winner-argon2

  emcc -std=c89 -Wall -Wextra -Werror -Wno-type-limits \
    -O3 -msimd128 -msse4.2 -mavx -flto \
    -Iinclude -Isrc \
    --cache .cache \
    -DARGON2_NO_THREADS \
    -s NO_ASSERTIONS \
    -s WASM_BIGINT \
    -s NO_FILESYSTEM \
    -s MODULARIZE \
    -s EXPORT_ES6 \
    -s EXPORT_NAME=Argon2ModuleFactory \
    -s EXPORTED_FUNCTIONS="_malloc","_free","_argon2_hash","_argon2_verify","_argon2_error_message","_argon2_encodedlen" \
    -s EXPORTED_RUNTIME_METHODS="UTF8ToString" \
    -s MALLOC=emmalloc \
    -s INITIAL_HEAP=67108864 \
    -s ALLOW_MEMORY_GROWTH \
    -s ENVIRONMENT="web" \
    -s NO_USE_ES6_IMPORT_META \
    src/argon2.c src/core.c src/blake2/blake2b.c src/encoding.c src/opt.c \
    -o argon2.js

  shasum argon2.wasm
  shasum argon2.js

  cp -f argon2.wasm argon2.js ../src
  ls -l ../src
)
