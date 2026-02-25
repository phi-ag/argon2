#!/usr/bin/env sh
set -eu

VERSION=5.0.2@sha256:5c44c83e0c8851219f2aee6336fc341202405413cff7deab2dccae645c417481

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
