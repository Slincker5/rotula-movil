import { StyleSheet, View } from "react-native";
import { colores, radios } from "../tema";
import { fechaCorta } from "../utilidades/fechas";
import Texto from "./Texto";

// Muestra como va a quedar el afiche mientras se llena el formulario
export default function VistaPreviaAfiche({ descripcion, precioOferta, precioNormal, fechaInicio, fechaFin }) {
  return (
    <View style={estilos.afiche} accessibilityLabel="Vista previa del afiche">
      <View style={estilos.arriba}>
        <Texto peso="extra" style={estilos.antes}>
          {precioNormal ? `Antes $${precioNormal}` : "Solo por días"}
        </Texto>
        <Texto peso="black" style={estilos.oferta}>
          SÚPER OFERTA
        </Texto>
      </View>
      <View style={estilos.centro}>
        <Texto peso="semi" numberOfLines={2} style={estilos.producto}>
          {descripcion ? descripcion.toLocaleUpperCase() : "DESCRIPCIÓN DEL PRODUCTO"}
        </Texto>
        <Texto peso="extra" adjustsFontSizeToFit numberOfLines={1} style={estilos.precio}>
          ${precioOferta || "0.00"}
        </Texto>
      </View>
      <View style={estilos.abajo}>
        <Texto peso="negrita" style={estilos.fecha}>
          INICIO: {fechaCorta(fechaInicio) || "—"}
        </Texto>
        <Texto peso="negrita" style={estilos.fecha}>
          HASTA: {fechaCorta(fechaFin) || "—"}
        </Texto>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  afiche: {
    aspectRatio: 8.5 / 11,
    width: "100%",
    maxWidth: 250,
    alignSelf: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: radios.input,
    backgroundColor: colores.amarilloAfiche,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  arriba: {
    alignItems: "center",
    gap: 2,
  },
  antes: {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    opacity: 0.85,
  },
  oferta: {
    fontSize: 27,
    letterSpacing: -0.8,
    textAlign: "center",
  },
  centro: {
    alignItems: "center",
    gap: 4,
  },
  producto: {
    fontSize: 14,
    textAlign: "center",
  },
  precio: {
    fontSize: 62,
    letterSpacing: -2,
    lineHeight: 68,
  },
  abajo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fecha: {
    fontSize: 9.5,
    letterSpacing: 0.6,
  },
});
