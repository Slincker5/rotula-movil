import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

// Los datos del proyecto salen de .env.local (ver .env.example)
const configuracion = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const primeraCarga = getApps().length === 0;
const app = primeraCarga ? initializeApp(configuracion) : getApp();

// initializeAuth solo se puede llamar una vez; al recargar en desarrollo se reutiliza con getAuth.
// En el celular la sesion se guarda con AsyncStorage para que siga abierta al cerrar la app.
export const auth =
  primeraCarga && Platform.OS !== "web"
    ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
    : getAuth(app);

export const db = getFirestore(app);

// Para probar sin tocar el proyecto real: EXPO_PUBLIC_FIREBASE_EMULADOR=127.0.0.1
const emulador = process.env.EXPO_PUBLIC_FIREBASE_EMULADOR;
if (emulador && primeraCarga) {
  connectAuthEmulator(auth, `http://${emulador}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, emulador, 8080);
}
