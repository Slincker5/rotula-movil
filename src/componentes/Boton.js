import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colores, radios } from "../tema";
import Texto from "./Texto";

const variantes = {
  primario: { fondo: colores.texto, presionado: "#333331", texto: colores.blanco, borde: colores.texto },
  acento: { fondo: colores.naranja, presionado: colores.naranjaOscuro, texto: colores.blanco, borde: colores.naranja },
  secundario: { fondo: colores.blanco, presionado: colores.superficieGris, texto: colores.texto, borde: colores.borde },
  fantasma: { fondo: "transparent", presionado: colores.superficieGris, texto: colores.texto, borde: "transparent" },
};

export default function Boton({ titulo, alPresionar, variante = "primario", icono, cargando, deshabilitado, pequeno, style }) {
  const v = variantes[variante];
  const inactivo = deshabilitado || cargando;

  return (
    <Pressable
      onPress={alPresionar}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      style={({ pressed }) => [
        estilos.boton,
        pequeno && estilos.pequeno,
        { backgroundColor: pressed ? v.presionado : v.fondo, borderColor: v.borde },
        pressed && { transform: [{ scale: 0.98 }] },
        inactivo && { opacity: 0.55 },
        style,
      ]}
    >
      <View style={estilos.contenido}>
        {cargando ? (
          <ActivityIndicator color={v.texto} size="small" />
        ) : (
          icono && <Ionicons name={icono} size={pequeno ? 16 : 18} color={v.texto} />
        )}
        <Texto peso="negrita" style={{ color: v.texto, fontSize: pequeno ? 14 : 16 }}>
          {titulo}
        </Texto>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    minHeight: 50,
    paddingHorizontal: 22,
    borderRadius: radios.pildora,
    borderWidth: 1,
    justifyContent: "center",
  },
  pequeno: {
    minHeight: 38,
    paddingHorizontal: 14,
  },
  contenido: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
