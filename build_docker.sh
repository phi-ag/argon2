#!/usr/bin/env sh
set -eu

VERSION=4.0.3@sha256:8dd584d0b33bfae94f57cc000adf02d94621aaf94b848371d98a24b891b84ee5

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
