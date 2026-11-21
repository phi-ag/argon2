#!/usr/bin/env sh
set -eu

VERSION=7.0.1@sha256:73aece2e0ab748487945ad117b79fc4d277e9f656e54fc800a9b1a0a6562715b

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
