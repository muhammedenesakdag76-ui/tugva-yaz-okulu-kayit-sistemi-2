import { auth } from "./firebase.js";

import {

signInWithEmailAndPassword

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const form=document.getElementById("loginForm");

form.addEventListener("submit",async(e)=>{

e.preventDefault();

const email=document.getElementById("email").value.trim();

const password=document.getElementById("password").value;

try{

await signInWithEmailAndPassword(

auth,

email,

password

);

window.location.href="admin.html";

}catch(error){

let mesaj="Giriş başarısız.";

switch(error.code){

case"auth/invalid-email":

mesaj="Geçersiz e-posta adresi.";

break;

case"auth/user-not-found":

mesaj="Kullanıcı bulunamadı.";

break;

case"auth/wrong-password":

mesaj="Şifre hatalı.";

break;

case"auth/invalid-credential":

mesaj="E-posta veya şifre hatalı.";

break;

case"auth/too-many-requests":

mesaj="Çok fazla başarısız deneme yapıldı.";

break;

default:

mesaj=error.message;

}

alert(mesaj);

}

});