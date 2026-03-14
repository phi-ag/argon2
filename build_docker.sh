#!/usr/bin/env sh
set -eu

VERSION=5.0.3@sha256:7b5d14203bb4ef20da6f5b71b90c8f37ec09c2776d342efff3bc989ebf1aa873

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
