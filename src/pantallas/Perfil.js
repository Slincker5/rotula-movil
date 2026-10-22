import { useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSesion } from "../contexto/Sesion";
import { API_URL } from "../api/cliente";
import { colores, radios } from "../tema";
import Texto from "../componentes/Texto";
import Boton from "../componentes/Boton";

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
  const { usuario, cerrarSesion } = useSesion();
  const [saliendo, setSaliendo] = useState(false);
  const iniciales = `${usuario?.nombre?.[0] ?? ""}${usuario?.apellido?.[0] ?? ""}`.toUpperCase();

  const salir = () => {
    Alert.alert("Cerrar sesión", "¿Quieres salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          setSaliendo(true);
          await cerrarSesion().catch(() => {});
        },
      },
    ]);
  };

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
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

      <View style={estilos.tarjeta}>
        <Dato icono="mail-outline" etiqueta="Correo" valor={usuario?.email} />
        <View style={estilos.separador} />
        <Dato icono="storefront-outline" etiqueta="Negocio" valor={usuario?.nombre_negocio} />
        <View style={estilos.separador} />
        <Dato icono="pricetags-outline" etiqueta="Plan" valor="Gratis · 10 rótulos al mes" />
      </View>

      <Boton titulo="Abrir Rotula en la web" icono="globe-outline" variante="secundario" alPresionar={() => Linking.openURL(API_URL)} />
      <Boton titulo="Cerrar sesión" icono="log-out-outline" cargando={saliendo} alPresionar={salir} />
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
