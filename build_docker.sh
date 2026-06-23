#!/usr/bin/env sh
set -eu

VERSION=6.0.1@sha256:d0be652409a4d3362b8a36c3279dd1123ff1c9327e603d86d9361aa84f1d2e4c

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
