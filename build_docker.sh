#!/usr/bin/env sh
set -eu

VERSION=5.0.4@sha256:ef91f658e0104636cf40a702c99169273969cf04d939f4f08e5d0223965d5788

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
