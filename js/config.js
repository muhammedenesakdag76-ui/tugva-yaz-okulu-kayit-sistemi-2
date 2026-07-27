import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {

    apiKey: "API_KEY",

    authDomain: "PROJECT.firebaseapp.com",

    projectId: "PROJECT_ID",

    storageBucket: "PROJECT.appspot.com",

    messagingSenderId: "XXXXXXXX",

    appId: "APP_ID"

};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);