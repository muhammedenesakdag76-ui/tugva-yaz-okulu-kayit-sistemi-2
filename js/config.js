import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA1PwF_MonQVMQ2zXnCJZbQWYkRgHpxxb8",
    authDomain: "tugva-kayit-sistemi.firebaseapp.com",
    projectId: "tugva-kayit-sistemi",
    storageBucket: "tugva-kayit-sistemi.firebasestorage.app",
    messagingSenderId: "497137562254",
    appId: "1:497137562254:web:0dae95a054ac7e21424fdf"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const MAX_CAPACITY = 45;