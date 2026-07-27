import {
    authListener,
    getRegistration,
    checkIn
} from "./firebase.js";

const result =
document.getElementById("result");

authListener(user=>{

if(!user){

location.href="login.html";

}

});

function success(message,color="#16a34a"){

result.innerHTML=`

<div class="card">

<h2 style="color:${color};">

${message}

</h2>

</div>

`;

}
async function onScanSuccess(code){

const participant=

await getRegistration(code);

if(!participant){

success(

"Kayıt bulunamadı.",

"#dc2626"

);

return;

}

if(participant.checkedIn){

success(

participant.adSoyad+

"<br><br>Bu kişi zaten giriş yaptı.",

"#f59e0b"

);

return;

}

await checkIn(code);

success(

participant.adSoyad+

"<br><br>Giriş başarılı."

);

}
const scanner =

new Html5QrcodeScanner(

"reader",

{

fps:10,

qrbox:250

},

false

);

scanner.render(

onScanSuccess,

()=>{}

);