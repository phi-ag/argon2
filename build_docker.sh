#!/usr/bin/env sh
set -eu

VERSION=4.0.16@sha256:69820cfa8dd489d1ddd13bb394b9b9a80b491fb6a3b44715622b5cba0e5f49fb

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
