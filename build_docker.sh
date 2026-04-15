#!/usr/bin/env sh
set -eu

VERSION=5.0.6@sha256:e1b3e665245524ac6b62b180f9ccf9bd22308e6bb034f5fd9090df54fdbdfba6

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
