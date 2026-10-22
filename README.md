# Rotula móvil

Versión móvil de [Rotula](https://rotula.vercel.app): afiches de ofertas en minutos para tiendas y negocios pequeños.
La app está hecha con **React Native + Expo** y usa la misma API y la misma base de datos que la versión web
([Slincker5/rotula](https://github.com/Slincker5/rotula)), así que una cuenta creada en la web sirve en el celular y al revés.

Avance 1 — Desarrollo de Software Multiplataforma.

## Pantallas

| Pantalla | Qué hace |
|---|---|
| **Login** | Inicia sesión con correo y contraseña contra `/api/login`. |
| **Registro** | Crea la cuenta en `/api/registro` y entra directo a la app. |
| **Inicio** (pestaña) | Saludo, ofertas activas, ofertas que vencen esta semana y últimos PDF generados. |
| **Crear** (pestaña) | Formulario del afiche con vista previa en vivo, lista de rótulos pendientes y botón para generar el PDF. |
| **Historial** (pestaña) | Todos los PDF generados (`FlatList`); cada uno se descarga y se abre o comparte desde el celular. |
| **Perfil** (pestaña) | Datos de la cuenta y cerrar sesión. |

## Navegación

React Navigation, como se vio en clase:

- `NavigationContainer` con un **stack** (`createNativeStackNavigator`).
- Sin sesión, el stack solo tiene **Login** y **Registro**.
- Con sesión, el stack cambia a las **pestañas** (`createBottomTabNavigator`): Inicio, Crear, Historial y Perfil. Así no se puede regresar al login con el botón atrás.
- Al abrir la app se consulta `/api/usuario`: si la sesión anterior sigue válida (dura 7 días) se entra directo.

## Validaciones

Todas están en `src/utilidades/validaciones.js`. Los errores se muestran debajo de cada campo y se borran al corregirlo.

| Formulario | Reglas |
|---|---|
| Login | Correo obligatorio y con formato válido; contraseña obligatoria. |
| Registro | Nombre y apellido obligatorios, solo letras, de 2 a 60 caracteres. Negocio opcional, máximo 100. Correo válido, máximo 120. Contraseña de al menos 8 caracteres con letras y números. La confirmación debe coincidir. |
| Afiche | Código de barras de 8 a 14 dígitos. Descripción obligatoria. Precios con formato `1.99` y mayores a 0. Copias enteras, al menos 1. Fecha fin igual o posterior a la de inicio. |

También se muestran los errores que devuelve el servidor: credenciales incorrectas, correo ya registrado o falta de internet.

## Diseño

Mockups y prototipo navegable en Figma: [Rotula móvil · Mockups Avance 1](https://www.figma.com/design/TbgoZj5OUNLUFCJI2Mv3hF). Tiene las 8 pantallas, los componentes y las variables de color.

Sigue los colores y la tipografía de la web (`app/estilos.css` de Rotula), definidos en `src/tema.js`:

- Fuente **Figtree** (`@expo-google-fonts/figtree`).
- Blanco y grises neutros (`#F7F7F5`, `#E6E6E3`), texto `#111111`.
- Naranja de acento `#E2502A`.
- Botones en forma de píldora y esquinas redondeadas de 12 a 16 px.

## Cómo correrla

Requisitos: Node 20 o superior y la app **Expo Go** en el celular, conectado a la misma red Wi-Fi que la PC.

```bash
npm install
npx expo start
```

Escanea el código QR con Expo Go (Android) o con la cámara (iPhone).

> **Versión de Expo:** el proyecto usa **Expo SDK 57** (React Native 0.86) porque es la versión que soporta el Expo Go de las tiendas en octubre de 2026. Expo anunció que el Expo Go para SDK 58 llegará a las tiendas en unas semanas y que solo soportará SDK 58. Cuando eso pase, actualiza con `npx expo install expo@^58.0.0` y luego `npx expo install --fix`.

Para apuntar a otra API, por ejemplo a la web corriendo en tu PC, crea un archivo `.env.local`:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.50:3000
```

## Estructura

```
App.js                     fuentes, proveedor de sesión y navegación
src/
  api/cliente.js           fetch a la API de Rotula (la cookie de sesión viaja sola)
  api/pdf.js               descarga el PDF y lo abre con el menú de compartir
  contexto/Sesion.js       usuario, iniciarSesion, registrar, cerrarSesion
  navegacion/Navegacion.js stack de acceso + pestañas principales
  pantallas/               Login, Registro, Inicio, CrearAfiche, Historial, Perfil
  componentes/             Campo, CampoFecha, Boton, AvisoError, VistaPreviaAfiche...
  utilidades/              validaciones y fechas
  tema.js                  colores, fuentes y radios
```

## Endpoints que usa

| Método | Ruta | Uso |
|---|---|---|
| POST | `/api/login` | Iniciar sesión (deja la cookie `sesion`) |
| POST | `/api/registro` | Crear cuenta |
| POST | `/api/logout` | Cerrar sesión |
| GET | `/api/usuario` | Datos del usuario de la sesión |
| GET / POST | `/api/rotulos` | Listar / agregar rótulos |
| DELETE | `/api/rotulos/:id` | Quitar un rótulo de la lista |
| POST | `/api/rotulos/pdf` | Generar el PDF con los rótulos pendientes |
| GET | `/api/documentos` | Historial de PDF |
| GET | `/api/documentos/:uuid/pdf` | Descargar un PDF |
