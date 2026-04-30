#!/usr/bin/env sh
set -eu

VERSION=5.0.7@sha256:4e332f7343b6f66320bf72f7ecc01a3d9f3866721a13b0e5c7b96505d6ab148a

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
