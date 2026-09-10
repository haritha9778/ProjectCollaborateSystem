import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBs-C9UD3TERn0C1IqSyd1NHdhpPj4x8sU",
  authDomain: "project-collaborate-system.firebaseapp.com",
  projectId: "project-collaborate-system",
  storageBucket: "project-collaborate-system.firebasestorage.app",
  messagingSenderId: "416954317097",
  appId: "1:416954317097:web:eff80f493240039a165f38"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;