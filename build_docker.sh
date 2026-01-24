#!/usr/bin/env sh
set -eu

VERSION=5.0.0@sha256:67df07bc59f86685818fa801d340b54e576fe4276cfd3bcfc4da61d564217737

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
