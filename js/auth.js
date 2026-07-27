import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA1PwF_MonQVMQ2zXnCJZbQWYkRgHpxxb8",
  authDomain: "tugva-kayit-sistemi.firebaseapp.com",
  projectId: "tugva-kayit-sistemi",
  storageBucket: "tugva-kayit-sistemi.firebasestorage.app",
  messagingSenderId: "497137562254",
  appId: "1:497137562254:web:0dae95a054ac7e21424fdf"
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