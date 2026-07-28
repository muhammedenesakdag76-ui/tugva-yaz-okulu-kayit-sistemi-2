// Firebase Ayarları

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

export const firebaseConfig = {

    apiKey: "",

    authDomain: "",

    projectId: "",

    storageBucket: "",

    messagingSenderId: "",

    appId: ""

};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

// Sistemin maksimum kapasitesi

export const MAX_CAPACITY = 45;

// Kayıt numarası ön eki

export const REGISTER_PREFIX = "TYO";

// Firestore koleksiyonları

export const COLLECTIONS = {

    registrations: "registrations",

    counters: "counters"

};