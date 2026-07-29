#!/usr/bin/env sh
set -eu

VERSION=6.0.5@sha256:76a44fff907397784decc435115d07fcb9587a4f1504977f39f3745e538e3a1e

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
