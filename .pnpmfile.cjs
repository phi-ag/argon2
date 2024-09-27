// eslint-disable-next-line no-undef
module.exports = {
  hooks: {
    readPackage: (pkg) => {
      if (pkg.name === "@cyclonedx/cyclonedx-library") delete pkg.optionalDependencies;
      return pkg;
    }
  }
};
