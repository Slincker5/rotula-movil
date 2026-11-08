import { addDoc, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { aRegistros, coleccionDelUsuario } from "./datos";
import { conErrores } from "./errores";

const aDatos = ({ ean, descripcion, precio }) => ({
  ean: ean.trim(),
  descripcion: descripcion.trim().toUpperCase(),
  precio: Number(precio),
});

export const listarProductos = () =>
  conErrores(async () =>
    aRegistros(await getDocs(coleccionDelUsuario("productos"))).sort((a, b) => a.descripcion.localeCompare(b.descripcion)),
  );

export const crearProducto = (form) =>
  conErrores(() => addDoc(coleccionDelUsuario("productos"), { ...aDatos(form), fecha_creacion: serverTimestamp() }));

export const editarProducto = (id, form) =>
  conErrores(() => updateDoc(doc(coleccionDelUsuario("productos"), id), aDatos(form)));

export const borrarProducto = (id) => conErrores(() => deleteDoc(doc(coleccionDelUsuario("productos"), id)));
