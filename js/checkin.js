import {
    auth,
    kayitNoIleBul,
    checkinYap,
    checkinIptal
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const resultCard = document.getElementById("resultCard");

const name = document.getElementById("name");
const registerNo = document.getElementById("registerNo");
const phone = document.getElementById("phone");
const status = document.getElementById("status");

const checkBtn = document.getElementById("checkBtn");
const cancelBtn = document.getElementById("cancelBtn");
const backBtn = document.getElementById("backBtn");

let scanner = null;
let currentRecord = null;

let cameras = [];
let currentCamera = 0;

onAuthStateChanged(auth, user => {

    if (!user) {

        window.location.href = "login.html";

    }

});

async function stopScanner(){

    if(!scanner) return;

    try{

        if(scanner.isScanning){

            await scanner.stop();

        }

    }catch{}

    try{

        await scanner.clear();

    }catch{}

}

async function qrOkundu(qrText){

    await stopScanner();

    const kayit = await kayitNoIleBul(qrText);

    if(!kayit){

        alert("Kayıt bulunamadı.");

        setTimeout(kameraBaslat,700);

        return;

    }

    currentRecord = kayit;

    resultCard.style.display="block";

    name.textContent = kayit.adSoyad;

    registerNo.textContent = kayit.kayitNo;

    phone.textContent = kayit.telefon;

    if(kayit.checkin){

        status.textContent="✅ Check-in Yapıldı";

        status.style.color="#198754";

        checkBtn.style.display="none";

        cancelBtn.style.display="block";

    }else{

        status.textContent="⏳ Bekliyor";

        status.style.color="#fd7e14";

        checkBtn.style.display="block";

        cancelBtn.style.display="none";

    }

}

async function kameraBaslat(){

    resultCard.style.display="none";

    await stopScanner();

    scanner=new Html5Qrcode("reader");

    cameras=await Html5Qrcode.getCameras();

    if(!cameras.length){

        alert("Kamera bulunamadı.");

        return;

    }

    let backIndex=cameras.findIndex(cam=>

        /back|rear|environment|arka/i.test(cam.label)

    );

    if(backIndex!=-1){

        currentCamera=backIndex;

    }

    await scanner.start(

        cameras[currentCamera].id,

        {

            fps:10,

            qrbox:{

                width:260,

                height:260

            }

        },

        decoded=>{

            qrOkundu(decoded);

        },

        ()=>{}

    );

}
checkBtn.addEventListener("click",async()=>{

    if(!currentRecord) return;

    try{

        await checkinYap(currentRecord.id);

        alert("Check-in başarılı.");

        currentRecord=null;

        setTimeout(kameraBaslat,700);

    }catch(e){

        console.error(e);

        alert("İşlem başarısız.");

    }

});

cancelBtn.addEventListener("click",async()=>{

    if(!currentRecord) return;

    try{

        await checkinIptal(currentRecord.id);

        alert("Check-in iptal edildi.");

        currentRecord=null;

        setTimeout(kameraBaslat,700);

    }catch(e){

        console.error(e);

        alert("İşlem başarısız.");

    }

});

backBtn.addEventListener("click",()=>{

    window.location.href="admin.html";

});

/* Kamera değiştirme */
async function kameraDegistir(){

    if(cameras.length<2){

        alert("Başka kamera bulunamadı.");

        return;

    }

    currentCamera++;

    if(currentCamera>=cameras.length){

        currentCamera=0;

    }

    await kameraBaslat();

}

/* Eğer HTML'de
<button id="switchCamera">📷 Kamera Değiştir</button>
eklersen otomatik çalışır */

const switchBtn=document.getElementById("switchCamera");

if(switchBtn){

    switchBtn.addEventListener("click",kameraDegistir);

}

window.addEventListener("load",()=>{

    kameraBaslat();

});

window.addEventListener("beforeunload",async()=>{

    await stopScanner();

});

document.addEventListener("visibilitychange",async()=>{

    if(document.hidden){

        await stopScanner();

    }else{

        setTimeout(kameraBaslat,500);

    }

});