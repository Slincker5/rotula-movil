# React Native y Figma aplicados al proyecto Rotula

Ariel Alexander Hernandez Merino (carné: HM192562)<br>
Gerson Vladimir Borja Alvarez (carné: BA251704)

Universidad Don Bosco<br>
Desarrollo de Software Multiplataforma<br>
Ing. Alexander Alberto Siguenza<br>
18 de octubre de 2026

- Repositorio en GitHub: https://github.com/Slincker5/rotula-movil
- Video de demostración: https://youtu.be/TfKT8T6o_Bg
- Mockups en Figma: https://www.figma.com/design/TbgoZj5OUNLUFCJI2Mv3hF

---

## Contenido

1. [Qué es Rotula móvil](#qué-es-rotula-móvil)
2. [Tecnologías](#tecnologías)
3. [Cómo correr la app](#cómo-correr-la-app)
4. [Estructura del código](#estructura-del-código)
5. [Cómo funciona](#cómo-funciona)
6. [Pantallas](#pantallas)
7. [Componentes](#componentes)
8. [Validaciones](#validaciones)
9. [Utilidades de fechas](#utilidades-de-fechas)
10. [Tema y diseño](#tema-y-diseño)
11. [Endpoints de la API](#endpoints-de-la-api)
12. [Trabajo en equipo](#trabajo-en-equipo)

## Qué es Rotula móvil

[Rotula](https://rotula.vercel.app) es una aplicación web para que tiendas y negocios pequeños creen los rótulos
de sus ofertas y los descarguen en un PDF listo para imprimir. Rotula móvil es su versión para Android e iOS:
usa la misma API y la misma base de datos que la web ([Slincker5/rotula](https://github.com/Slincker5/rotula)),
así que una cuenta creada en la web sirve en el celular y al revés.

Avance 1 de Desarrollo de Software Multiplataforma: inicio de sesión y registro, módulo principal con navegación,
diseño basado en mockups de Figma y validaciones en todos los formularios.

## Tecnologías

| Herramienta | Versión | Para qué se usa |
|---|---|---|
| Expo | SDK 57 | Proyecto, compilación y Expo Go |
| React Native | 0.86 | Interfaz nativa |
| React | 19.2 | Componentes y hooks |
| React Navigation | 7 | Stack de acceso (`native-stack`) y pestañas (`bottom-tabs`) |
| expo-file-system y expo-sharing | SDK 57 | Guardar el PDF en el celular y abrirlo o compartirlo |
| @react-native-community/datetimepicker | 9.1 | Calendario nativo para elegir fechas |
| @expo-google-fonts/figtree | 0.4 | Fuente Figtree, la misma de la web |
| @expo/vector-icons | 15 | Íconos Ionicons |

## Cómo correr la app

Requisitos: Node 20 o superior y la app **Expo Go** en el celular, conectado a la misma red Wi-Fi que la PC.

```bash
git clone https://github.com/Slincker5/rotula-movil.git
cd rotula-movil
npm install
npx expo start
```

Escanea el código QR con Expo Go (Android) o con la cámara (iPhone).

Por defecto la app usa la API publicada en `https://rotula.vercel.app`. Para apuntar a otra, por ejemplo a la web
corriendo en tu PC, crea un archivo `.env.local`:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.50:3000
```

> **Versión de Expo:** el proyecto usa **Expo SDK 57** porque es la versión que soporta el Expo Go de las tiendas en
> octubre de 2026. Cuando salga el Expo Go para SDK 58, se actualiza con `npx expo install expo@^58.0.0` y luego
> `npx expo install --fix`.

## Estructura del código

```
App.js                          carga las fuentes y monta la sesión y la navegación
index.js                        punto de entrada de Expo
app.json                        nombre, íconos, identificadores y plugins de Expo
src/
  api/
    cliente.js                  pedir(): fetch a la API de Rotula con la cookie de sesión
    pdf.js                      abrirPdf(): descarga un PDF y lo abre con el menú de compartir
  contexto/
    Sesion.js                   ProveedorSesion y useSesion(): usuario, login, registro y cerrar sesión
  navegacion/
    Navegacion.js               stack de acceso + pestañas principales
  pantallas/
    Login.js                    iniciar sesión
    Registro.js                 crear cuenta
    Inicio.js                   resumen de ofertas y últimos PDF
    CrearAfiche.js              formulario del afiche, lista de rótulos y generar PDF
    Historial.js                todos los PDF generados
    Perfil.js                   datos de la cuenta y cerrar sesión
  componentes/                  piezas de interfaz reutilizables (ver tabla abajo)
  utilidades/
    validaciones.js             reglas de los formularios
    fechas.js                   conversión y formato de fechas
  tema.js                       colores, fuentes y radios de esquina
docs/                           documento del avance (Word y PDF) y figuras
assets/                         ícono y splash de la app
```

## Cómo funciona

### Arranque (`App.js`)

1. Carga las seis variantes de la fuente Figtree con `useFonts`. Mientras carga muestra `PantallaCarga`;
   si la fuente falla, la app sigue con la fuente del sistema.
2. Envuelve todo en `SafeAreaProvider` (márgenes de la muesca y la barra de gestos),
   luego en `ProveedorSesion` y dentro monta `Navegacion`.

### Conexión con la API (`src/api/cliente.js`)

Todas las pantallas hablan con la API a través de una sola función:

```js
pedir(ruta, { metodo = "GET", cuerpo })
```

- Arma la URL con `API_URL` (la de Vercel o la de `EXPO_PUBLIC_API_URL`).
- Si hay `cuerpo`, lo manda como JSON.
- Usa `credentials: "include"`: la API deja la sesión en la cookie `sesion` y React Native la guarda y la reenvía
  sola en cada petición, igual que el navegador. Por eso la app no guarda ningún token a mano.
- Si no hay internet lanza un `ErrorApi` con el mensaje "No hay conexión con el servidor".
- Si la respuesta no es 2xx, o trae `ok: false` (así responde `/api/login` cuando el correo no existe),
  lanza un `ErrorApi` con el mensaje de error que mandó el servidor y el código HTTP en `estado`.

Cada pantalla atrapa ese error y muestra su `mensaje` con el componente `AvisoError`.

### Descarga de PDF (`src/api/pdf.js`)

El PDF lo genera la API y pide la cookie de sesión, por eso no se puede abrir el link directo en el navegador.
`abrirPdf(ruta, nombre)`:

1. Lo descarga con `fetch` (que sí lleva la cookie).
2. Convierte el archivo a base64 con `FileReader`.
3. Lo guarda en la caché del celular con la clase `File` de `expo-file-system`.
4. Abre el menú del sistema con `Sharing.shareAsync`, desde donde se puede ver, imprimir o mandar por WhatsApp.

### Sesión (`src/contexto/Sesion.js`)

`ProveedorSesion` es un Context de React que comparte el usuario con todas las pantallas.
Cualquier pantalla lo usa con `useSesion()`, que devuelve:

| Valor | Qué es |
|---|---|
| `usuario` | Datos del usuario de la sesión, o `null` si no hay sesión |
| `revisando` | `true` mientras se revisa si hay una sesión guardada |
| `iniciarSesion(correo, clave)` | `POST /api/login` y luego carga el usuario |
| `registrar(datos)` | `POST /api/registro` y luego inicia sesión con los mismos datos (la API de registro no abre sesión) |
| `cerrarSesion()` | `POST /api/logout` y deja `usuario` en `null` |

Al abrir la app se consulta `/api/usuario`: si la cookie de una sesión anterior sigue válida (dura 7 días),
se entra directo sin volver a escribir la contraseña.

### Navegación (`src/navegacion/Navegacion.js`)

```
NavigationContainer
└── Stack (createNativeStackNavigator)
    ├── sin sesión ── Login
    │                 Registro
    └── con sesión ── Principal (createBottomTabNavigator)
                          ├── Inicio
                          ├── Crear
                          ├── Historial
                          └── Perfil
```

- La pantalla que se muestra depende de `usuario`: sin sesión, el stack solo tiene **Login** y **Registro**;
  con sesión, solo tiene las **pestañas**. Como las pantallas de acceso dejan de existir, el botón atrás
  no puede regresar al login después de entrar.
- Al iniciar o cerrar sesión no se navega a mano: cambia `usuario` en el contexto y React Navigation
  cambia de pantallas solo.
- Mientras `revisando` es `true` se muestra "Revisando tu sesión...".
- Cada pestaña tiene su ícono de Ionicons, relleno cuando está activa y de contorno cuando no,
  y el encabezado muestra el logo de Rotula.

## Pantallas

| Pantalla | Archivo | Qué hace | API |
|---|---|---|---|
| Login | `pantallas/Login.js` | Correo y contraseña. Valida antes de enviar y muestra los errores del servidor (credenciales incorrectas, sin internet). Link a Registro. | `POST /api/login` |
| Registro | `pantallas/Registro.js` | Nombre, apellido, negocio (opcional), correo, contraseña y confirmación. Al crear la cuenta entra directo a la app. | `POST /api/registro` |
| Inicio | `pantallas/Inicio.js` | Saludo con el nombre del negocio (o del usuario si no tiene), fecha de hoy, rótulos usados en el mes (de 10 gratis), ofertas activas, ofertas que vencen en los próximos 7 días y los últimos 3 PDF. Se recarga al entrar a la pestaña y al deslizar hacia abajo. | `GET /api/rotulos`, `GET /api/documentos` |
| Crear | `pantallas/CrearAfiche.js` | Formulario del afiche con vista previa en vivo. "Agregar a la lista" guarda el rótulo y deja las fechas puestas para el siguiente. Muestra los rótulos pendientes (se pueden quitar) y genera el PDF con un diálogo de confirmar, generando y listo. | `GET` y `POST /api/rotulos`, `DELETE /api/rotulos/:id`, `POST /api/rotulos/pdf` |
| Historial | `pantallas/Historial.js` | Lista con `FlatList` de todos los PDF generados; cada uno se descarga y se abre desde el celular. Se recarga al entrar a la pestaña. | `GET /api/documentos`, `GET /api/documentos/:uuid/pdf` |
| Perfil | `pantallas/Perfil.js` | Iniciales, nombre, negocio y correo de la cuenta. Botón para abrir Rotula en la web y botón para cerrar sesión con confirmación. | `POST /api/logout` |

Detalle de `CrearAfiche`: la API devuelve las fechas como `2026-10-18T00:00:00.000Z` (medianoche UTC).
Con `new Date()` en El Salvador (UTC-6) se mostraría el día anterior, por eso la función `fechaMini`
toma solo la parte de la fecha del texto.

## Componentes

Están en `src/componentes/` y todas las pantallas los reutilizan para que la app se vea igual en todas partes.

| Componente | Props principales | Para qué sirve |
|---|---|---|
| `Texto` | `peso` (`regular`, `media`, `semi`, `negrita`...) | `Text` con la fuente Figtree y el color de texto del tema |
| `Boton` | `titulo`, `alPresionar`, `variante`, `icono`, `cargando`, `deshabilitado`, `pequeno` | Botón en forma de píldora. Variantes: `primario` (negro), `acento` (naranja), `secundario` (borde) y `fantasma` (sin fondo). Con `cargando` muestra un indicador y no deja presionar dos veces |
| `Campo` | `etiqueta`, `error`, `ayuda`, `secreto` y las props de `TextInput` | Etiqueta, caja de texto y mensaje de error debajo. Con `secreto` oculta la contraseña y agrega el botón del ojo |
| `CampoFecha` | `etiqueta`, `valor`, `alCambiar`, `error` | Selector de fecha: calendario nativo en Android, calendario dentro de un `Modal` en iOS y texto a mano en la versión web. Trabaja con texto `AAAA-MM-DD`, el formato de la API |
| `AvisoError` | `mensaje` | Caja roja con ícono para los errores del servidor. No muestra nada si no hay mensaje |
| `Logo` | `tamano` | Logo de Rotula en texto |
| `MarcoAcceso` | `titulo`, `subtitulo` | Marco de Login y Registro: logo, títulos, `SafeAreaView`, `KeyboardAvoidingView` para que el teclado no tape los campos y `ScrollView` |
| `PantallaCarga` | `texto` | Indicador de carga a pantalla completa |
| `VistaPreviaAfiche` | `descripcion`, `precioOferta`, `precioNormal`, `fechaInicio`, `fechaFin` | Dibuja cómo va a quedar el afiche mientras se llena el formulario |
| `TarjetaDocumento` | `documento` | Tarjeta de un PDF generado (título, cantidad de rótulos y hojas, fecha) con el botón para abrirlo |

## Validaciones

Todas están en `src/utilidades/validaciones.js`. Cada función recibe los datos del formulario y devuelve un objeto
`{ campo: "mensaje" }` con los errores encontrados; `hayErrores(errores)` dice si el objeto tiene algo.
Las pantallas muestran cada mensaje debajo de su campo y lo borran en cuanto el usuario vuelve a escribir.
Las reglas son las mismas que valida la API, para avisar antes de enviar.

| Función | Formulario | Reglas |
|---|---|---|
| `validarLogin` | Login | Correo obligatorio y con formato válido. Contraseña obligatoria. |
| `validarRegistro` | Registro | Nombre y apellido obligatorios, solo letras, de 2 a 60 caracteres. Negocio opcional, máximo 100. Correo válido, máximo 120. Contraseña de al menos 8 caracteres con letras y números. La confirmación debe coincidir. |
| `validarRotulo` | Crear afiche | Código de barras de 8 a 14 dígitos, solo números. Descripción obligatoria, mínimo 3 caracteres. Precios con formato `1.99` y mayores a 0. Copias enteras, al menos 1. Fecha de inicio obligatoria; fecha fin obligatoria e igual o posterior a la de inicio. |

Además se muestran los errores que devuelve el servidor: credenciales incorrectas, correo ya registrado o falta de internet.

## Utilidades de fechas

`src/utilidades/fechas.js`:

| Función | Ejemplo |
|---|---|
| `aTextoFecha(fecha)` | `Date` → `"2026-10-18"` (formato que recibe la API) |
| `deTextoFecha(texto)` | `"2026-10-18"` → `Date` en hora local |
| `fechaCorta(texto)` | `"2026-10-18"` → `"18/10/2026"` |
| `fechaLarga(valor)` | → `"18 oct 2026"` |
| `hoyLargo()` | → `"Domingo, 18 de octubre"` |

## Tema y diseño

Los mockups y el prototipo navegable están en [Figma](https://www.figma.com/design/TbgoZj5OUNLUFCJI2Mv3hF):
8 pantallas, componentes y variables de color. En el código, el diseño vive en `src/tema.js`, con los mismos valores
de la web (`app/estilos.css` de Rotula):

- **`colores`**: fondo blanco, superficies grises (`#F7F7F5`, `#F2F2F0`), texto `#111111`,
  naranja de acento `#E2502A`, rojo de error `#A5361A` y amarillo del afiche `#F2C94C`.
- **`fuentes`**: Figtree de 400 a 900. En React Native cada peso es una familia distinta, por eso hay una por peso.
- **`radios`**: 12 px en campos, 16 px en tarjetas y 999 px en botones (forma de píldora).

## Endpoints de la API

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

## Trabajo en equipo

Cada integrante trabajó en su propia rama y la unió a `main` con un Pull Request.

| Integrante | Rama | Qué hizo |
|---|---|---|
| Gerson Vladimir Borja Alvarez | `feature/base-y-acceso` ([PR #1](https://github.com/Slincker5/rotula-movil/pull/1)) | Configuración del proyecto, tema y componentes base, conexión con la API y manejo de sesión, pantallas de login y registro con sus validaciones, pantalla de perfil y navegación |
| Ariel Alexander Hernandez Merino | `feature/afiches-e-historial` ([PR #2](https://github.com/Slincker5/rotula-movil/pull/2)) | Utilidades de fechas y campo de fecha, validaciones del afiche, descarga de PDF, pantalla para crear afiches con vista previa, historial, pantalla de inicio, pestañas del módulo principal y documento del avance |
