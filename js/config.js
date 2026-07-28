import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

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

export const MAX_CAPACITY = 45;

export const REGISTER_PREFIX = "TYO";

export const REGISTRATION_COLLECTION = "registrations";

export const COUNTER_COLLECTION = "counters";

export const SETTINGS_COLLECTION = "settings";