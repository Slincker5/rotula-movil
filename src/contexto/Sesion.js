import { createContext, useContext, useEffect, useState } from "react";
import { pedir } from "../api/cliente";

const SesionContexto = createContext(null);

// Guarda el usuario que inicio sesion y lo comparte con todas las pantallas
export function ProveedorSesion({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [revisando, setRevisando] = useState(true);

  const cargarUsuario = async () => {
    const datos = await pedir("/api/usuario");
    setUsuario(datos.usuario);
    return datos.usuario;
  };

  // al abrir la app reviso si la cookie de una sesion anterior sigue valida (dura 7 dias)
  useEffect(() => {
    cargarUsuario()
      .catch(() => setUsuario(null))
      .finally(() => setRevisando(false));
  }, []);

  const iniciarSesion = async (correo, clave) => {
    await pedir("/api/login", {
      metodo: "POST",
      cuerpo: { email: correo.trim().toLowerCase(), password: clave },
    });
    await cargarUsuario();
  };

  // la API de registro no abre sesion, por eso despues se hace login con los mismos datos
  const registrar = async ({ nombre, apellido, negocio, correo, clave }) => {
    await pedir("/api/registro", {
      metodo: "POST",
      cuerpo: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        nombre_negocio: negocio.trim(),
        email: correo.trim().toLowerCase(),
        password_hash: clave,
      },
    });
    await iniciarSesion(correo, clave);
  };

  const cerrarSesion = async () => {
    try {
      await pedir("/api/logout", { metodo: "POST" });
    } finally {
      setUsuario(null);
    }
  };

  return (
    <SesionContexto.Provider value={{ usuario, revisando, iniciarSesion, registrar, cerrarSesion }}>
      {children}
    </SesionContexto.Provider>
  );
}

export const useSesion = () => useContext(SesionContexto);
