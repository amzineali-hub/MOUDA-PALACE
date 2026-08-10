import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  // We can just use the web client to update. But actually it's fine, we don't need to change DB unless the user wants to.
  // We can just tell them. Wait, they said "ne toucher à rien d'autre". So changing just the options in the app is what they wanted!
};
