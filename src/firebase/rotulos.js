import { addDoc, deleteDoc, doc, getDocs, query, serverTimestamp, where, writeBatch } from "firebase/firestore";
import { db } from "./config";
import { aRegistros, coleccionDelUsuario, masRecientes } from "./datos";
import { conErrores, ErrorApp } from "./errores";
import { generarRotulos } from "../pdf/generarRotulos";
import { compartirPdf } from "../pdf/compartirPdf";

const POR_HOJA = 4;

const porDescripcion = (a, b) => a.descripcion.localeCompare(b.descripcion);
const contarCopias = (rotulos) => rotulos.reduce((total, r) => total + Math.max(1, Number(r.copias) || 1), 0);

export const listarRotulos = () =>
  conErrores(async () => masRecientes(aRegistros(await getDocs(coleccionDelUsuario("rotulos")))));

// un rotulo esta pendiente mientras no haya salido en ningun PDF
export const listarPendientes = () =>
  conErrores(async () => {
    const consulta = query(coleccionDelUsuario("rotulos"), where("documento_id", "==", null));
    return masRecientes(aRegistros(await getDocs(consulta)));
  });

export const agregarRotulo = (form) =>
  conErrores(() =>
    addDoc(coleccionDelUsuario("rotulos"), {
      ean: form.ean.trim(),
      descripcion: form.descripcion.trim().toUpperCase(),
      precio_oferta: Number(form.precioOferta),
      precio_unitario: Number(form.precioNormal),
      copias: Number(form.copias),
      fecha_inicio: form.fechaInicio,
      fecha_fin: form.fechaFin,
      documento_id: null,
      fecha_creacion: serverTimestamp(),
    }),
  );

export const quitarRotulo = (id) => conErrores(() => deleteDoc(doc(coleccionDelUsuario("rotulos"), id)));

// Pinta el PDF con los pendientes y lo registra. El lote hace las escrituras juntas:
// o se crea el documento y se marcan sus rotulos, o no cambia nada.
export const generarDocumento = () =>
  conErrores(async () => {
    const rotulos = (await listarPendientes()).sort(porDescripcion);
    if (rotulos.length === 0) throw new ErrorApp("No tienes rótulos para imprimir", "sin-rotulos");

    // si esto falla no se registra nada
    await generarRotulos(rotulos);

    const total = contarCopias(rotulos);
    const titulo = `Rótulos ${new Date().toLocaleDateString("es-SV")}`;
    const documento = doc(coleccionDelUsuario("documentos"));

    const lote = writeBatch(db);
    lote.set(documento, { titulo, rotulos_por_hoja: POR_HOJA, total_rotulos: total, fecha_creacion: serverTimestamp() });
    for (const r of rotulos) {
      lote.update(doc(coleccionDelUsuario("rotulos"), r.id), { documento_id: documento.id });
    }
    await lote.commit();

    return { id: documento.id, titulo, rotulos: total, hojas: Math.ceil(total / POR_HOJA) };
  });

export const listarDocumentos = () =>
  conErrores(async () => masRecientes(aRegistros(await getDocs(coleccionDelUsuario("documentos")))));

// El archivo no se guarda: se vuelve a pintar con los mismos rotulos del documento
export const abrirDocumento = (id) =>
  conErrores(async () => {
    const consulta = query(coleccionDelUsuario("rotulos"), where("documento_id", "==", id));
    const rotulos = aRegistros(await getDocs(consulta)).sort(porDescripcion);
    if (rotulos.length === 0) throw new ErrorApp("Ese documento ya no tiene rótulos", "sin-rotulos");

    await compartirPdf(await generarRotulos(rotulos), `rotulos-${id}.pdf`);
  });
