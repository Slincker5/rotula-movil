import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
  Figtree_900Black,
} from "@expo-google-fonts/figtree";
import { ProveedorSesion } from "./src/contexto/Sesion";
import Navegacion from "./src/navegacion/Navegacion";
import PantallaCarga from "./src/componentes/PantallaCarga";

export default function App() {
  const [fuentesListas, errorFuentes] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
    Figtree_900Black,
  });

  // si las fuentes fallan la app sigue con la fuente del sistema
  if (!fuentesListas && !errorFuentes) return <PantallaCarga />;

  return (
    <SafeAreaProvider>
      <ProveedorSesion>
        <Navegacion />
      </ProveedorSesion>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
