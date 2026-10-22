import { colores } from "../tema";
import Texto from "./Texto";

export default function Logo({ tamano = 18 }) {
  return (
    <Texto peso="extra" style={{ fontSize: tamano, letterSpacing: -0.3 }}>
      ROTULA<Texto peso="extra" style={{ fontSize: tamano, color: colores.naranja }}>.APP</Texto>
    </Texto>
  );
}
