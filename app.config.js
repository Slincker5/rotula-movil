const fs = require("fs");
const path = require("path");

// google-services.json solo hace falta para el development build (entrar con Google).
// Si no esta, Expo Go sigue funcionando sin avisos.
const archivoGoogle = "./google-services.json";

module.exports = ({ config }) => {
  if (!fs.existsSync(path.join(__dirname, archivoGoogle))) return config;
  return { ...config, android: { ...config.android, googleServicesFile: archivoGoogle } };
};
