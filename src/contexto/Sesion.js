import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { conErrores } from "../firebase/errores";
import { cerrarSesionGoogle, pedirTokenGoogle } from "../firebase/google";
import { guardarPerfil, obtenerPerfil } from "../firebase/usuarios";

const SesionContexto = createContext(null);

// Guarda el usuario que inicio sesion y lo comparte con todas las pantallas
export function ProveedorSesion({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [revisando, setRevisando] = useState(true);
  // datos del formulario de registro, para crear el perfil apenas exista la cuenta
  const datosRegistro = useRef(null);

  // Firebase avisa aqui cada vez que cambia la sesion, tambien al abrir la app si ya habia una
  useEffect(
    () =>
      onAuthStateChanged(auth, async (usuarioAuth) => {
        if (!usuarioAuth) {
          setUsuario(null);
          setRevisando(false);
          return;
        }

        let perfil;
        try {
          perfil = await obtenerPerfil(usuarioAuth, datosRegistro.current);
          datosRegistro.current = null;
        } catch (error) {
          // sin perfil igual se puede entrar: cada pantalla avisara si Firestore no responde
          console.warn("[perfil]", error?.code ?? error);
          perfil = { id: usuarioAuth.uid, nombre: usuarioAuth.displayName ?? "", apellido: "", nombre_negocio: "", email: usuarioAuth.email };
        }

        if (auth.currentUser?.uid === usuarioAuth.uid) setUsuario(perfil);
        setRevisando(false);
      }),
    [],
  );

  const iniciarSesion = (correo, clave) =>
    conErrores(() => signInWithEmailAndPassword(auth, correo.trim().toLowerCase(), clave));

  const registrar = ({ nombre, apellido, negocio, correo, clave }) => {
    datosRegistro.current = { nombre: nombre.trim(), apellido: apellido.trim(), nombre_negocio: negocio.trim() };
    return conErrores(() => createUserWithEmailAndPassword(auth, correo.trim().toLowerCase(), clave)).catch((error) => {
      datosRegistro.current = null;
      throw error;
    });
  };

  // si el usuario cierra el selector de cuentas no se hace nada
  const entrarConGoogle = () =>
    conErrores(async () => {
      const idToken = await pedirTokenGoogle();
      if (idToken) await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
    });

  const actualizarPerfil = async ({ nombre, apellido, negocio }) => {
    const cambios = { nombre: nombre.trim(), apellido: apellido.trim(), nombre_negocio: negocio.trim() };
    await conErrores(() => guardarPerfil(usuario.id, cambios));
    setUsuario((actual) => ({ ...actual, ...cambios }));
  };

  const cerrarSesion = async () => {
    await cerrarSesionGoogle();
    await conErrores(() => signOut(auth));
  };

  return (
    <SesionContexto.Provider value={{ usuario, revisando, iniciarSesion, registrar, entrarConGoogle, actualizarPerfil, cerrarSesion }}>
      {children}
    </SesionContexto.Provider>
  );
}

export const useSesion = () => useContext(SesionContexto);
