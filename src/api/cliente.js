// La app usa la misma API que la web de Rotula (Next.js en Vercel).
// La sesion viaja en la cookie "sesion": React Native la guarda al hacer login
// y la reenvia sola en cada peticion, igual que el navegador.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://rotula.vercel.app";

export class ErrorApi extends Error {
  constructor(mensaje, estado) {
    super(mensaje);
    this.estado = estado;
  }
}

export async function pedir(ruta, { metodo = "GET", cuerpo } = {}) {
  let respuesta;
  try {
    respuesta = await fetch(API_URL + ruta, {
      method: metodo,
      credentials: "include",
      headers: cuerpo ? { "Content-Type": "application/json" } : undefined,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    throw new ErrorApi("No hay conexión con el servidor. Revisa tu internet.", 0);
  }

  const datos = await respuesta.json().catch(() => null);

  // /api/login responde 200 con ok:false cuando el correo no existe
  if (!respuesta.ok || datos?.ok === false) {
    throw new ErrorApi(datos?.error ?? "Ocurrió un error, intenta de nuevo.", respuesta.status);
  }
  return datos;
}
