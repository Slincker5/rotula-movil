import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSesion } from "../contexto/Sesion";
import { colores } from "../tema";
import Boton from "./Boton";
import Texto from "./Texto";

// Separador "o" y boton para entrar con Google; se usa en Login y en Registro
export default function BotonGoogle({ alError }) {
  const { entrarConGoogle } = useSesion();
  const [cargando, setCargando] = useState(false);

  const entrar = async () => {
    alError("");
    setCargando(true);
    try {
      // si sale bien, Navegacion detecta el usuario y cambia a las pestanas
      await entrarConGoogle();
    } catch (error) {
      alError(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <View style={estilos.separador}>
        <View style={estilos.linea} />
        <Texto style={estilos.texto}>o</Texto>
        <View style={estilos.linea} />
      </View>
      <Boton titulo="Continuar con Google" icono="logo-google" variante="secundario" cargando={cargando} alPresionar={entrar} />
    </>
  );
}

const estilos = StyleSheet.create({
  separador: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  linea: {
    flex: 1,
    height: 1,
    backgroundColor: colores.borde,
  },
  texto: {
    fontSize: 14,
    color: colores.textoTenue,
  },
});
