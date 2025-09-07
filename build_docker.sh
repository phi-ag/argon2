#!/usr/bin/env sh
set -eu

VERSION=4.0.14@sha256:11d144844086982d68260867ce1fc665667f4139b73326625033ed8d16533406

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
