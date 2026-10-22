import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSesion } from "../contexto/Sesion";
import { pedir } from "../api/cliente";
import { colores, radios } from "../tema";
import { hoyLargo } from "../utilidades/fechas";
import Texto from "../componentes/Texto";
import Boton from "../componentes/Boton";
import AvisoError from "../componentes/AvisoError";
import PantallaCarga from "../componentes/PantallaCarga";
import TarjetaDocumento from "../componentes/TarjetaDocumento";

const LIMITE_MENSUAL = 10;
const DIA = 24 * 60 * 60 * 1000;

export default function Inicio({ navigation }) {
  const { usuario } = useSesion();
  const [rotulos, setRotulos] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState("");

  const cargar = async () => {
    try {
      const [listaRotulos, listaDocumentos] = await Promise.all([pedir("/api/rotulos"), pedir("/api/documentos")]);
      setRotulos(listaRotulos);
      setDocumentos(listaDocumentos);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  // vuelve a pedir los datos cada vez que se entra a la pestana (por si se genero un PDF)
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, []),
  );

  if (cargando) return <PantallaCarga texto="Preparando tu inicio ..." />;

  // mismos calculos que la pagina de inicio de la web
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const activas = rotulos.filter((r) => new Date(r.fecha_fin) >= hoy);
  const porVencer = activas.filter((r) => new Date(r.fecha_fin).getTime() < hoy.getTime() + 7 * DIA);
  const usadosEsteMes = rotulos.filter((r) => {
    const creado = new Date(r.fecha_creacion);
    return creado.getMonth() === hoy.getMonth() && creado.getFullYear() === hoy.getFullYear();
  }).length;
  const saludo = usuario?.nombre_negocio || usuario?.nombre;
  const ultimos = documentos.slice(0, 3);

  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      refreshControl={
        <RefreshControl
          refreshing={refrescando}
          onRefresh={() => {
            setRefrescando(true);
            cargar();
          }}
          tintColor={colores.naranja}
          colors={[colores.naranja]}
        />
      }
    >
      <AvisoError mensaje={error} />

      <View style={estilos.saludo}>
        <Texto peso="semi" style={estilos.fecha}>
          {hoyLargo()}
        </Texto>
        <Texto peso="negrita" style={estilos.hola}>
          {saludo ? `Hola, ${saludo}.` : "Hola."}
        </Texto>
        <Texto style={estilos.resumen}>
          Has usado {usadosEsteMes} de {LIMITE_MENSUAL} rótulos gratis este mes. ¿Qué vendemos hoy?
        </Texto>
      </View>

      <View style={estilos.acciones}>
        <Boton titulo="Crear afiches" icono="add-circle-outline" alPresionar={() => navigation.navigate("CrearAfiche")} />
        <Boton titulo="Ver historial" icono="time-outline" variante="fantasma" alPresionar={() => navigation.navigate("Historial")} />
      </View>

      <View style={estilos.estadisticas}>
        <View style={estilos.tarjetaDato}>
          <Ionicons name="pricetag-outline" size={24} color={colores.texto} />
          <Texto peso="extra" style={estilos.numero}>
            {activas.length}
          </Texto>
          <Texto peso="semi" style={estilos.etiquetaDato}>
            ofertas activas
          </Texto>
        </View>
        <View style={estilos.tarjetaDato}>
          <Ionicons name="hourglass-outline" size={24} color={colores.naranjaOscuro} />
          <Texto peso="extra" style={[estilos.numero, { color: colores.naranjaOscuro }]}>
            {porVencer.length}
          </Texto>
          <Texto peso="semi" style={estilos.etiquetaDato}>
            vencen esta semana
          </Texto>
        </View>
      </View>

      <View style={estilos.seccion}>
        <Texto peso="negrita" style={estilos.tituloSeccion}>
          Últimos documentos generados
        </Texto>
        {ultimos.length === 0 ? (
          <View style={estilos.vacio}>
            <Ionicons name="file-tray-outline" size={32} color={colores.textoSuave} />
            <Texto style={estilos.textoVacio}>
              Aún no has generado ningún PDF. Crea tus primeros afiches y aparecerán aquí.
            </Texto>
          </View>
        ) : (
          ultimos.map((d) => <TarjetaDocumento key={d.id} documento={d} />)
        )}
      </View>
    </ScrollView>
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
  saludo: {
    gap: 8,
  },
  fecha: {
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colores.textoSuave,
  },
  hola: {
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  resumen: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333331",
  },
  acciones: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  estadisticas: {
    flexDirection: "row",
    gap: 12,
  },
  tarjetaDato: {
    flex: 1,
    gap: 6,
    padding: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.tarjeta,
    backgroundColor: colores.blanco,
  },
  numero: {
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1,
  },
  etiquetaDato: {
    fontSize: 13.5,
    color: colores.textoSuave,
  },
  seccion: {
    gap: 12,
  },
  tituloSeccion: {
    fontSize: 21,
    letterSpacing: -0.4,
  },
  vacio: {
    alignItems: "center",
    gap: 8,
    padding: 28,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colores.bordeInput,
    borderRadius: radios.tarjeta,
  },
  textoVacio: {
    textAlign: "center",
    color: colores.textoSuave,
  },
});
