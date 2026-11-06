const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const resolverBase = config.resolver.resolveRequest;

// Firebase y pdf-lib importan tslib. Su version ESM rompe en Metro al cargar la app
// ("Cannot destructure property '__extends' of 'tslib.default'"), asi que se usa la UMD.
config.resolver.resolveRequest = (contexto, modulo, plataforma) => {
  if (modulo === "tslib") {
    return { type: "sourceFile", filePath: path.join(__dirname, "node_modules/tslib/tslib.js") };
  }
  return (resolverBase ?? contexto.resolveRequest)(contexto, modulo, plataforma);
};

module.exports = config;
