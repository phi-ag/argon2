#!/usr/bin/env sh
set -eu

VERSION=5.0.5@sha256:cc4dcb4ca57cb35858b7fbb606c0ee857051d9f76b452f7fcfc3d8159dae670c

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
