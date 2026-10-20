#!/usr/bin/env sh
set -eu

VERSION=6.0.13@sha256:fb7864e398acfda863dfcea78b8bc8adad359fa60c6a0bbeb845931de64aa68a

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
