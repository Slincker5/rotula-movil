# Firebase aplicado a React Native en el proyecto Rotula

Ariel Alexander Hernandez Merino (carné: HM192562)<br>
Gerson Vladimir Borja Alvarez (carné: BA251704)

Universidad Don Bosco<br>
Desarrollo de Software Multiplataforma<br>
Ing. Alexander Alberto Siguenza<br>
8 de noviembre de 2026

- Repositorio en GitHub: https://github.com/Slincker5/rotula-movil
- Video de demostración del Avance 2: **[pega aquí el enlace del video]**
- Documento de investigación: [docs/Avance2_Firebase_React_Native_APA.pdf](docs/Avance2_Firebase_React_Native_APA.pdf)
- Video del Avance 1: https://youtu.be/TfKT8T6o_Bg
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
11. [Base de datos en Firestore](#base-de-datos-en-firestore)
12. [Trabajo en equipo](#trabajo-en-equipo)

## Qué es Rotula móvil

[Rotula](https://rotula.vercel.app) es una aplicación web para que tiendas y negocios pequeños creen los rótulos
de sus ofertas y los descarguen en un PDF listo para imprimir. Rotula móvil es su versión para Android e iOS.

Desde el Avance 2 la app usa **Firebase**: Authentication para entrar con correo o con Google, y Firestore para
guardar los datos de cada usuario. La web ([Slincker5/rotula](https://github.com/Slincker5/rotula)) sigue con su
propia base MySQL, así que **las cuentas y los datos de la web y del celular ya no se comparten**.

Avance 2 de Desarrollo de Software Multiplataforma: autenticación con correo y Google, persistencia en Firestore por
usuario, módulos secundarios (Mis productos y edición de perfil) e historial de los documentos generados.

## Tecnologías

| Herramienta | Versión | Para qué se usa |
|---|---|---|
| Expo | SDK 57 | Proyecto, compilación y Expo Go |
| React Native | 0.86 | Interfaz nativa |
| React | 19.2 | Componentes y hooks |
| React Navigation | 7 | Stack de acceso (`native-stack`) y pestañas (`bottom-tabs`) |
| Firebase JS SDK | 13 | Authentication y Firestore |
| @react-native-google-signin/google-signin | 17 | Selector de cuentas de Google |
| @react-native-async-storage/async-storage | 2.2 | Mantener la sesión al cerrar la app |
| pdf-lib | 1.17 | Generar el PDF de rótulos en el celular |
| expo-dev-client | SDK 57 | Development build, necesario para entrar con Google |
| expo-file-system y expo-sharing | SDK 57 | Guardar el PDF en el celular y abrirlo o compartirlo |
| @react-native-community/datetimepicker | 9.1 | Calendario nativo para elegir fechas |
| @expo-google-fonts/figtree | 0.4 | Fuente Figtree, la misma de la web |
| @expo/vector-icons | 15 | Íconos Ionicons |

## Cómo correr la app

Requisitos: Node 20 o superior y un celular conectado a la misma red Wi-Fi que la PC.

```bash
git clone https://github.com/Slincker5/rotula-movil.git
cd rotula-movil
npm install
```

Copia `.env.example` como `.env.local` y llénalo con los datos del proyecto de Firebase
(Configuración del proyecto > Tus apps). Ese archivo no se sube al repositorio.

### Con Expo Go (todo menos Google)

```bash
npx expo start --go
```

Escanea el código QR con Expo Go (Android) o con la cámara (iPhone). Se usa `--go` porque, al tener
`expo-dev-client` instalado, Expo abriría por defecto el development build.

### Con development build (incluye Google, solo Android)

Google usa código nativo, así que no funciona en Expo Go.

1. Pon `google-services.json` en la raíz del proyecto (Firebase > Configuración del proyecto > app Android).
2. Crea el build con tu cuenta de Expo e instala el APK que genera:

   ```bash
   npx eas-cli build --profile development --platform android
   ```

3. Copia la huella SHA-1 del build en Firebase > Configuración del proyecto > app Android:

   ```bash
   npx eas-cli credentials --platform android
   ```

4. Vuelve a descargar `google-services.json` después de agregar la huella, crea el build otra vez y corre:

   ```bash
   npx expo start --dev-client
   ```

### Reglas de Firestore

Las reglas viven en `firestore.rules`. Si las cambias, publícalas en Firebase > Firestore > Reglas.

> **Versión de Expo:** el proyecto usa **Expo SDK 57** porque es la versión que soporta el Expo Go de las tiendas en
> octubre de 2026. Cuando salga el Expo Go para SDK 58, se actualiza con `npx expo install expo@^58.0.0` y luego
> `npx expo install --fix`.

## Estructura del código

```
App.js                          carga las fuentes y monta la sesión y la navegación
index.js                        punto de entrada de Expo
app.json                        nombre, íconos, identificadores y plugins de Expo
metro.config.js                 corrige cómo Metro carga tslib (sin esto la app no abre)
eas.json                        perfil del development build
firestore.rules                 reglas de seguridad de Firestore
firebase.json                   configuración de reglas y emuladores
src/
  firebase/
    config.js                   inicializa Firebase, Auth con sesión persistente y Firestore
    errores.js                  ErrorApp y traducción de errores de Firebase al español
    datos.js                    colección del usuario y conversión de fechas
    usuarios.js                 leer, crear y editar el perfil
    google.js                   selector de cuentas de Google
    rotulos.js                  rótulos, generar documentos e historial
    productos.js                catálogo Mis productos
  pdf/
    generarRotulos.js           arma el PDF: hojas, celdas y marcas de corte
    pintarRotulo.js             dibuja un rótulo
    plantilla.js                fondo del rótulo en base64
    compartirPdf.js             guarda el PDF y abre el menú de compartir
  contexto/
    Sesion.js                   ProveedorSesion y useSesion(): sesión de Firebase y perfil
  navegacion/
    Navegacion.js               stack de acceso + pestañas principales
  pantallas/
    Login.js                    iniciar sesión
    Registro.js                 crear cuenta
    Inicio.js                   resumen de ofertas y últimos PDF
    CrearAfiche.js              formulario del afiche, lista de rótulos y generar PDF
    Productos.js                catálogo: crear, listar, editar y borrar
    Historial.js                todos los PDF generados
    Perfil.js                   ver y editar la cuenta, cerrar sesión
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

### Firebase (`src/firebase/`)

`config.js` inicia Firebase con las variables de `.env.local` y configura la sesión con AsyncStorage para que siga
abierta al cerrar la app. Las pantallas no tocan Firestore directamente: usan las funciones de esta carpeta.

- `coleccionDelUsuario(nombre)` arma la ruta `usuarios/{uid}/{nombre}`, así cada cuenta solo trabaja con lo suyo.
- `conErrores(operacion)` atrapa cualquier error de Firebase y lo convierte en un `ErrorApp` con el mensaje en español
  y el `codigo` original.

Cada pantalla atrapa ese error y muestra su `mensaje` con el componente `AvisoError`.

### Generación del PDF (`src/pdf/` y `src/firebase/rotulos.js`)

El PDF se genera en el celular con `pdf-lib`, con el mismo diseño de la web. `generarDocumento()`:

1. Lee los rótulos pendientes (`documento_id == null`) y pinta el PDF. Si esto falla, no se registra nada.
2. Con una escritura en lote crea el documento y vincula sus rótulos: o se aplican todos los cambios, o ninguno.

El archivo no se guarda en Firestore. `abrirDocumento(id)` lo vuelve a pintar con los rótulos de ese documento, lo guarda en
la caché y abre el menú del sistema, desde donde se puede ver, imprimir o mandar por WhatsApp.

### Sesión (`src/contexto/Sesion.js`)

`ProveedorSesion` es un Context de React que comparte el usuario con todas las pantallas.
Cualquier pantalla lo usa con `useSesion()`, que devuelve:

| Valor | Qué es |
|---|---|
| `usuario` | Datos del usuario de la sesión, o `null` si no hay sesión |
| `revisando` | `true` mientras se revisa si hay una sesión guardada |
| `iniciarSesion(correo, clave)` | `signInWithEmailAndPassword` |
| `registrar(datos)` | `createUserWithEmailAndPassword`; el perfil se crea con los datos del formulario |
| `entrarConGoogle()` | Pide el ID token a Google y entra con `signInWithCredential`. Si el usuario cancela no hace nada |
| `actualizarPerfil(datos)` | Guarda nombre, apellido y negocio |
| `cerrarSesion()` | Cierra la sesión de Google y de Firebase |

`onAuthStateChanged` avisa cada vez que cambia la sesión, también al abrir la app si ya había una. En ese momento se
carga el perfil de `usuarios/{uid}`; si es la primera vez que entra, se crea.

### Navegación (`src/navegacion/Navegacion.js`)

```
NavigationContainer
└── Stack (createNativeStackNavigator)
    ├── sin sesión ── Login
    │                 Registro
    └── con sesión ── Principal (createBottomTabNavigator)
                          ├── Inicio
                          ├── Crear
                          ├── Productos
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

| Pantalla | Archivo | Qué hace | Datos |
|---|---|---|---|
| Login | `pantallas/Login.js` | Correo y contraseña, o Google. Valida antes de enviar y muestra los errores (credenciales incorrectas, sin internet). Link a Registro. | Firebase Authentication |
| Registro | `pantallas/Registro.js` | Nombre, apellido, negocio (opcional), correo, contraseña y confirmación, o Google. Al crear la cuenta entra directo a la app. | Authentication, `usuarios/{uid}` |
| Inicio | `pantallas/Inicio.js` | Saludo con el nombre del negocio (o del usuario si no tiene), fecha de hoy, rótulos usados en el mes (de 10 gratis), ofertas activas, ofertas que vencen en los próximos 7 días y los últimos 3 PDF. Se recarga al entrar a la pestaña y al deslizar hacia abajo. | `rotulos`, `documentos` |
| Crear | `pantallas/CrearAfiche.js` | Formulario del afiche con vista previa en vivo y opción de elegir un producto guardado. "Agregar a mi lista" guarda el rótulo y deja las fechas puestas para el siguiente. Muestra los rótulos pendientes (se pueden quitar) y genera el PDF con un diálogo de confirmar, generando y listo. | `rotulos`, `documentos`, `productos` |
| Productos | `pantallas/Productos.js` | Catálogo del negocio: agregar, listar, editar y borrar productos. | `productos` |
| Historial | `pantallas/Historial.js` | Lista con `FlatList` de todos los PDF generados; cada uno se vuelve a generar y se abre desde el celular. Se recarga al entrar a la pestaña. | `documentos`, `rotulos` |
| Perfil | `pantallas/Perfil.js` | Iniciales, nombre, negocio y correo. Permite editar nombre, apellido y negocio, y cerrar sesión con confirmación. | `usuarios/{uid}` |

## Componentes

Están en `src/componentes/` y todas las pantallas los reutilizan para que la app se vea igual en todas partes.

| Componente | Props principales | Para qué sirve |
|---|---|---|
| `Texto` | `peso` (`regular`, `media`, `semi`, `negrita`...) | `Text` con la fuente Figtree y el color de texto del tema |
| `Boton` | `titulo`, `alPresionar`, `variante`, `icono`, `cargando`, `deshabilitado`, `pequeno` | Botón en forma de píldora. Variantes: `primario` (negro), `acento` (naranja), `secundario` (borde) y `fantasma` (sin fondo). Con `cargando` muestra un indicador y no deja presionar dos veces |
| `Campo` | `etiqueta`, `error`, `ayuda`, `secreto` y las props de `TextInput` | Etiqueta, caja de texto y mensaje de error debajo. Con `secreto` oculta la contraseña y agrega el botón del ojo |
| `CampoFecha` | `etiqueta`, `valor`, `alCambiar`, `error` | Selector de fecha: calendario nativo en Android, calendario dentro de un `Modal` en iOS y texto a mano en la versión web. Trabaja con texto `AAAA-MM-DD`, el formato que se guarda en Firestore |
| `AvisoError` | `mensaje` | Caja roja con ícono para los errores del servidor. No muestra nada si no hay mensaje |
| `BotonGoogle` | `alError` | Separador "o" y botón para entrar con Google, usado en Login y Registro |
| `Logo` | `tamano` | Logo de Rotula en texto |
| `MarcoAcceso` | `titulo`, `subtitulo` | Marco de Login y Registro: logo, títulos, `SafeAreaView`, `KeyboardAvoidingView` para que el teclado no tape los campos y `ScrollView` |
| `PantallaCarga` | `texto` | Indicador de carga a pantalla completa |
| `VistaPreviaAfiche` | `descripcion`, `precioOferta`, `precioNormal`, `fechaInicio`, `fechaFin` | Dibuja cómo va a quedar el afiche mientras se llena el formulario |
| `TarjetaDocumento` | `documento` | Tarjeta de un PDF generado (título, cantidad de rótulos y hojas, fecha) con el botón para abrirlo |

## Validaciones

Todas están en `src/utilidades/validaciones.js`. Cada función recibe los datos del formulario y devuelve un objeto
`{ campo: "mensaje" }` con los errores encontrados; `hayErrores(errores)` dice si el objeto tiene algo.
Las pantallas muestran cada mensaje debajo de su campo y lo borran en cuanto el usuario vuelve a escribir.
Las reglas de `firestore.rules` vuelven a comprobar lo principal en el servidor.

| Función | Formulario | Reglas |
|---|---|---|
| `validarLogin` | Login | Correo obligatorio y con formato válido. Contraseña obligatoria. |
| `validarRegistro` | Registro | Nombre y apellido obligatorios, solo letras, de 2 a 60 caracteres. Negocio opcional, máximo 100. Correo válido, máximo 120. Contraseña de al menos 8 caracteres con letras y números. La confirmación debe coincidir. |
| `validarRotulo` | Crear afiche | Código de barras de 8 a 14 dígitos, solo números. Descripción obligatoria, mínimo 3 caracteres. Precios con formato `1.99` y mayores a 0. Copias enteras, al menos 1. Fecha de inicio obligatoria; fecha fin obligatoria e igual o posterior a la de inicio. |
| `validarProducto` | Productos | Código de barras opcional, de 8 a 14 dígitos. Descripción obligatoria, mínimo 3 caracteres. Precio con formato `2.50` y mayor a 0. |
| `validarPerfil` | Perfil | Nombre obligatorio, solo letras, de 2 a 60 caracteres. Apellido opcional con las mismas reglas. Negocio opcional, máximo 100. |

Además se muestran los errores que devuelve el servidor: credenciales incorrectas, correo ya registrado o falta de internet.

## Utilidades de fechas

`src/utilidades/fechas.js`:

| Función | Ejemplo |
|---|---|
| `aTextoFecha(fecha)` | `Date` → `"2026-10-18"` (formato que se guarda en Firestore) |
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

## Base de datos en Firestore

Todo lo de un usuario vive debajo de `usuarios/{uid}`:

| Ruta | Campos |
|---|---|
| `usuarios/{uid}` | `nombre`, `apellido`, `nombre_negocio`, `email`, `proveedor`, `fecha_registro` |
| `usuarios/{uid}/rotulos/{id}` | `ean`, `descripcion`, `precio_oferta`, `precio_unitario`, `copias`, `fecha_inicio`, `fecha_fin`, `documento_id`, `fecha_creacion` |
| `usuarios/{uid}/documentos/{id}` | `titulo`, `rotulos_por_hoja`, `total_rotulos`, `fecha_creacion` |
| `usuarios/{uid}/productos/{id}` | `ean`, `descripcion`, `precio`, `fecha_creacion` |

Un rótulo con `documento_id` en `null` está pendiente de imprimir. Las reglas de `firestore.rules` solo dejan acceder al
dueño de los datos, validan lo que se guarda e impiden cambiar o borrar un rótulo que ya salió en un PDF.

Antes del Avance 2, la app usaba la API REST de la web (`/api/login`, `/api/rotulos`, `/api/documentos`), que dejó de usarse.

## Trabajo en equipo

Cada integrante trabajó en su propia rama y la unió a `main` con un Pull Request.

| Integrante | Rama | Qué hizo |
|---|---|---|
| Gerson Vladimir Borja Alvarez | `feature/base-y-acceso` ([PR #1](https://github.com/Slincker5/rotula-movil/pull/1)) | Configuración del proyecto, tema y componentes base, conexión con la API y manejo de sesión, pantallas de login y registro con sus validaciones, pantalla de perfil y navegación |
| Ariel Alexander Hernandez Merino | `feature/afiches-e-historial` ([PR #2](https://github.com/Slincker5/rotula-movil/pull/2)) | Utilidades de fechas y campo de fecha, validaciones del afiche, descarga de PDF, pantalla para crear afiches con vista previa, historial, pantalla de inicio, pestañas del módulo principal y documento del avance |
| Ariel Alexander Hernandez Merino | `feature/firebase` | Avance 2: integración de Firebase Authentication y Firestore, generación del PDF en el celular, Mis productos, edición de perfil y documento de investigación |
