#!/usr/bin/env sh
set -eu

VERSION=4.0.7@sha256:8acec700a48dbff5250afc1e3ee545b7c002b689043ee82c277de6481a237fd7

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
