#!/usr/bin/env sh
set -eu

VERSION=4.0.19@sha256:d04ab749bef080e69c2d92839f17bab5324d1ac89197faa1ced55fa245ee6118

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
