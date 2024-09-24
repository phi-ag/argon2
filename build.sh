#!/usr/bin/env sh
set -eu

(
  cd phc-winner-argon2

  emcc -v

  # - Optimizations see https://emscripten.org/docs/optimizing/Optimizing-Code.html
  # - SIMD see https://emscripten.org/docs/porting/simd.html
  # - Compiler settings see https://emscripten.org/docs/tools_reference/settings_reference.html
  emcc -std=c89 -Wall -Wextra -Werror -Wno-type-limits \
    -O3 -flto -msimd128 -msse4.2 -mavx \
    -sSTRICT \
    -sNO_ASSERTIONS \
    -sWASM_BIGINT \
    -sNO_FILESYSTEM \
    -sMODULARIZE \
    -sEXPORT_ES6 \
    -sNO_USE_ES6_IMPORT_META \
    -sEXPORT_NAME=Argon2ModuleFactory \
    -sEXPORTED_FUNCTIONS=_malloc,_free,_argon2_hash,_argon2_verify,_argon2_error_message,_argon2_encodedlen \
    -sEXPORTED_RUNTIME_METHODS=UTF8ToString,HEAPU8 \
    -sINCOMING_MODULE_JS_API=instantiateWasm \
    -sMALLOC=emmalloc \
    -sINITIAL_HEAP=67174400 \
    -sALLOW_MEMORY_GROWTH \
    -sENVIRONMENT="web" \
    -DARGON2_NO_THREADS \
    --cache=../.emscripten \
    -Iinclude \
    -o ../src/argon2.js \
    src/argon2.c src/core.c src/blake2/blake2b.c src/encoding.c src/opt.c

  shasum ../src/argon2.wasm
  shasum ../src/argon2.js

  stat -c "%n %s" ../src/argon2.wasm
  stat -c "%n %s" ../src/argon2.js
)
