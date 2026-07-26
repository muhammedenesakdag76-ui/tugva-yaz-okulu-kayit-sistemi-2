import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const error = document.getElementById("error");

onAuthStateChanged(auth, (user) => {

    if (user) {

        window.location.href = "admin.html";

    }

});

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    error.style.display = "none";

    const button = form.querySelector("button");

    button.disabled = true;

    button.textContent = "Giriş Yapılıyor...";

    try {

        await signInWithEmailAndPassword(

            auth,
            email.value.trim(),
            password.value

        );

        localStorage.setItem(

            "adminLoginTime",

            Date.now()

        );

        window.location.href = "admin.html";

    } catch (err) {

        let mesaj = "Giriş başarısız.";

        switch (err.code) {

            case "auth/invalid-credential":
            case "auth/wrong-password":
            case "auth/user-not-found":
            case "auth/invalid-email":

                mesaj = "E-posta veya şifre hatalı.";
                break;

            case "auth/too-many-requests":

                mesaj = "Çok fazla başarısız deneme yapıldı. Lütfen daha sonra tekrar deneyin.";
                break;

            case "auth/network-request-failed":

                mesaj = "İnternet bağlantınızı kontrol edin.";
                break;

        }

        error.textContent = mesaj;
        error.style.display = "block";

    } finally {

        button.disabled = false;
        button.textContent = "Giriş Yap";

    }

});

const loginTime = Number(localStorage.getItem("adminLoginTime"));

if (loginTime) {

    const gecenSure = Date.now() - loginTime;

    const onIkiSaat = 12 * 60 * 60 * 1000;

    if (gecenSure > onIkiSaat) {

        auth.signOut();

        localStorage.removeItem("adminLoginTime");

    }

}