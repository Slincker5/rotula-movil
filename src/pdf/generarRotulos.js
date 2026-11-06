/**
 * src/pdf/generarRotulos.js
 * -------------------------
 * Abre la plantilla, pinta los rótulos (4 por hoja A4) y devuelve el PDF en base64.
 * Es el mismo generador de la web, adaptado para correr en el celular.
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { dibujarRotulo, mm } from "./pintarRotulo";
import { PLANTILLA_BASE64 } from "./plantilla";

/** Repite cada rótulo según `copias`: 8 copias -> 8 rótulos -> 2 hojas. */
export function expandir(rotulos) {
  const salida = [];
  for (const r of rotulos) {
    const n = Math.max(1, Math.floor(Number(r.copias) || 1));
    for (let i = 0; i < n; i++) salida.push(r);
  }
  return salida;
}

/* ─── armado del documento ─────────────────────────────────────────────── */

const A4 = { ancho: mm(210), alto: mm(297) };
// 4 rótulos A6 llenan una A4 exacta: 210 = 2 x 105 y 297 = 2 x 148.5
const CELDAS = [
  { x: 0, y: mm(148.5) },        // arriba izquierda
  { x: mm(105), y: mm(148.5) },  // arriba derecha
  { x: 0, y: 0 },                // abajo izquierda
  { x: mm(105), y: 0 },          // abajo derecha
];

function marcasDeCorte(page) {
  const gris = rgb(0.6, 0.6, 0.6);
  const t = 0.3;
  const largo = mm(5);
  const lineas = [
    [{ x: mm(105), y: 0 }, { x: mm(105), y: largo }],
    [{ x: mm(105), y: A4.alto - largo }, { x: mm(105), y: A4.alto }],
    [{ x: 0, y: mm(148.5) }, { x: largo, y: mm(148.5) }],
    [{ x: A4.ancho - largo, y: mm(148.5) }, { x: A4.ancho, y: mm(148.5) }],
  ];
  for (const [start, end] of lineas) page.drawLine({ start, end, thickness: t, color: gris });
}

/**
 * @param {Array} rotulos  objetos { ean, descripcion, precio_oferta, precio_unitario, copias, fecha_inicio, fecha_fin }
 * @returns {Promise<string>} PDF en base64, listo para guardar
 */
export async function generarRotulos(rotulos) {
  const doc = await PDFDocument.create();
  doc.setTitle("Rótulos de oferta");
  doc.setCreator("Rotula");

  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);

  const [fondo] = await doc.embedPdf(PLANTILLA_BASE64);

  const lista = expandir(rotulos);
  if (lista.length === 0) throw new Error("No hay rótulos que generar");

  let page = null;
  lista.forEach((r, i) => {
    const posicion = i % 4;
    if (posicion === 0) {
      page = doc.addPage([A4.ancho, A4.alto]);
      marcasDeCorte(page);
    }
    const celda = CELDAS[posicion];
    page.drawPage(fondo, { x: celda.x, y: celda.y, width: mm(105), height: mm(148.5) });
    dibujarRotulo(page, r, celda, { bold, regular });
  });

  return doc.saveAsBase64();
}
