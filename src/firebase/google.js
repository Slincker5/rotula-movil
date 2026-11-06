import { Platform } from "react-native";
import { ErrorApp } from "./errores";

// El modulo de Google es nativo: existe en el development build, pero no en Expo Go.
// Por eso se carga aqui adentro, para que el resto de la app siga funcionando en Expo Go.
function moduloGoogle() {
  if (Platform.OS === "web") return null;
  try {
    return require("@react-native-google-signin/google-signin");
  } catch {
    return null;
  }
}

// Abre el selector de cuentas y devuelve el idToken, o null si el usuario cancela
export async function pedirTokenGoogle() {
  const modulo = moduloGoogle();
  if (!modulo) {
    throw new ErrorApp("Google no está disponible en Expo Go. Abre la app con el development build.", "google/no-disponible");
  }

  const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } = modulo;
  GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const respuesta = await GoogleSignin.signIn();
    if (!isSuccessResponse(respuesta)) return null;
    return respuesta.data.idToken;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new ErrorApp("Este dispositivo no tiene Google Play Services.", "google/sin-play-services");
    }
    console.warn("[google]", error?.code ?? error);
    throw new ErrorApp("No se pudo entrar con Google. Intenta de nuevo.", "google/error");
  }
}

export async function cerrarSesionGoogle() {
  try {
    await moduloGoogle()?.GoogleSignin.signOut();
  } catch {
    // si entro con correo no hay sesion de Google que cerrar
  }
}
