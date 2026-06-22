import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBK6lNaSJA3u0YEymfUfxEOGJ43zscd5UE",
  authDomain: "mersal-c1a05.firebaseapp.com",
  projectId: "mersal-c1a05",
  storageBucket: "mersal-c1a05.firebasestorage.app",
  messagingSenderId: "179790586423",
  appId: "1:179790586423:web:774d9ecc4915b5c0c855b2",
  measurementId: "G-G044KGLFQE",
};

const app = initializeApp(firebaseConfig);

export const messaging = (async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
})();

export default app;
