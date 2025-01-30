#!/usr/bin/env sh
set -eu

VERSION=4.0.2@sha256:8de4dcc50c6591b217222344c1c76113baa2a3f3a5148e8d98d719b2393599ab

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
