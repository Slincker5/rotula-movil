import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { borrarProducto, crearProducto, editarProducto, listarProductos } from "../firebase/productos";
import { colores, radios } from "../tema";
import { hayErrores, validarProducto } from "../utilidades/validaciones";
import Texto from "../componentes/Texto";
import Campo from "../componentes/Campo";
import Boton from "../componentes/Boton";
import AvisoError from "../componentes/AvisoError";
import PantallaCarga from "../componentes/PantallaCarga";

const vacio = { ean: "", descripcion: "", precio: "" };

// Catalogo del negocio: lo que se guarda aqui se elige despues al crear un afiche
export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editando, setEditando] = useState(null);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    try {
      setProductos(await listarProductos());
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, []),
  );

  const cambiar = (campo) => (valor) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }));
    setError("");
  };

  const limpiar = () => {
    setForm(vacio);
    setEditando(null);
    setErrores({});
    setError("");
  };

  const guardar = async () => {
    const encontrados = validarProducto(form);
    setErrores(encontrados);
    if (hayErrores(encontrados)) return;

    setGuardando(true);
    try {
      if (editando) await editarProducto(editando, form);
      else await crearProducto(form);
      limpiar();
      await cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const editar = (producto) => {
    setForm({ ean: producto.ean, descripcion: producto.descripcion, precio: producto.precio.toFixed(2) });
    setEditando(producto.id);
    setErrores({});
    setError("");
  };

  const borrar = (producto) => {
    Alert.alert("Borrar producto", `¿Borrar "${producto.descripcion}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          try {
            await borrarProducto(producto.id);
            if (editando === producto.id) limpiar();
            await cargar();
          } catch (e) {
            Alert.alert("No se pudo borrar", e.message);
          }
        },
      },
    ]);
  };

  if (cargando) return <PantallaCarga texto="Buscando tus productos ..." />;

  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <View style={estilos.encabezado}>
        <Texto peso="negrita" style={estilos.titulo}>
          Mis productos
        </Texto>
        <Texto style={estilos.descripcion}>
          Guarda lo que más vendes y úsalo para llenar tus afiches en segundos.
        </Texto>
      </View>

      <View style={estilos.tarjeta}>
        <AvisoError mensaje={error} />
        <Campo
          etiqueta="Código de barras"
          value={form.ean}
          onChangeText={cambiar("ean")}
          error={errores.ean}
          ayuda="Opcional."
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
          maxLength={80}
        />
        <Campo
          etiqueta="Precio normal"
          value={form.precio}
          onChangeText={cambiar("precio")}
          error={errores.precio}
          placeholder="2.50"
          keyboardType="decimal-pad"
        />
        <Boton
          titulo={editando ? "Guardar cambios" : "Agregar producto"}
          icono={editando ? "save-outline" : "add-circle-outline"}
          cargando={guardando}
          alPresionar={guardar}
        />
        {editando && <Boton titulo="Cancelar" variante="fantasma" alPresionar={limpiar} />}
      </View>

      <View style={estilos.seccion}>
        <Texto peso="negrita" style={estilos.tituloSeccion}>
          Tu catálogo
        </Texto>
        {productos.length === 0 ? (
          <View style={estilos.vacio}>
            <Ionicons name="cube-outline" size={32} color={colores.textoSuave} />
            <Texto style={estilos.textoVacio}>Todavía no tienes productos guardados.</Texto>
          </View>
        ) : (
          productos.map((p) => (
            <View key={p.id} style={estilos.item}>
              <View style={estilos.itemInfo}>
                <Texto peso="semi" numberOfLines={1}>
                  {p.descripcion}
                </Texto>
                <Texto style={estilos.itemMeta}>
                  ${p.precio.toFixed(2)}
                  {p.ean ? ` · ${p.ean}` : ""}
                </Texto>
              </View>
              <Pressable onPress={() => editar(p)} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Editar ${p.descripcion}`}>
                <Ionicons name="create-outline" size={20} color={colores.textoSuave} />
              </Pressable>
              <Pressable onPress={() => borrar(p)} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Borrar ${p.descripcion}`}>
                <Ionicons name="trash-outline" size={20} color={colores.textoSuave} />
              </Pressable>
            </View>
          ))
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
  seccion: {
    gap: 12,
  },
  tituloSeccion: {
    fontSize: 21,
    letterSpacing: -0.4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.input,
    backgroundColor: colores.blanco,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemMeta: {
    fontSize: 12.5,
    color: colores.textoSuave,
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
