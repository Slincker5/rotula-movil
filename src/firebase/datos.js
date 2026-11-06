import { collection } from "firebase/firestore";
import { auth, db } from "./config";
import { ErrorApp } from "./errores";

// Todo lo del usuario vive debajo de usuarios/{uid}, asi cada cuenta solo ve lo suyo
export function coleccionDelUsuario(nombre) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new ErrorApp("Tu sesión terminó. Inicia sesión de nuevo.", "unauthenticated");
  return collection(db, "usuarios", uid, nombre);
}

// Firestore devuelve las fechas como Timestamp; las pantallas trabajan con Date
export const aFecha = (valor) => (valor?.toDate ? valor.toDate() : new Date());

export const aRegistros = (consulta) =>
  consulta.docs.map((d) => {
    const datos = d.data();
    return { id: d.id, ...datos, fecha_creacion: aFecha(datos.fecha_creacion) };
  });

export const masRecientes = (registros) => [...registros].sort((a, b) => b.fecha_creacion - a.fecha_creacion);
