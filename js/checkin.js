// checkin.js
// Profesyonel Sürüm
// Parça 1/8

import{

authListener,

getRegistration,

checkIn,

checkOut,

getStatistics

}

from "./firebase.js";

const result=

document.getElementById(

"result"

);

let scanner;

authListener(user=>{

if(!user){

location.href=

"login.html";

}

});
// checkin.js
// Parça 2/8

function showResult(

title,

color

){

result.innerHTML=`

<div class="card">

<h2 style="color:${color}">

${title}

</h2>

</div>

`;

}
// checkin.js
// Parça 3/8

async function processQR(code){

const participant=

await getRegistration(code);

if(!participant){

showResult(

"Kayıt Bulunamadı",

"#dc2626"

);

return;

}

if(participant.checkedIn){

await checkOut(code);

showResult(

participant.adSoyad+

"<br>Çıkış Yapıldı",

"#2563eb"

);

return;

}

await checkIn(code);

showResult(

participant.adSoyad+

"<br>Giriş Yapıldı",

"#16a34a"

);

updateStats();

}
// checkin.js
// Parça 4/8

async function updateStats(){

const stats=

await getStatistics();

document.getElementById(

"todayCount"

).textContent=

stats.checkedIn;

}
// checkin.js
// Parça 5/8

scanner=

new Html5QrcodeScanner(

"reader",

{

fps:10,

qrbox:260,

rememberLastUsedCamera:true

},

false

);

scanner.render(

processQR,

()=>{}

);
// checkin.js
// Parça 6/8

manualButton.onclick=

()=>{

const value=

manualCode.value.trim();

if(value===""){

return;

}

processQR(

value

);

};
// checkin.js
// Parça 7/8

manualCode.addEventListener(

"keydown",

e=>{

if(e.key==="Enter"){

processQR(

manualCode.value.trim()

);

}

});
// checkin.js
// Parça 8/8 (Son)

updateStats();