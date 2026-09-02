#!/usr/bin/env sh
set -eu

VERSION=6.0.9@sha256:96617f27fe16421588241def73908fd348a7f9d260440ed0d00b36dcf7a063cc

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
