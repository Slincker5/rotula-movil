import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSesion } from "../contexto/Sesion";
import { hayErrores, validarRegistro } from "../utilidades/validaciones";
import { colores } from "../tema";
import MarcoAcceso from "../componentes/MarcoAcceso";
import Campo from "../componentes/Campo";
import Boton from "../componentes/Boton";
import AvisoError from "../componentes/AvisoError";
import Texto from "../componentes/Texto";

const vacio = { nombre: "", apellido: "", negocio: "", correo: "", clave: "", confirmar: "" };

export default function Registro({ navigation }) {
  const { registrar } = useSesion();
  const [datos, setDatos] = useState(vacio);
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiar = (campo) => (texto) => {
    setDatos((actuales) => ({ ...actuales, [campo]: texto }));
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }));
    setErrorServidor("");
  };

  const crearCuenta = async () => {
    const encontrados = validarRegistro(datos);
    setErrores(encontrados);
    if (hayErrores(encontrados)) return;

    setCargando(true);
    try {
      await registrar(datos);
    } catch (error) {
      if (error.estado === 409) setErrores({ correo: "Ese correo ya tiene una cuenta. Inicia sesión." });
      else setErrorServidor(error.message);
      setCargando(false);
    }
  };

  return (
    <MarcoAcceso titulo="Tu primer rótulo, en minutos." subtitulo="Crea tu cuenta gratis y empieza a imprimir tus ofertas.">
      <AvisoError mensaje={errorServidor} />

      <View style={estilos.dosColumnas}>
        <Campo
          style={estilos.columna}
          etiqueta="Nombre"
          value={datos.nombre}
          onChangeText={cambiar("nombre")}
          error={errores.nombre}
          autoComplete="given-name"
          textContentType="givenName"
          maxLength={60}
        />
        <Campo
          style={estilos.columna}
          etiqueta="Apellido"
          value={datos.apellido}
          onChangeText={cambiar("apellido")}
          error={errores.apellido}
          autoComplete="family-name"
          textContentType="familyName"
          maxLength={60}
        />
      </View>
      <Campo
        etiqueta="Nombre de tu negocio"
        value={datos.negocio}
        onChangeText={cambiar("negocio")}
        error={errores.negocio}
        ayuda="Opcional. Aparece en tu saludo de inicio."
        placeholder="Tienda La Esquina"
        maxLength={100}
      />
      <Campo
        etiqueta="Tu correo"
        value={datos.correo}
        onChangeText={cambiar("correo")}
        error={errores.correo}
        placeholder="ejemplo@rotula.app"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        maxLength={120}
      />
      <Campo
        etiqueta="Tu contraseña"
        value={datos.clave}
        onChangeText={cambiar("clave")}
        error={errores.clave}
        ayuda="Mínimo 8 caracteres, con letras y números."
        placeholder="••••••••"
        secreto
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Campo
        etiqueta="Repite tu contraseña"
        value={datos.confirmar}
        onChangeText={cambiar("confirmar")}
        error={errores.confirmar}
        placeholder="••••••••"
        secreto
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={crearCuenta}
      />

      <Boton titulo="Crear mi cuenta" icono="person-add-outline" variante="acento" cargando={cargando} alPresionar={crearCuenta} />

      <View style={estilos.fila}>
        <Texto style={estilos.texto}>¿Ya tienes cuenta?</Texto>
        <Pressable onPress={() => navigation.navigate("Login")} hitSlop={8} accessibilityRole="link">
          <Texto peso="negrita" style={estilos.enlace}>
            Inicia sesión
          </Texto>
        </Pressable>
      </View>
    </MarcoAcceso>
  );
}

const estilos = StyleSheet.create({
  dosColumnas: {
    flexDirection: "row",
    gap: 12,
  },
  columna: {
    flex: 1,
  },
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
