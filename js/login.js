import {
    login,
    authListener
} from "./firebase.js";

const form = document.getElementById("loginForm");

authListener(user => {

    if (user) {

        location.href = "admin.html";

    }

});

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    try {

        await login(email, password);

        location.href = "admin.html";

    } catch (err) {

        alert("E-Posta veya şifre hatalı.");

    }

});