import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { pedir } from "../api/cliente";
import { colores, radios } from "../tema";
import Texto from "../componentes/Texto";
import AvisoError from "../componentes/AvisoError";
import PantallaCarga from "../componentes/PantallaCarga";
import TarjetaDocumento from "../componentes/TarjetaDocumento";

export default function Historial() {
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState("");

  const cargar = async () => {
    try {
      setDocumentos(await pedir("/api/documentos"));
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, []),
  );

  if (cargando) return <PantallaCarga texto="Buscando tus documentos ..." />;

  return (
    <FlatList
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      data={documentos}
      keyExtractor={(d) => String(d.id)}
      renderItem={({ item }) => <TarjetaDocumento documento={item} />}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      refreshing={refrescando}
      onRefresh={() => {
        setRefrescando(true);
        cargar();
      }}
      ListHeaderComponent={
        <View style={estilos.encabezado}>
          <AvisoError mensaje={error} />
          <Texto peso="negrita" style={estilos.titulo}>
            Historial
          </Texto>
          <Texto style={estilos.descripcion}>
            Todos los PDF que has generado. Ábrelos y vuelve a imprimirlos cuando quieras.
          </Texto>
        </View>
      }
      ListEmptyComponent={
        <View style={estilos.vacio}>
          <Ionicons name="file-tray-outline" size={32} color={colores.textoSuave} />
          <Texto style={estilos.textoVacio}>Todavía no has generado ningún PDF.</Texto>
        </View>
      }
    />
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: 20,
    paddingBottom: 40,
  },
  encabezado: {
    gap: 8,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 32,
    letterSpacing: -0.7,
  },
  descripcion: {
    fontSize: 16,
    lineHeight: 23,
    color: "#333331",
  },
  vacio: {
    alignItems: "center",
    gap: 8,
    padding: 32,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colores.bordeInput,
    borderRadius: radios.tarjeta,
  },
  textoVacio: {
    textAlign: "center",
    color: colores.textoSuave,
  },
});
