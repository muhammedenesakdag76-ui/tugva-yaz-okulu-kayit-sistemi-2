import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "BURAYA_API_KEY",
    authDomain: "BURAYA_AUTH_DOMAIN",
    projectId: "BURAYA_PROJECT_ID",
    storageBucket: "BURAYA_STORAGE_BUCKET",
    messagingSenderId: "BURAYA_MESSAGING_SENDER_ID",
    appId: "BURAYA_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export async function login(email, password) {

    return await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

}

export async function logout() {

    return await signOut(auth);

}

export function checkAuth(callback) {

    onAuthStateChanged(auth, callback);

}