// Convierte los codigos de Firebase en mensajes que el usuario entiende

export class ErrorApp extends Error {
  constructor(mensaje, codigo) {
    super(mensaje);
    this.codigo = codigo;
  }
}

const CREDENCIALES = "El correo o la contraseña no son correctos.";
const SIN_CONEXION = "No hay conexión con el servidor. Revisa tu internet.";

const mensajes = {
  "auth/invalid-credential": CREDENCIALES,
  "auth/wrong-password": CREDENCIALES,
  "auth/user-not-found": CREDENCIALES,
  "auth/invalid-email": "Ese correo no es válido.",
  "auth/email-already-in-use": "Ese correo ya tiene una cuenta. Inicia sesión.",
  "auth/weak-password": "Esa contraseña es muy débil.",
  "auth/too-many-requests": "Demasiados intentos. Espera unos minutos y vuelve a probar.",
  "auth/user-disabled": "Esta cuenta está deshabilitada.",
  "auth/account-exists-with-different-credential": "Ese correo ya entra con otro método. Inicia sesión con tu contraseña.",
  "auth/network-request-failed": SIN_CONEXION,
  unavailable: SIN_CONEXION,
  "permission-denied": "No tienes permiso para hacer esto. Inicia sesión de nuevo.",
  unauthenticated: "Tu sesión terminó. Inicia sesión de nuevo.",
  "resource-exhausted": "Se alcanzó el límite del plan de Firebase. Intenta más tarde.",
};

export function traducirError(error) {
  if (error instanceof ErrorApp) return error;
  // Firestore a veces antepone "firestore/" al codigo
  const codigo = String(error?.code ?? "").replace(/^firestore\//, "");
  return new ErrorApp(mensajes[codigo] ?? "Ocurrió un error, intenta de nuevo.", codigo);
}

// Ejecuta una operacion y deja que las pantallas muestren siempre un mensaje en espanol
export async function conErrores(operacion) {
  try {
    return await operacion();
  } catch (error) {
    console.warn("[firebase]", error?.code ?? error);
    throw traducirError(error);
  }
}
