import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { colores, radios } from "../tema";
import { aTextoFecha, deTextoFecha, fechaCorta } from "../utilidades/fechas";
import Texto from "./Texto";
import Boton from "./Boton";
import { estilos as estilosCampo } from "./Campo";

// valor y alCambiar usan texto "AAAA-MM-DD", el mismo formato que pide la API
export default function CampoFecha({ etiqueta, valor, alCambiar, error, style }) {
  const [abiertoIos, setAbiertoIos] = useState(false);
  const fecha = valor ? deTextoFecha(valor) : new Date();
  const colorBorde = error ? colores.error : colores.bordeInput;

  const abrir = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: fecha,
        mode: "date",
        onValueChange: (_evento, elegida) => alCambiar(aTextoFecha(elegida)),
      });
    } else {
      setAbiertoIos(true);
    }
  };

  return (
    <View style={[estilosCampo.campo, style]}>
      <Texto peso="semi" style={estilosCampo.etiqueta}>
        {etiqueta}
      </Texto>

      {Platform.OS === "web" ? (
        // en la vista web no hay selector nativo: se escribe la fecha a mano
        <View style={[estilosCampo.caja, { borderColor: colorBorde }]}>
          <TextInput
            value={valor}
            onChangeText={alCambiar}
            placeholder="AAAA-MM-DD"
            placeholderTextColor={colores.placeholder}
            style={estilosCampo.input}
          />
        </View>
      ) : (
        <Pressable
          onPress={abrir}
          accessibilityRole="button"
          accessibilityLabel={`${etiqueta}: ${valor ? fechaCorta(valor) : "sin elegir"}`}
          style={[estilosCampo.caja, { borderColor: colorBorde }, error && estilosCampo.cajaError]}
        >
          <Texto style={[estilos.valor, !valor && { color: colores.placeholder }]}>
            {valor ? fechaCorta(valor) : "dd/mm/aaaa"}
          </Texto>
          <Ionicons name="calendar-outline" size={20} color={colores.textoSuave} />
        </Pressable>
      )}

      {error && (
        <View style={estilosCampo.filaError}>
          <Ionicons name="alert-circle" size={14} color={colores.error} />
          <Texto peso="media" style={estilosCampo.error}>
            {error}
          </Texto>
        </View>
      )}

      {/* en iOS el calendario se muestra dentro de un Modal */}
      <Modal visible={abiertoIos} transparent animationType="slide" onRequestClose={() => setAbiertoIos(false)}>
        <View style={estilos.fondoModal}>
          <View style={estilos.hoja}>
            <Texto peso="negrita" style={estilos.tituloHoja}>
              {etiqueta}
            </Texto>
            {Platform.OS === "ios" && (
              <DateTimePicker
                value={fecha}
                mode="date"
                display="inline"
                locale="es"
                accentColor={colores.naranja}
                onValueChange={(_evento, elegida) => alCambiar(aTextoFecha(elegida))}
              />
            )}
            <Boton titulo="Listo" alPresionar={() => setAbiertoIos(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  valor: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  fondoModal: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(17,17,17,0.4)",
  },
  hoja: {
    gap: 12,
    padding: 20,
    paddingBottom: 36,
    borderTopLeftRadius: radios.tarjeta,
    borderTopRightRadius: radios.tarjeta,
    backgroundColor: colores.blanco,
  },
  tituloHoja: {
    fontSize: 18,
  },
});
