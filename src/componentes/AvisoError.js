import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colores, radios } from "../tema";
import Texto from "./Texto";

// Mensaje que viene del servidor (credenciales invalidas, correo repetido, sin internet...)
export default function AvisoError({ mensaje }) {
  if (!mensaje) return null;
  return (
    <View style={estilos.aviso} accessibilityRole="alert">
      <Ionicons name="warning-outline" size={18} color={colores.error} />
      <Texto peso="media" style={estilos.texto}>
        {mensaje}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  aviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: radios.input,
    borderWidth: 1,
    borderColor: colores.naranjaBorde,
    backgroundColor: colores.naranjaClaro,
  },
  texto: {
    flex: 1,
    fontSize: 14,
    color: colores.error,
  },
});
