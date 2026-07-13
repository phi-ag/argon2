#!/usr/bin/env sh
set -eu

VERSION=6.0.3@sha256:bb0910e6a18bb9bd7cb31ae4ed40f9073148b78cb2cdb8ea8676454e0d85425c

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
