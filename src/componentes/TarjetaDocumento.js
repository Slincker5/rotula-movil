import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colores, radios } from "../tema";
import { fechaLarga } from "../utilidades/fechas";
import { abrirPdf } from "../api/pdf";
import Texto from "./Texto";
import Boton from "./Boton";

// Un PDF generado: titulo, cuantos rotulos/hojas y el boton para abrirlo
export default function TarjetaDocumento({ documento }) {
  const [abriendo, setAbriendo] = useState(false);
  const hojas = Math.ceil(documento.total_rotulos / (documento.rotulos_por_hoja || 4));

  const abrir = async () => {
    setAbriendo(true);
    try {
      await abrirPdf(documento.url_pdf, `rotulos-${documento.uuid}.pdf`);
    } catch (error) {
      Alert.alert("No se pudo abrir el PDF", error.message);
    } finally {
      setAbriendo(false);
    }
  };

  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.icono}>
        <Ionicons name="document-text" size={24} color={colores.blanco} />
      </View>
      <View style={estilos.info}>
        <Texto peso="semi" numberOfLines={1} style={estilos.titulo}>
          {documento.titulo}
        </Texto>
        <Texto style={estilos.meta}>
          {documento.total_rotulos} rótulos · {hojas} {hojas === 1 ? "hoja" : "hojas"} ·{" "}
          {fechaLarga(documento.fecha_creacion)}
        </Texto>
      </View>
      <Boton titulo="PDF" icono="download-outline" variante="secundario" pequeno cargando={abriendo} alPresionar={abrir} />
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    backgroundColor: colores.superficie,
  },
  icono: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.naranja,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    fontSize: 15,
  },
  meta: {
    fontSize: 13,
    color: colores.textoSuave,
  },
});
