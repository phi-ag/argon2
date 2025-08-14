#!/usr/bin/env sh
set -eu

VERSION=4.0.13@sha256:520088b81877b610389dfd4cf7fb8c69f3ae41a611b0f80e222f57dafd930973

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
