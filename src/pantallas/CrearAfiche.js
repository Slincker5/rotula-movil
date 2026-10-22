import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { pedir } from "../api/cliente";
import { abrirPdf } from "../api/pdf";
import { colores, radios } from "../tema";
import { aTextoFecha } from "../utilidades/fechas";
import { hayErrores, validarRotulo } from "../utilidades/validaciones";
import Texto from "../componentes/Texto";
import Campo from "../componentes/Campo";
import CampoFecha from "../componentes/CampoFecha";
import Boton from "../componentes/Boton";
import AvisoError from "../componentes/AvisoError";
import VistaPreviaAfiche from "../componentes/VistaPreviaAfiche";

const formularioVacio = () => ({
  ean: "",
  descripcion: "",
  precioOferta: "",
  precioNormal: "",
  copias: "1",
  fechaInicio: aTextoFecha(new Date()),
  fechaFin: "",
});

// la API manda las fechas como "2026-10-18T00:00:00.000Z" (medianoche UTC); con new Date()
// en El Salvador (UTC-6) se mostraria el dia anterior, por eso se toma solo la parte de la fecha
const fechaMini = (valor) => {
  const [, mes, dia] = String(valor).slice(0, 10).split("-");
  return `${dia}/${mes}`;
};

export default function CrearAfiche({ navigation }) {
  const [form, setForm] = useState(formularioVacio);
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState("");
  const [mensajeOk, setMensajeOk] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [lista, setLista] = useState([]);
  // estado del dialogo para generar el PDF: null (cerrado), "confirmar", "generando" o el documento listo
  const [dialogo, setDialogo] = useState(null);

  // la lista son los rotulos que todavia no salieron en ningun PDF
  const cargarLista = async () => {
    try {
      const rotulos = await pedir("/api/rotulos");
      setLista(rotulos.filter((r) => r.documento_id == null));
    } catch (e) {
      setErrorServidor(e.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarLista();
    }, []),
  );

  const cambiar = (campo) => (valor) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }));
    setErrorServidor("");
    setMensajeOk("");
  };

  const agregar = async () => {
    const encontrados = validarRotulo(form);
    setErrores(encontrados);
    if (hayErrores(encontrados)) {
      setErrorServidor("Revisa los campos marcados en rojo.");
      return;
    }

    setGuardando(true);
    try {
      await pedir("/api/rotulos", {
        metodo: "POST",
        cuerpo: {
          ean: form.ean.trim(),
          descripcion: form.descripcion.trim(),
          precio_oferta: form.precioOferta.trim(),
          precio_unitario: form.precioNormal.trim(),
          copias: form.copias.trim(),
          fecha_inicio: form.fechaInicio,
          fecha_fin: form.fechaFin,
        },
      });
      const copias = Number(form.copias);
      setMensajeOk(`Listo, ${copias === 1 ? "se agregó 1 rótulo" : `se agregaron ${copias} rótulos`} a tu lista.`);
      // las fechas se mantienen porque casi siempre son las mismas para toda la semana
      setForm((actual) => ({ ...formularioVacio(), fechaInicio: actual.fechaInicio, fechaFin: actual.fechaFin }));
      await cargarLista();
    } catch (e) {
      setErrorServidor(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const quitar = (rotulo) => {
    Alert.alert("Quitar de la lista", `¿Quitar "${rotulo.descripcion}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Quitar",
        style: "destructive",
        onPress: async () => {
          try {
            await pedir(`/api/rotulos/${rotulo.id}`, { metodo: "DELETE" });
            await cargarLista();
          } catch (e) {
            Alert.alert("No se pudo quitar", e.message);
          }
        },
      },
    ]);
  };

  const generar = async () => {
    setDialogo("generando");
    try {
      const documento = await pedir("/api/rotulos/pdf", { metodo: "POST" });
      setDialogo(documento);
      setLista([]);
    } catch (e) {
      setDialogo(null);
      Alert.alert("No se pudo generar el PDF", e.message);
    }
  };

  const abrirDocumento = async () => {
    try {
      await abrirPdf(dialogo.url, `rotulos-${dialogo.uuid}.pdf`);
    } catch (e) {
      Alert.alert("No se pudo abrir el PDF", e.message);
    }
  };

  const totalCopias = lista.reduce((total, r) => total + Math.max(1, Number(r.copias) || 1), 0);

  return (
    <>
      <ScrollView
        style={estilos.pantalla}
        contentContainerStyle={estilos.contenido}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={estilos.encabezado}>
          <Texto peso="negrita" style={estilos.titulo}>
            Crear afiches
          </Texto>
          <Texto style={estilos.descripcion}>
            Agrega los productos en oferta a tu lista y genera un solo PDF listo para imprimir.
          </Texto>
        </View>

        <VistaPreviaAfiche {...form} />

        <View style={estilos.tarjeta}>
          <AvisoError mensaje={errorServidor} />
          {mensajeOk !== "" && (
            <View style={estilos.ok}>
              <Ionicons name="checkmark-circle" size={18} color={colores.texto} />
              <Texto peso="media" style={estilos.textoOk}>
                {mensajeOk}
              </Texto>
            </View>
          )}

          <Campo
            etiqueta="Código de barras"
            value={form.ean}
            onChangeText={cambiar("ean")}
            error={errores.ean}
            placeholder="7401005904011"
            keyboardType="number-pad"
            maxLength={14}
          />
          <Campo
            etiqueta="Descripción del producto"
            value={form.descripcion}
            onChangeText={cambiar("descripcion")}
            error={errores.descripcion}
            placeholder="Arroz blanco 5 lb"
            ayuda="Marca + variedad + contenido (g, kg, ml, L)"
            maxLength={80}
          />
          <View style={estilos.dosColumnas}>
            <Campo
              style={estilos.columna}
              etiqueta="Precio de oferta"
              value={form.precioOferta}
              onChangeText={cambiar("precioOferta")}
              error={errores.precioOferta}
              placeholder="1.99"
              keyboardType="decimal-pad"
            />
            <Campo
              style={estilos.columna}
              etiqueta="Precio normal"
              value={form.precioNormal}
              onChangeText={cambiar("precioNormal")}
              error={errores.precioNormal}
              placeholder="2.50"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={estilos.dosColumnas}>
            <CampoFecha
              style={estilos.columna}
              etiqueta="Fecha de inicio"
              valor={form.fechaInicio}
              alCambiar={cambiar("fechaInicio")}
              error={errores.fechaInicio}
            />
            <CampoFecha
              style={estilos.columna}
              etiqueta="Fecha fin"
              valor={form.fechaFin}
              alCambiar={cambiar("fechaFin")}
              error={errores.fechaFin}
            />
          </View>
          <Campo
            etiqueta="Copias"
            value={form.copias}
            onChangeText={cambiar("copias")}
            error={errores.copias}
            keyboardType="number-pad"
            maxLength={3}
          />

          <Boton titulo="Agregar a mi lista" icono="add-circle-outline" cargando={guardando} alPresionar={agregar} />
        </View>

        <View style={estilos.seccion}>
          <View style={estilos.filaTitulo}>
            <Texto peso="negrita" style={estilos.tituloSeccion}>
              Tu lista
            </Texto>
            <Texto peso="semi" style={estilos.contador}>
              {totalCopias} {totalCopias === 1 ? "rótulo" : "rótulos"}
            </Texto>
          </View>

          {lista.length === 0 ? (
            <Texto style={estilos.textoVacio}>Tu lista está vacía. Agrega un producto con el formulario de arriba.</Texto>
          ) : (
            lista.map((r) => (
              <View key={r.id} style={estilos.item}>
                <View style={estilos.miniatura}>
                  <Texto peso="extra" style={estilos.miniaturaPrecio}>
                    ${r.precio_oferta}
                  </Texto>
                </View>
                <View style={estilos.itemInfo}>
                  <Texto peso="semi" numberOfLines={1}>
                    {r.descripcion}
                  </Texto>
                  <Texto style={estilos.itemMeta}>
                    {r.copias} {Number(r.copias) === 1 ? "copia" : "copias"} · {fechaMini(r.fecha_inicio)} – {fechaMini(r.fecha_fin)}
                  </Texto>
                </View>
                <Pressable onPress={() => quitar(r)} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Quitar ${r.descripcion}`}>
                  <Ionicons name="trash-outline" size={20} color={colores.textoSuave} />
                </Pressable>
              </View>
            ))
          )}

          <Boton
            titulo={`Generar PDF (${totalCopias})`}
            icono="document-text-outline"
            variante="acento"
            deshabilitado={lista.length === 0}
            alPresionar={() => setDialogo("confirmar")}
          />
        </View>
      </ScrollView>

      <Modal visible={dialogo !== null} transparent animationType="fade" onRequestClose={() => setDialogo(null)}>
        <View style={estilos.fondoModal}>
          <View style={estilos.dialogo}>
            {dialogo === "confirmar" && (
              <>
                <Texto peso="negrita" style={estilos.tituloDialogo}>
                  Generar documento
                </Texto>
                <Texto style={estilos.textoDialogo}>
                  Se generará un PDF con {totalCopias} {totalCopias === 1 ? "rótulo" : "rótulos"} (4 por hoja), listo para imprimir.
                </Texto>
                <View style={estilos.botonesDialogo}>
                  <Boton titulo="Cancelar" variante="fantasma" alPresionar={() => setDialogo(null)} />
                  <Boton titulo="Generar PDF" variante="acento" alPresionar={generar} />
                </View>
              </>
            )}

            {dialogo === "generando" && (
              <View style={estilos.generando}>
                <ActivityIndicator size="large" color={colores.naranja} />
                <Texto style={estilos.textoDialogo}>Pintando tus rótulos ...</Texto>
              </View>
            )}

            {dialogo?.uuid && (
              <>
                <View style={estilos.check}>
                  <Ionicons name="checkmark" size={22} color={colores.blanco} />
                </View>
                <Texto peso="negrita" style={estilos.tituloDialogo}>
                  Documento listo
                </Texto>
                <Texto style={estilos.textoDialogo}>
                  {dialogo.titulo} · {dialogo.rotulos} rótulos en {dialogo.hojas} {dialogo.hojas === 1 ? "hoja" : "hojas"}. También
                  quedó guardado en tu historial.
                </Texto>
                <Boton titulo="Abrir PDF" icono="open-outline" variante="acento" alPresionar={abrirDocumento} />
                <Boton
                  titulo="Ver historial"
                  variante="secundario"
                  alPresionar={() => {
                    setDialogo(null);
                    navigation.navigate("Historial");
                  }}
                />
                <Boton titulo="Cerrar" variante="fantasma" alPresionar={() => setDialogo(null)} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    gap: 24,
    padding: 20,
    paddingBottom: 40,
  },
  encabezado: {
    gap: 8,
  },
  titulo: {
    fontSize: 32,
    letterSpacing: -0.7,
  },
  descripcion: {
    fontSize: 16,
    lineHeight: 23,
    color: "#333331",
  },
  tarjeta: {
    gap: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    backgroundColor: colores.blanco,
  },
  ok: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: radios.input,
    backgroundColor: colores.superficieGris,
  },
  textoOk: {
    flex: 1,
  },
  dosColumnas: {
    flexDirection: "row",
    gap: 12,
  },
  columna: {
    flex: 1,
  },
  seccion: {
    gap: 12,
  },
  filaTitulo: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  tituloSeccion: {
    fontSize: 21,
    letterSpacing: -0.4,
  },
  contador: {
    color: colores.textoSuave,
  },
  textoVacio: {
    color: colores.textoSuave,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.input,
    backgroundColor: colores.blanco,
  },
  miniatura: {
    width: 44,
    aspectRatio: 8.5 / 11,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.amarilloAfiche,
  },
  miniaturaPrecio: {
    fontSize: 10,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemMeta: {
    fontSize: 12.5,
    color: colores.textoSuave,
  },
  fondoModal: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(17,17,17,0.45)",
  },
  dialogo: {
    gap: 14,
    padding: 24,
    borderRadius: radios.tarjeta,
    backgroundColor: colores.blanco,
  },
  tituloDialogo: {
    fontSize: 22,
    letterSpacing: -0.4,
  },
  textoDialogo: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333331",
  },
  botonesDialogo: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  generando: {
    alignItems: "center",
    gap: 14,
    paddingVertical: 20,
  },
  check: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.texto,
  },
});
