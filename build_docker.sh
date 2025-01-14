#!/usr/bin/env sh
set -eu

VERSION=4.0.0@sha256:5e41eb5a62fa6e62d3d68c98f670bc15226cb8b7a3606da09ee6f2d0a9dbd821

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
