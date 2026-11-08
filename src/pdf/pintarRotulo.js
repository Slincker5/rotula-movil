/**
 * src/pdf/pintarRotulo.js
 * -----------------------
 * Dibuja UN rótulo sobre una página. No sabe de archivos ni de base de datos.
 * Aquí se editan los textos (TEXTOS) y las posiciones (Z).
 */

import { rgb } from "pdf-lib";

/* ─── ZONAS ────────────────────────────────────────────────────────────────
   Coordenadas en mm, medidas desde la ESQUINA SUPERIOR IZQUIERDA del rótulo.
   Si mueves una forma en el SVG, ajusta el número de aquí y nada más.        */
const Z = {
  ancho: 105,
  alto: 148.5,
  margen: 8,

  descripcion: { y: 40, ancho: 89, maxLineas: 2, maxPt: 19, minPt: 11 }, // y = base de la ÚLTIMA línea
  eyebrow: { y: 58, pt: 10 },
  precio: { y: 100, anchoMax: 88, pt: 96 },
  comparativo: { y: 121, pt: 11.5 },
  vigencia: { y: 134, interlinea: 5, pt: 9 },
  ean: { derecha: 98, y: 139, pt: 10 },
};

const COLOR = {
  rojo: rgb(0.757, 0.071, 0.122), // #C1121F
  blanco: rgb(1, 1, 1),
  negro: rgb(0, 0, 0),
  gris: rgb(0.37, 0.37, 0.37),
};

const MM = 72 / 25.4;
export const mm = (v) => v * MM;

/* ─── helpers de datos ─────────────────────────────────────────────────── */

export function formatearFecha(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : (iso ?? "");
}

const dinero = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0).toFixed(2);

/* ─── EAN-13 ───────────────────────────────────────────────────────────── */

const verificador = (d12) => {
  let s = 0;
  for (let i = 0; i < 12; i++) s += Number(d12[i]) * (i % 2 === 0 ? 1 : 3);
  return (10 - (s % 10)) % 10;
};

/** Devuelve el EAN de 13 dígitos; si vienen 12, calcula el verificador. */
export function normalizarEan(ean) {
  const d = String(ean ?? "").replace(/\D/g, "");
  if (d.length === 12) return d + verificador(d);
  if (d.length === 13) return d;
  return d || null; // si trae otro largo, se imprime tal cual
}

/* ─── texto ────────────────────────────────────────────────────────────── */

/** Helvetica solo tiene caracteres latinos: un emoji del teclado haría fallar el PDF. */
const soloLatino = (texto) => String(texto ?? "").replace(/[^\x20-\x7E\xA0-\xFF]/g, "");

/** Parte el texto en líneas que caben en `anchoPt` y baja el tamaño si no alcanza. */
function ajustarTexto(texto, font, { anchoMm, maxLineas, maxPt, minPt }) {
  const anchoPt = mm(anchoMm);
  const palabras = soloLatino(texto).trim().split(/\s+/);

  for (let pt = maxPt; pt >= minPt; pt -= 0.5) {
    const lineas = [];
    let actual = "";
    let cabe = true;

    for (const palabra of palabras) {
      const prueba = actual ? `${actual} ${palabra}` : palabra;
      if (font.widthOfTextAtSize(prueba, pt) <= anchoPt) {
        actual = prueba;
      } else {
        if (actual) lineas.push(actual);
        actual = palabra;
        if (font.widthOfTextAtSize(palabra, pt) > anchoPt) cabe = false;
      }
    }
    if (actual) lineas.push(actual);

    if (cabe && lineas.length <= maxLineas) return { lineas, pt };
  }

  // último recurso: corta con puntos suspensivos
  let corte = soloLatino(texto);
  while (corte.length > 4 && font.widthOfTextAtSize(`${corte}…`, minPt) > anchoPt * maxLineas) {
    corte = corte.slice(0, -1);
  }
  return { lineas: [`${corte}…`], pt: minPt };
}

/* ─── dibujo de un rótulo ──────────────────────────────────────────────── */

