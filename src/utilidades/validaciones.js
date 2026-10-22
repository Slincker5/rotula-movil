// Cada funcion devuelve un objeto { campo: "mensaje" } con los errores encontrados.
// Si el objeto esta vacio, el formulario es valido.
// Las reglas son las mismas que valida la API de Rotula, para avisar antes de enviar.

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const REGEX_PRECIO = /^\d+(\.\d{1,2})?$/;
const REGEX_DIGITOS = /^\d+$/;

export const hayErrores = (errores) => Object.keys(errores).length > 0;

function validarCorreo(correo) {
  const valor = correo.trim();
  if (!valor) return "Escribe tu correo";
  if (!REGEX_CORREO.test(valor)) return "Ese correo no es válido. Ejemplo: tu@negocio.com";
  if (valor.length > 120) return "El correo no puede pasar de 120 caracteres";
  return null;
}

function validarNombre(valor, campo) {
  const limpio = valor.trim();
  if (!limpio) return `Escribe tu ${campo}`;
  if (limpio.length < 2) return `Tu ${campo} debe tener al menos 2 letras`;
  if (limpio.length > 60) return `Tu ${campo} no puede pasar de 60 caracteres`;
  if (!REGEX_NOMBRE.test(limpio)) return `Tu ${campo} solo puede tener letras`;
  return null;
}

function agregar(errores, campo, mensaje) {
  if (mensaje) errores[campo] = mensaje;
}

export function validarLogin({ correo, clave }) {
  const errores = {};
  agregar(errores, "correo", validarCorreo(correo));
  if (!clave) errores.clave = "Escribe tu contraseña";
  return errores;
}

export function validarRegistro({ nombre, apellido, negocio, correo, clave, confirmar }) {
  const errores = {};
  agregar(errores, "nombre", validarNombre(nombre, "nombre"));
  agregar(errores, "apellido", validarNombre(apellido, "apellido"));
  if (negocio.trim().length > 100) errores.negocio = "El nombre del negocio no puede pasar de 100 caracteres";
  agregar(errores, "correo", validarCorreo(correo));

  if (!clave) errores.clave = "Escribe una contraseña";
  else if (clave.length < 8) errores.clave = "La contraseña debe tener al menos 8 caracteres";
  else if (!/\d/.test(clave) || !/[A-Za-z]/.test(clave))
    errores.clave = "Usa letras y al menos un número";

  if (!confirmar) errores.confirmar = "Repite tu contraseña";
  else if (confirmar !== clave) errores.confirmar = "Las contraseñas no coinciden";
  return errores;
}

export function validarRotulo({ ean, descripcion, precioOferta, precioNormal, copias, fechaInicio, fechaFin }) {
  const errores = {};

  if (!ean.trim()) errores.ean = "Escribe el código de barras";
  else if (!REGEX_DIGITOS.test(ean.trim())) errores.ean = "El código de barras solo lleva números";
  else if (ean.trim().length < 8 || ean.trim().length > 14) errores.ean = "Debe tener entre 8 y 14 dígitos";

  if (!descripcion.trim()) errores.descripcion = "Escribe la descripción del producto";
  else if (descripcion.trim().length < 3) errores.descripcion = "La descripción es muy corta";

  for (const [campo, valor, nombre] of [
    ["precioOferta", precioOferta, "de oferta"],
    ["precioNormal", precioNormal, "normal"],
  ]) {
    const limpio = valor.trim();
    if (!limpio) errores[campo] = `Escribe el precio ${nombre}`;
    else if (!REGEX_PRECIO.test(limpio)) errores[campo] = "Usa un precio válido. Ejemplo: 1.99";
    else if (Number(limpio) <= 0) errores[campo] = "El precio debe ser mayor a 0";
  }

  if (!copias.trim()) errores.copias = "Indica cuántas copias";
  else if (!REGEX_DIGITOS.test(copias.trim())) errores.copias = "Solo números enteros";
  else if (Number(copias) <= 0) errores.copias = "Debe ser al menos 1 copia";

  if (!fechaInicio) errores.fechaInicio = "Elige la fecha de inicio";
  if (!fechaFin) errores.fechaFin = "Elige la fecha fin";
  else if (fechaInicio && fechaFin < fechaInicio)
    errores.fechaFin = "No puede ser antes de la fecha de inicio";

  return errores;
}
