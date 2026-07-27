import { initializeApp } from "firebase/app";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore using the specific databaseId from config if present
const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || "(default)");

enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code == "failed-precondition") {
    console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
  } else if (err.code == "unimplemented") {
    console.warn("The current browser does not support all of the features required to enable persistence");
  }
});

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider, signInWithPopup, signOut };
