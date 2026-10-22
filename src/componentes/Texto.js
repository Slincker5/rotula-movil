import { Text } from "react-native";
import { colores, fuentes } from "../tema";

// Text con la fuente Figtree; "peso" es una llave de fuentes (regular, semi, negrita, black...)
export default function Texto({ peso = "regular", style, ...props }) {
  return <Text style={[{ fontFamily: fuentes[peso], color: colores.texto }, style]} {...props} />;
}
