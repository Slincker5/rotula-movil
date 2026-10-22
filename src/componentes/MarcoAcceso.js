import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colores } from "../tema";
import Logo from "./Logo";
import Texto from "./Texto";

// Estructura comun de login y registro: bloque gris con el saludo y el formulario debajo
export default function MarcoAcceso({ titulo, subtitulo, children }) {
  return (
    <SafeAreaView style={estilos.pantalla} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={estilos.pantalla} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={estilos.scroll} keyboardShouldPersistTaps="handled">
          <View style={estilos.encabezado}>
            <Logo tamano={20} />
            <Texto peso="black" style={estilos.titulo}>
              {titulo}
            </Texto>
            <Texto style={estilos.subtitulo}>{subtitulo}</Texto>
          </View>
          <View style={estilos.formulario}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  scroll: {
    flexGrow: 1,
  },
  encabezado: {
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: colores.superficieGris,
  },
  titulo: {
    marginTop: 20,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  subtitulo: {
    fontSize: 17,
    lineHeight: 24,
    color: colores.textoSuave,
  },
  formulario: {
    gap: 18,
    padding: 24,
  },
});
