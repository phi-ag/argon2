#!/usr/bin/env sh
set -eu

VERSION=3.1.74@sha256:af45409f3199d88db4b1b03af0098532c8fb33a375ac257463eeb0a622870d06

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
