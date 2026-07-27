// checkin.js Düzeltme Paketi
// Parça 1/8

import{
authListener,
getRegistration,
checkIn,
getStatistics
}from"./firebase.js";

const reader=document.getElementById("reader");

const result=document.getElementById("result");

const todayCount=document.getElementById("todayCount");

const remainingCount=document.getElementById("remainingCount");

const manualCode=document.getElementById("manualCode");

const manualButton=document.getElementById("manualButton");

let scanner=null;

let lastCode="";
// checkin.js Düzeltme Paketi
// Parça 2/8

authListener(user=>{

if(!user){

location.href="login.html";

return;

}

});

async function updateStats(){

const stats=

await getStatistics();

todayCount.textContent=

stats.checked;

remainingCount.textContent=

stats.remaining;

}
// checkin.js Düzeltme Paketi
// Parça 3/8

function showResult(type,text){

result.className="";

result.classList.add(type);

result.innerHTML=text;

}
// checkin.js Düzeltme Paketi
// Parça 4/8

async function processQR(code){

if(code===lastCode){

return;

}

lastCode=code;

setTimeout(()=>{

lastCode="";

},2000);

const participant=

await getRegistration(code);

if(!participant){

showResult(

"error",

"Kayıt bulunamadı."

);

return;

}

if(participant.checkedIn){

showResult(

"warning",

`${participant.adSoyad}<br>Daha önce giriş yapmış.`

);

return;

}

await checkIn(participant.id);

showResult(

"success",

`${participant.adSoyad}<br>Giriş yapıldı.`

);

updateStats();

}
// checkin.js Düzeltme Paketi
// Parça 5/8

function startScanner(){

scanner=new Html5Qrcode("reader");

scanner.start(

{

facingMode:{

exact:"environment"

}

},

{

fps:10,

qrbox:250

},

decodedText=>{

processQR(decodedText);

},

()=>{}

).catch(()=>{

showResult(

"error",

"Arka kamera açılamadı."

);

});

}
// checkin.js Düzeltme Paketi
// Parça 6/8

manualButton.addEventListener(

"click",

async()=>{

const code=

manualCode.value

.trim()

.toUpperCase();

if(!code){

manualCode.focus();

return;

}

await processQR(code);

manualCode.value="";

manualCode.focus();

}

);

manualCode.addEventListener(

"keydown",

e=>{

if(e.key==="Enter"){

manualButton.click();

}

}
);
// checkin.js Düzeltme Paketi
// Parça 7/8

window.addEventListener(

"DOMContentLoaded",

()=>{

updateStats();

startScanner();

manualCode.focus();

}

);

window.addEventListener(

"beforeunload",

async()=>{

if(scanner){

try{

await scanner.stop();

await scanner.clear();

}catch(e){}

}

}
);
// checkin.js Düzeltme Paketi
// Parça 8/8 (Son)

document.addEventListener(

"visibilitychange",

()=>{

if(document.hidden){

return;

}

updateStats();

}
);