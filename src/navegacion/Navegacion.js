import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSesion } from "../contexto/Sesion";
import { colores, fuentes } from "../tema";
import Logo from "../componentes/Logo";
import PantallaCarga from "../componentes/PantallaCarga";
import Login from "../pantallas/Login";
import Registro from "../pantallas/Registro";
import Inicio from "../pantallas/Inicio";
import CrearAfiche from "../pantallas/CrearAfiche";
import Historial from "../pantallas/Historial";
import Perfil from "../pantallas/Perfil";

const Pila = createNativeStackNavigator();
const Pestanas = createBottomTabNavigator();

const tema = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colores.naranja, background: colores.fondo, card: colores.fondo, text: colores.texto, border: colores.borde },
};

// icono de cada pestana: relleno cuando esta activa y de contorno cuando no
const iconos = {
  Inicio: "home",
  CrearAfiche: "add-circle",
  Historial: "time",
  Perfil: "person-circle",
};

function PestanasPrincipales() {
  return (
    <Pestanas.Navigator
      screenOptions={({ route }) => ({
        headerTitle: () => <Logo />,
        headerTitleAlign: "left",
        tabBarActiveTintColor: colores.texto,
        tabBarInactiveTintColor: colores.textoTenue,
        tabBarLabelStyle: { fontFamily: fuentes.semi, fontSize: 12 },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? iconos[route.name] : `${iconos[route.name]}-outline`} size={size} color={color} />
        ),
      })}
    >
      <Pestanas.Screen name="Inicio" component={Inicio} />
      <Pestanas.Screen name="CrearAfiche" component={CrearAfiche} options={{ title: "Crear" }} />
      <Pestanas.Screen name="Historial" component={Historial} />
      <Pestanas.Screen name="Perfil" component={Perfil} />
    </Pestanas.Navigator>
  );
}

// Flujo de autenticacion: sin sesion solo existen Login y Registro;
// al iniciar sesion la pila cambia a las pestanas y no se puede volver atras al login.
export default function Navegacion() {
  const { usuario, revisando } = useSesion();

  if (revisando) return <PantallaCarga texto="Revisando tu sesión ..." />;

  return (
    <NavigationContainer theme={tema}>
      <Pila.Navigator screenOptions={{ headerShown: false }}>
        {usuario ? (
          <Pila.Screen name="Principal" component={PestanasPrincipales} />
        ) : (
          <>
            <Pila.Screen name="Login" component={Login} />
            <Pila.Screen name="Registro" component={Registro} />
          </>
        )}
      </Pila.Navigator>
    </NavigationContainer>
  );
}
