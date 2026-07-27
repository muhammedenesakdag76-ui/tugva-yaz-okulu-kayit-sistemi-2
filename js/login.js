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
/* ==========================================
   GİRİŞ
========================================== */

async function login(e){

    e.preventDefault();

    loading(true);

    try{

        await signInWithEmailAndPassword(

            auth,

            email.value.trim(),

            password.value

        );

        toast("Giriş başarılı.",true);

        setTimeout(()=>{

            location.href="admin.html";

        },700);

    }

    catch(error){

        let message="Giriş yapılamadı.";

        switch(error.code){

            case "auth/invalid-credential":
            case "auth/wrong-password":
                message="E-posta veya şifre hatalı.";
                break;

            case "auth/user-not-found":
                message="Kullanıcı bulunamadı.";
                break;

            case "auth/invalid-email":
                message="Geçersiz e-posta adresi.";
                break;

            case "auth/too-many-requests":
                message="Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.";
                break;

            case "auth/network-request-failed":
                message="İnternet bağlantısı bulunamadı.";
                break;
        }

        toast(message,false);

    }

    finally{

        loading(false);

    }

}
/* ==========================================
   ENTER
========================================== */

document.addEventListener("keydown",e=>{

    if(e.key==="Enter"){

        form.requestSubmit();

    }

});
/* ==========================================
   RESET
========================================== */

window.addEventListener("pageshow",()=>{

    password.value="";

});