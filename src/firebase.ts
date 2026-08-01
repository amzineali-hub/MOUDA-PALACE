import { initializeApp } from "firebase/app";
import { getFirestore, enableMultiTabIndexedDbPersistence, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore using the specific databaseId from config if present
const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || "(default)");

try {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
    } else if (err.code === "unimplemented") {
      console.warn("The current browser does not support all of the features required to enable persistence");
    }
  });
} catch (e) {
  console.warn("Could not enable persistence", e);
}



const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const storage = getStorage(app);
export { app, db, auth, storage, googleProvider, signInWithPopup, signOut };
