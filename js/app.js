// app.js
// Profesyonel Sürüm
// Parça 1/10

import{

createRegistration,

generateRegisterNumber,

getRemainingCapacity,

registrationExists,

phoneExists,

isFull

}

from "./firebase.js";

import{

validateForm,

onlyNumber

}

from "./validation.js";

import{

generateQR

}

from "./qr.js";

import{

downloadPDF

}

from "./pdf.js";

const form=

document.getElementById(

"registerForm"

);

const formSection=

document.getElementById(

"formSection"

);

const successCard=

document.getElementById(

"successCard"

);

const registerNumber=

document.getElementById(

"registerNumber"

);

const remainingCapacity=

document.getElementById(

"remainingCapacity"

);

const downloadPdf=

document.getElementById(

"downloadPdf"

);

const newRegister=

document.getElementById(

"newRegister"

);

let currentParticipant=null;
// app.js
// Parça 2/10

async function updateCapacity(){

const remaining=

await getRemainingCapacity();

remainingCapacity.textContent=

remaining;

}

function getFormData(){

return{

kayitNo:"",

adSoyad:

adSoyad.value.trim(),

tc:

tc.value.trim(),

telefon:

telefon.value.trim(),

email:

email.value.trim(),

dogumTarihi:

dogumTarihi.value,

cinsiyet:

cinsiyet.value,

okul:

okul.value.trim(),

sinif:

sinif.value.trim(),

veliAdi:

veliAdi.value.trim(),

veliTelefon:

veliTelefon.value.trim(),

adres:

adres.value.trim(),

not:

note.value.trim()

};

}
// app.js
// Parça 3/10

async function register(){

if(await isFull()){

alert(

"Kontenjan dolmuştur."

);

return;

}

const data=

getFormData();

const error=

validateForm(

data

);

if(error){

alert(error);

return;

}

if(await registrationExists(data.tc)){

alert(

"Bu TC ile kayıt bulunmaktadır."

);

return;

}

if(await phoneExists(data.telefon)){

alert(

"Bu telefon ile kayıt bulunmaktadır."

);

return;

}
// app.js
// Parça 4/10

data.kayitNo=

await generateRegisterNumber();

await createRegistration(

data

);

currentParticipant=data;

showSuccess();

}
// app.js
// Parça 5/10

function showSuccess(){

formSection.style.display="none";

successCard.style.display="block";

registerNumber.textContent=

currentParticipant.kayitNo;

generateQR(

currentParticipant.kayitNo

);

updateCapacity();

}
// app.js
// Parça 6/10

downloadPdf.onclick=

()=>{

downloadPDF(

currentParticipant

);

};

newRegister.onclick=

()=>{

location.reload();

};
// app.js
// Parça 7/10

form.addEventListener(

"submit",

async e=>{

e.preventDefault();

await register();

}

);
// app.js
// Parça 8/10

[

tc,

telefon,

veliTelefon

]

.forEach(input=>{

input.addEventListener(

"keydown",

onlyNumber

);

});
// app.js
// Parça 9/10

function capitalize(input){

input.value=

input.value

.toLowerCase()

.replace(

/(^|\s)\S/g,

l=>l.toUpperCase()

);

}

[

adSoyad,

veliAdi

]

.forEach(input=>{

input.addEventListener(

"blur",

()=>capitalize(input)

);

});
// app.js
// Parça 10/10 (Son)

window.addEventListener(

"DOMContentLoaded",

()=>{

updateCapacity();

});