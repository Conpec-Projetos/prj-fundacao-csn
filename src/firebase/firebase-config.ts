// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

const firebaseConfig = {

  apiKey: "AIzaSyAmQqcKIprPHhfE_OiexJ-LIGXQMLhQpXE",

  authDomain: "csn-fbs.firebaseapp.com",

  projectId: "csn-fbs",

  storageBucket: "csn-fbs.firebasestorage.app",

  messagingSenderId: "586643662858",

  appId: "1:586643662858:web:20dcf1f5d9be6f60a757f3"

};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };