#!/usr/bin/env sh
set -eu

VERSION=4.0.5@sha256:5aea37132ad0827908065a5d7432d2f4048011dce7169aa1ab3441b0720312e2

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
