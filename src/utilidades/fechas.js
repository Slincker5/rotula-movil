const dosDigitos = (n) => String(n).padStart(2, "0");

// la API recibe las fechas como "AAAA-MM-DD"
export const aTextoFecha = (fecha) =>
  `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;

export const deTextoFecha = (texto) => {
  const [anio, mes, dia] = texto.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
};

// "2026-10-18" -> "18/10/2026"
export const fechaCorta = (texto) => (texto ? texto.split("-").reverse().join("/") : "");

export const fechaLarga = (valor) =>
  new Date(valor).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });

export const hoyLargo = () => {
  const texto = new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};
