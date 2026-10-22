import { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSesion } from "../contexto/Sesion";
import { hayErrores, validarLogin } from "../utilidades/validaciones";
import { colores } from "../tema";
import MarcoAcceso from "../componentes/MarcoAcceso";
import Campo from "../componentes/Campo";
import Boton from "../componentes/Boton";
import AvisoError from "../componentes/AvisoError";
import Texto from "../componentes/Texto";

export default function Login({ navigation }) {
  const { iniciarSesion } = useSesion();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState("");
  const [cargando, setCargando] = useState(false);
  const campoClave = useRef(null);

  // al escribir en un campo se borra su error para no dejar mensajes viejos
  const cambiar = (campo, setter) => (texto) => {
    setter(texto);
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }));
    setErrorServidor("");
  };

  const entrar = async () => {
    const encontrados = validarLogin({ correo, clave });
    setErrores(encontrados);
    if (hayErrores(encontrados)) return;

    setCargando(true);
    try {
      // si sale bien, Navegacion detecta el usuario y cambia a las pestanas
      await iniciarSesion(correo, clave);
    } catch (error) {
      setErrorServidor(
        error.estado === 401 || error.message === "Credenciales invalidas"
          ? "El correo o la contraseña no son correctos."
          : error.message,
      );
      setCargando(false);
    }
  };

  return (
    <MarcoAcceso titulo="Qué bueno verte de vuelta." subtitulo="Entra para seguir con tus ofertas de la semana.">
      <AvisoError mensaje={errorServidor} />

      <Campo
        etiqueta="Tu correo"
        value={correo}
        onChangeText={cambiar("correo", setCorreo)}
        error={errores.correo}
        placeholder="ejemplo@rotula.app"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => campoClave.current?.focus()}
      />
      <Campo
        ref={campoClave}
        etiqueta="Tu contraseña"
        value={clave}
        onChangeText={cambiar("clave", setClave)}
        error={errores.clave}
        placeholder="••••••••"
        secreto
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={entrar}
      />

      <Boton titulo="Iniciar sesión" icono="log-in-outline" variante="acento" cargando={cargando} alPresionar={entrar} />

      <View style={estilos.fila}>
        <Texto style={estilos.texto}>¿Aún no tienes cuenta?</Texto>
        <Pressable onPress={() => navigation.navigate("Registro")} hitSlop={8} accessibilityRole="link">
          <Texto peso="negrita" style={estilos.enlace}>
            Regístrate
          </Texto>
        </Pressable>
      </View>
    </MarcoAcceso>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
  },
  texto: {
    fontSize: 15,
    color: colores.textoSuave,
  },
  enlace: {
    fontSize: 15,
    color: colores.naranja,
  },
});
