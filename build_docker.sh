#!/usr/bin/env sh
set -eu

VERSION=4.0.18@sha256:bbe90e2b00acbd1a9596087d88305029f383de1eb71c0cdb20f4e19647265450

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
