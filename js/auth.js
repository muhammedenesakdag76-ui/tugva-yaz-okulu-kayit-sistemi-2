import { auth } from "./config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

/* ==========================================
   OTURUM KONTROLÜ
========================================== */

export function requireAuth(){

    onAuthStateChanged(auth, user => {

        if(!user){

            location.replace("login.html");

            return;
        }

        document.body.style.visibility = "visible";

    });

}
/* ==========================================
   AKTİF KULLANICI
========================================== */

export function getCurrentUser(){

    return auth.currentUser;

}
/* ==========================================
   LOGOUT
========================================== */

export async function logout(){

    try{

        await signOut(auth);

        location.replace("login.html");

    }

    catch(error){

        console.error(error);

        alert("Çıkış yapılırken hata oluştu.");

    }

}
/* ==========================================
   USER INFO
========================================== */

export function userEmail(){

    if(!auth.currentUser){

        return "";

    }

    return auth.currentUser.email;

}
/* ==========================================
   OTURUM TAKİBİ
========================================== */

export function watchAuth(callback){

    return onAuthStateChanged(auth, user => {

        if(user){

            callback(user);

        }else{

            location.replace("login.html");

        }

    });

}
/* ==========================================
   KULLANICI BİLGİSİ
========================================== */

export function fillUserInfo(){

    const emailElement =
        document.getElementById("userEmail");

    if(emailElement && auth.currentUser){

        emailElement.textContent =
            auth.currentUser.email;

    }

}
/* ==========================================
   INIT
========================================== */

export function initAdminAuth(){

    requireAuth();

    window.addEventListener("pageshow", () => {

        if(!auth.currentUser){

            location.replace("login.html");

        }

    });

}
/* ==========================================
   LOGOUT BUTTON
========================================== */

export function bindLogoutButton(buttonId = "logout"){

    const button = document.getElementById(buttonId);

    if(!button) return;

    button.addEventListener("click", async () => {

        const confirmLogout = confirm(
            "Oturumu kapatmak istediğinize emin misiniz?"
        );

        if(!confirmLogout) return;

        await logout();

    });

}