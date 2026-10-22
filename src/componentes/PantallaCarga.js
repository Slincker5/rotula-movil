import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colores } from "../tema";
import Texto from "./Texto";

export default function PantallaCarga({ texto }) {
  return (
    <View style={estilos.contenedor}>
      <ActivityIndicator size="large" color={colores.naranja} />
      {texto && <Texto style={estilos.texto}>{texto}</Texto>}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    backgroundColor: colores.fondo,
  },
  texto: {
    color: colores.textoSuave,
  },
});
