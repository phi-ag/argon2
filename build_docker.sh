#!/usr/bin/env sh
set -eu

VERSION=3.1.71@sha256:9922c93314b63a1d9ceba2e76f03737f1f9cc4b7350341211e2d3555633ffdd5

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
