import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colores, fuentes, radios } from "../tema";
import Texto from "./Texto";

// Etiqueta + TextInput + mensaje de error debajo.
// "secreto" oculta el texto y agrega el boton del ojo para mostrarlo.
export default function Campo({ etiqueta, error, ayuda, secreto, style, ...props }) {
  const [enfocado, setEnfocado] = useState(false);
  const [visible, setVisible] = useState(false);

  const colorBorde = error ? colores.error : enfocado ? colores.texto : colores.bordeInput;

  return (
    <View style={[estilos.campo, style]}>
      <Texto peso="semi" style={estilos.etiqueta}>
        {etiqueta}
      </Texto>
      <View style={[estilos.caja, { borderColor: colorBorde }, error && estilos.cajaError]}>
        <TextInput
          {...props}
          secureTextEntry={secreto && !visible}
          placeholderTextColor={colores.placeholder}
          onFocus={() => setEnfocado(true)}
          onBlur={(e) => {
            setEnfocado(false);
            props.onBlur?.(e);
          }}
          accessibilityLabel={etiqueta}
          style={estilos.input}
        />
        {secreto && (
          <Pressable
            onPress={() => setVisible(!visible)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={20} color={colores.textoSuave} />
          </Pressable>
        )}
      </View>
      {error ? (
        <View style={estilos.filaError}>
          <Ionicons name="alert-circle" size={14} color={colores.error} />
          <Texto peso="media" style={estilos.error}>
            {error}
          </Texto>
        </View>
      ) : (
        ayuda && <Texto style={estilos.ayuda}>{ayuda}</Texto>
      )}
    </View>
  );
}

export const estilos = StyleSheet.create({
  campo: {
    gap: 8,
  },
  etiqueta: {
    fontSize: 14,
  },
  caja: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: radios.input,
    backgroundColor: colores.blanco,
  },
  cajaError: {
    backgroundColor: colores.naranjaClaro,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: fuentes.regular,
    fontSize: 16,
    color: colores.texto,
  },
  filaError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  error: {
    flex: 1,
    fontSize: 13,
    color: colores.error,
  },
  ayuda: {
    fontSize: 13,
    color: colores.textoTenue,
  },
});
