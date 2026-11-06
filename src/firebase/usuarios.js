import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./config";

// Trae el perfil de usuarios/{uid}; si es la primera vez que entra, lo crea.
// "extra" son los datos del formulario de registro; con Google salen de la cuenta.
export async function obtenerPerfil(usuarioAuth, extra) {
  const referencia = doc(db, "usuarios", usuarioAuth.uid);
  const existente = await getDoc(referencia);
  if (existente.exists()) return { id: usuarioAuth.uid, ...existente.data() };

  const [nombreCuenta = "", ...restoCuenta] = (usuarioAuth.displayName ?? "").trim().split(/\s+/);
  const perfil = {
    nombre: extra?.nombre || nombreCuenta || usuarioAuth.email.split("@")[0],
    apellido: extra?.apellido ?? restoCuenta.join(" "),
    nombre_negocio: extra?.nombre_negocio ?? "",
    email: usuarioAuth.email,
    proveedor: usuarioAuth.providerData[0]?.providerId ?? "password",
  };
  await setDoc(referencia, { ...perfil, fecha_registro: serverTimestamp() });
  return { id: usuarioAuth.uid, ...perfil };
}

export const guardarPerfil = (uid, cambios) => updateDoc(doc(db, "usuarios", uid), cambios);
