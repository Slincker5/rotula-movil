import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSesion } from "../contexto/Sesion";
import { colores, radios } from "../tema";
import { hayErrores, validarPerfil } from "../utilidades/validaciones";
import Texto from "../componentes/Texto";
import Boton from "../componentes/Boton";
import Campo from "../componentes/Campo";
import AvisoError from "../componentes/AvisoError";

function Dato({ icono, etiqueta, valor }) {
  return (
    <View style={estilos.dato}>
      <Ionicons name={icono} size={20} color={colores.textoSuave} />
      <View style={{ flex: 1 }}>
        <Texto style={estilos.etiqueta}>{etiqueta}</Texto>
        <Texto peso="semi" style={estilos.valor}>
          {valor || "—"}
        </Texto>
      </View>
    </View>
  );
}

export default function Perfil() {
  const { usuario, actualizarPerfil, cerrarSesion } = useSesion();
  const [saliendo, setSaliendo] = useState(false);
  const [form, setForm] = useState(null); // null = viendo el perfil; con datos = editando
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState("");
  const [guardando, setGuardando] = useState(false);
  const iniciales = `${usuario?.nombre?.[0] ?? ""}${usuario?.apellido?.[0] ?? ""}`.toUpperCase();

  const salir = () => {
    Alert.alert("Cerrar sesión", "¿Quieres salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          setSaliendo(true);
          await cerrarSesion().catch((e) => {
            setSaliendo(false);
            Alert.alert("No se pudo cerrar sesión", e.message);
          });
        },
      },
    ]);
  };

  const empezarEdicion = () => {
    setForm({ nombre: usuario.nombre ?? "", apellido: usuario.apellido ?? "", negocio: usuario.nombre_negocio ?? "" });
    setErrores({});
    setErrorServidor("");
  };

  const cambiar = (campo) => (valor) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }));
    setErrorServidor("");
  };

  const guardar = async () => {
    const encontrados = validarPerfil(form);
    setErrores(encontrados);
    if (hayErrores(encontrados)) return;

    setGuardando(true);
    try {
      await actualizarPerfil(form);
      setForm(null);
    } catch (e) {
      setErrorServidor(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
      <View style={estilos.cabecera}>
        <View style={estilos.avatar}>
          <Texto peso="negrita" style={estilos.iniciales}>
            {iniciales}
          </Texto>
        </View>
        <Texto peso="negrita" style={estilos.nombre}>
          {usuario?.nombre} {usuario?.apellido}
        </Texto>
        {usuario?.nombre_negocio ? <Texto style={estilos.negocio}>{usuario.nombre_negocio}</Texto> : null}
      </View>

      {form ? (
        <View style={estilos.formulario}>
          <AvisoError mensaje={errorServidor} />
          <Campo etiqueta="Nombre" value={form.nombre} onChangeText={cambiar("nombre")} error={errores.nombre} maxLength={60} />
          <Campo etiqueta="Apellido" value={form.apellido} onChangeText={cambiar("apellido")} error={errores.apellido} maxLength={60} />
          <Campo etiqueta="Nombre de tu negocio" value={form.negocio} onChangeText={cambiar("negocio")} error={errores.negocio} maxLength={100} />
          <Boton titulo="Guardar cambios" icono="save-outline" cargando={guardando} alPresionar={guardar} />
          <Boton titulo="Cancelar" variante="fantasma" alPresionar={() => setForm(null)} />
        </View>
      ) : (
        <>
          <View style={estilos.tarjeta}>
            <Dato icono="mail-outline" etiqueta="Correo" valor={usuario?.email} />
            <View style={estilos.separador} />
            <Dato icono="storefront-outline" etiqueta="Negocio" valor={usuario?.nombre_negocio} />
            <View style={estilos.separador} />
            <Dato icono="pricetags-outline" etiqueta="Plan" valor="Gratis · 10 rótulos al mes" />
          </View>

          <Boton titulo="Editar perfil" icono="create-outline" variante="secundario" alPresionar={empezarEdicion} />
          <Boton titulo="Cerrar sesión" icono="log-out-outline" cargando={saliendo} alPresionar={salir} />
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    gap: 16,
    padding: 20,
    paddingBottom: 40,
  },
  cabecera: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    backgroundColor: colores.texto,
  },
  iniciales: {
    fontSize: 26,
    color: colores.blanco,
  },
  nombre: {
    fontSize: 24,
    letterSpacing: -0.4,
  },
  negocio: {
    fontSize: 15,
    color: colores.textoSuave,
  },
  tarjeta: {
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    backgroundColor: colores.blanco,
  },
  formulario: {
    gap: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    backgroundColor: colores.blanco,
  },
  dato: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
  },
  etiqueta: {
    fontSize: 12.5,
    color: colores.textoTenue,
  },
  valor: {
    fontSize: 15,
  },
  separador: {
    height: 1,
    backgroundColor: colores.borde,
  },
});
