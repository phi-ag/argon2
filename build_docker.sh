#!/usr/bin/env sh
set -eu

VERSION=4.0.6@sha256:a73e14e25eac4d15d094a9688438ba0ea84e79867ab42365e14abec3a36635bf

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
