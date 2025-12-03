#!/usr/bin/env sh
set -eu

VERSION=4.0.21@sha256:631841e7ee7a808bc2735a4f26aff3c1354119764df8459c38abfe2d0923dffb

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
