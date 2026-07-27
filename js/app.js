// app.js
// Düzeltme Paketi
// Parça 1/8

import{
createRegistration,
generateRegisterNumber,
getRemainingCapacity,
registrationExists,
phoneExists,
isFull
}from"./firebase.js";

import{
validateForm,
onlyNumber
}from"./validation.js";

import{
generateQR
}from"./qr.js";

import{
downloadPDF
}from"./pdf.js";

const form=document.getElementById("registerForm");

const formSection=document.getElementById("formSection");

const successCard=document.getElementById("successCard");

const registerNumber=document.getElementById("registerNumber");

const remainingCapacity=document.getElementById("remainingCapacity");

const downloadPdf=document.getElementById("downloadPdf");

const newRegister=document.getElementById("newRegister");

/* ======== Eksik olan tüm inputlar ======== */

const adSoyad=document.getElementById("adSoyad");

const tc=document.getElementById("tc");

const telefon=document.getElementById("telefon");

const email=document.getElementById("email");

const dogumTarihi=document.getElementById("dogumTarihi");

const cinsiyet=document.getElementById("cinsiyet");

const okul=document.getElementById("okul");

const sinif=document.getElementById("sinif");

const veliAdi=document.getElementById("veliAdi");

const veliTelefon=document.getElementById("veliTelefon");

const adres=document.getElementById("adres");

const note=document.getElementById("note");

let currentParticipant=null;
// app.js
// Düzeltme Paketi
// Parça 2/8

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

function clearForm(){

form.reset();

}
// app.js
// Düzeltme Paketi
// Parça 3/8

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

validateForm(data);

if(error){

alert(error);

return;

}

if(await registrationExists(data.tc)){

alert(

"Bu TC Kimlik Numarası ile kayıt bulunmaktadır."

);

return;

}

if(await phoneExists(data.telefon)){

alert(

"Bu telefon numarası ile kayıt bulunmaktadır."

);

return;

}

data.kayitNo=

await generateRegisterNumber();

await createRegistration(data);

currentParticipant=data;

showSuccess();

}
// app.js
// Düzeltme Paketi
// Parça 4/8

function showSuccess(){

formSection.style.display=

"none";

successCard.style.display=

"block";

registerNumber.textContent=

currentParticipant.kayitNo;

generateQR(

currentParticipant.kayitNo

);

updateCapacity();

}
// app.js
// Düzeltme Paketi
// Parça 5/8

downloadPdf.addEventListener(

"click",

()=>{

if(!currentParticipant){

return;

}

downloadPDF(

currentParticipant

);

}

);

newRegister.addEventListener(

"click",

()=>{

clearForm();

successCard.style.display=

"none";

formSection.style.display=

"block";

updateCapacity();

currentParticipant=null;

}
);
// app.js
// Düzeltme Paketi
// Parça 6/8

form.addEventListener(

"submit",

async e=>{

e.preventDefault();

await register();

}

);

[

tc,

telefon,

veliTelefon

].forEach(input=>{

input.addEventListener(

"keydown",

onlyNumber

);

});
// app.js
// Düzeltme Paketi
// Parça 7/8

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

].forEach(input=>{

input.addEventListener(

"blur",

()=>capitalize(input)

);

});
// app.js
// Düzeltme Paketi
// Parça 8/8 (Son)

window.addEventListener(

"DOMContentLoaded",

()=>{

updateCapacity();

form.reset();

successCard.style.display=

"none";

formSection.style.display=

"block";

}
);