#!/usr/bin/env sh
set -eu

VERSION=6.0.7@sha256:71190e58eab340c692c0c3bb9741705f5c9625766a561c906dc6c01b1ed6d761

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
