import { auth } from "./config.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const form = document.getElementById("loginForm");

const email = document.getElementById("email");
const password = document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const togglePassword =
    document.getElementById("togglePassword");

/* ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);

function init(){

    form.addEventListener(
        "submit",
        login
    );

    togglePassword.addEventListener(
        "click",
        changePasswordVisibility
    );

    checkLogin();

}
function changePasswordVisibility(){

    if(password.type==="password"){

        password.type="text";

        togglePassword.innerHTML="🙈";

    }

    else{

        password.type="password";

        togglePassword.innerHTML="👁";

    }

}
function checkLogin(){

    onAuthStateChanged(auth,user=>{

        if(user){

            location.href="admin.html";

        }

    });

}
function loading(status){

    loginButton.disabled=status;

    if(status){

        loginButton.dataset.old=
            loginButton.innerHTML;

        loginButton.innerHTML=`
        <span class="spinner-border spinner-border-sm"></span>
        Giriş Yapılıyor...
        `;

    }

    else{

        loginButton.innerHTML=
            loginButton.dataset.old;

    }

}
function toast(message,success=true){

    const toast=document.getElementById("toast");

    toast.className=
    `toast text-bg-${success?"success":"danger"} border-0 show`;

    toast.querySelector(".toast-body")
    .textContent=message;

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}