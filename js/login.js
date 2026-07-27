// login.js
// Profesyonel Sürüm
// Parça 1/4

import {

login,

authListener

}

from "./firebase.js";

const form=

document.getElementById(

"loginForm"

);

const email=

document.getElementById(

"email"

);

const password=

document.getElementById(

"password"

);

authListener(user=>{

if(user){

location.href=

"admin.html";

}

});
// login.js
// Parça 2/4

form.addEventListener(

"submit",

async e=>{

e.preventDefault();

try{

await login(

email.value.trim(),

password.value

);

location.href=

"admin.html";

}

catch{

showError(

"E-Posta veya şifre hatalı."

);

}

}

);
// login.js
// Parça 3/4

function showError(message){

let box=

document.getElementById(

"loginError"

);

if(!box){

box=

document.createElement(

"div"

);

box.id="loginError";

box.className="login-error";

form.prepend(box);

}

box.textContent=

message;

}
// login.js
// Parça 4/4 (Son)

password.addEventListener(

"keydown",

e=>{

if(e.key==="Enter"){

form.requestSubmit();

}

});