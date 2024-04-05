import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAymbWHb07x6Bg7y8gbO78b4IbvVR96pqg",
  authDomain: "swe35-c8e59.firebaseapp.com",
  projectId: "swe35-c8e59",
  storageBucket: "swe35-c8e59.appspot.com",
  messagingSenderId: "273459700532",
  appId: "1:273459700532:web:b4ce94b6dc0df49e2f3b61"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);

const firestore = getFirestore(app);

export { app, auth, firestore };