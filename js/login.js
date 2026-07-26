import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const form = document.getElementById("loginForm");
const submitButton = form.querySelector("button[type='submit']");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    if (email === "" || password === "") {

        alert("E-posta ve şifre gereklidir.");
        return;

    }

    submitButton.disabled = true;
    submitButton.textContent = "Giriş Yapılıyor...";

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        sessionStorage.setItem("admin", "true");
        localStorage.setItem("adminLoginTime", Date.now().toString());

        window.location.replace("admin.html");

    } catch (error) {

        let mesaj = "Giriş başarısız.";

        switch (error.code) {

            case "auth/invalid-email":
                mesaj = "Geçersiz e-posta adresi.";
                break;

            case "auth/user-not-found":
            case "auth/invalid-credential":
                mesaj = "E-posta veya şifre hatalı.";
                break;

            case "auth/wrong-password":
                mesaj = "Şifre hatalı.";
                break;

            case "auth/too-many-requests":
                mesaj = "Çok fazla başarısız giriş denemesi yapıldı. Lütfen daha sonra tekrar deneyin.";
                break;

            case "auth/network-request-failed":
                mesaj = "İnternet bağlantınızı kontrol edin.";
                break;

            default:
                console.error(error);
                mesaj = "Beklenmeyen bir hata oluştu.";

        }

        alert(mesaj);

    } finally {

        submitButton.disabled = false;
        submitButton.textContent = "Giriş Yap";

    }

});