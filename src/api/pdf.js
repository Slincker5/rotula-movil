import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { API_URL, ErrorApi } from "./cliente";

const aBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const lector = new FileReader();
    // el resultado viene como "data:application/pdf;base64,AAAA...", solo sirve lo de despues de la coma
    lector.onload = () => resolve(String(lector.result).split(",")[1]);
    lector.onerror = () => reject(new ErrorApi("No se pudo leer el PDF", 0));
    lector.readAsDataURL(blob);
  });

// El PDF lo genera la API en /api/documentos/[uuid]/pdf y pide la cookie de sesion,
// por eso se descarga con fetch (que si lleva la cookie) y no abriendo el link en el navegador.
export async function abrirPdf(ruta, nombre = "rotulos.pdf") {
  const respuesta = await fetch(API_URL + ruta, { credentials: "include" });
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => null);
    throw new ErrorApi(datos?.error ?? "No se pudo descargar el PDF", respuesta.status);
  }

  const base64 = await aBase64(await respuesta.blob());
  const archivo = new File(Paths.cache, nombre);
  archivo.create({ overwrite: true });
  await archivo.write(base64, { encoding: "base64" });

  if (!(await Sharing.isAvailableAsync())) {
    throw new ErrorApi("Este dispositivo no puede abrir archivos", 0);
  }
  await Sharing.shareAsync(archivo.uri, {
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
    dialogTitle: "Abrir o imprimir rótulos",
  });
}