export function dibujarRotulo(page, r, origen, fuentes) {
  const { bold, regular } = fuentes;
  // convierte mm-desde-arriba-del-rótulo a coordenadas PDF
  const X = (x) => origen.x + mm(x);
  const Y = (y) => origen.y + mm(Z.alto - y);

  /* descripción */
  const desc = ajustarTexto(r.descripcion, bold, {
    anchoMm: Z.descripcion.ancho,
    maxLineas: Z.descripcion.maxLineas,
    maxPt: Z.descripcion.maxPt,
    minPt: Z.descripcion.minPt,
  });
  const interlinea = desc.pt * 1.18;
  desc.lineas.forEach((linea, i) => {
    // se apila hacia arriba desde Z.descripcion.y, así queda pegada al bloque rojo
    const desdeAbajo = (desc.lineas.length - 1 - i) * interlinea;
    page.drawText(linea, {
      x: X(Z.margen),
      y: Y(Z.descripcion.y) + desdeAbajo,
      size: desc.pt,
      font: bold,
      color: COLOR.negro,
    });
  });

  /* etiqueta dentro del bloque rojo */
  page.drawText("Precio de oferta", {
    x: X(Z.margen + 1),
    y: Y(Z.eyebrow.y),
    size: Z.eyebrow.pt,
    font: regular,
    color: COLOR.blanco,
  });

  /* precio: $ + entero + centavos, centrado y auto-reducido */
  const [entero, centavos] = dinero(r.precio_oferta).split(".");
  let pt = Z.precio.pt;
  let ancho;
  for (;;) {
    ancho =
      bold.widthOfTextAtSize("$", pt * 0.4) +
      bold.widthOfTextAtSize(entero, pt) +
      bold.widthOfTextAtSize(centavos, pt * 0.4) +
      mm(3);
    if (ancho <= mm(Z.precio.anchoMax) || pt <= 40) break;
    pt -= 2;
  }

  let cursor = X(Z.ancho / 2) - ancho / 2;
  page.drawText("$", { x: cursor, y: Y(Z.precio.y - pt * 0.24), size: pt * 0.4, font: bold, color: COLOR.blanco });
  cursor += bold.widthOfTextAtSize("$", pt * 0.4) + mm(1.5);
  page.drawText(entero, { x: cursor, y: Y(Z.precio.y), size: pt, font: bold, color: COLOR.blanco });
  cursor += bold.widthOfTextAtSize(entero, pt) + mm(1.5);
  page.drawText(centavos, { x: cursor, y: Y(Z.precio.y - pt * 0.24), size: pt * 0.4, font: bold, color: COLOR.blanco });

  /* antes / ahorra */
  const regular2 = Number(r.precio_unitario);
  const ahorro = regular2 - Number(r.precio_oferta);
  const ptc = Z.comparativo.pt;
  const antes = `Antes $${dinero(regular2)}`;
  const anchoAntes = regular.widthOfTextAtSize(antes, ptc);
  const ahorroTxt = ahorro > 0 ? `Ahorra $${dinero(ahorro)}` : null;
  const anchoAhorro = ahorroTxt ? bold.widthOfTextAtSize(ahorroTxt, ptc) + mm(5) : 0;
  const total = anchoAntes + (ahorroTxt ? mm(4) + anchoAhorro : 0);
  let cx = X(Z.ancho / 2) - total / 2;

  page.drawText(antes, { x: cx, y: Y(Z.comparativo.y), size: ptc, font: regular, color: COLOR.gris });
  page.drawLine({
    start: { x: cx, y: Y(Z.comparativo.y) + ptc * 0.28 },
    end: { x: cx + anchoAntes, y: Y(Z.comparativo.y) + ptc * 0.28 },
    thickness: 0.8,
    color: COLOR.gris,
  });

  if (ahorroTxt) {
    cx += anchoAntes + mm(4);
    page.drawRectangle({
      x: cx,
      y: Y(Z.comparativo.y) - mm(1.4),
      width: anchoAhorro,
      height: ptc + mm(2),
      color: COLOR.rojo,
    });
    page.drawText(ahorroTxt, { x: cx + mm(2.5), y: Y(Z.comparativo.y), size: ptc, font: bold, color: COLOR.blanco });
  }

  /* vigencia */
  const lineas = [
    `Válido del ${formatearFecha(r.fecha_inicio)}`,
    `al ${formatearFecha(r.fecha_fin)}`,
  ];
  lineas.forEach((linea, i) => {
    page.drawText(linea, {
      x: X(Z.margen),
      y: Y(Z.vigencia.y + i * Z.vigencia.interlinea),
      size: Z.vigencia.pt,
      font: regular,
      color: COLOR.gris,
    });
  });

  /* EAN, sin barras */
  const ean = normalizarEan(r.ean);
  if (ean) {
    page.drawText(ean, {
      x: X(Z.ean.derecha) - regular.widthOfTextAtSize(ean, Z.ean.pt),
      y: Y(Z.ean.y),
      size: Z.ean.pt,
      font: regular,
      color: COLOR.gris,
    });
  }
}

