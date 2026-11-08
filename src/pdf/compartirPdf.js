import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { ErrorApp } from "../firebase/errores";

// Guarda el PDF en la cache del celular y abre el menu para verlo, imprimirlo o compartirlo
export async function compartirPdf(base64, nombre = "rotulos.pdf") {
  const archivo = new File(Paths.cache, nombre);
  archivo.create({ overwrite: true });
  await archivo.write(base64, { encoding: "base64" });

  if (!(await Sharing.isAvailableAsync())) {
    throw new ErrorApp("Este dispositivo no puede abrir archivos", "sin-visor");
  }
  await Sharing.shareAsync(archivo.uri, {
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
    dialogTitle: "Abrir o imprimir rótulos",
  });
}
