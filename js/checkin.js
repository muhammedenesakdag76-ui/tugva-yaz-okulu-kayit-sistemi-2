import {
    kayitNoIleBul,
    checkinYap
} from "./firebase.js";

let aktifKayit = null;

const resultCard = document.getElementById("resultCard");

const rKayitNo = document.getElementById("rKayitNo");
const rAd = document.getElementById("rAd");
const rTelefon = document.getElementById("rTelefon");
const rDurum = document.getElementById("rDurum");

const manualSearch = document.getElementById("manualSearch");
const manualCode = document.getElementById("manualCode");
const checkinButton = document.getElementById("checkinButton");

function goster(kayit){

    aktifKayit = kayit;

    resultCard.classList.remove("hidden");

    rKayitNo.textContent = kayit.kayitNo;
    rAd.textContent = kayit.adSoyad;
    rTelefon.textContent = kayit.telefon;

    if(kayit.checkin){

        rDurum.textContent = "✅ Giriş Yapılmış";

        checkinButton.disabled = true;
        checkinButton.textContent = "Check-in Tamamlandı";

    }else{

        rDurum.textContent = "❌ Bekliyor";

        checkinButton.disabled = false;
        checkinButton.textContent = "Check-in Yap";

    }

}

async function ara(kayitNo){

    const kayit = await kayitNoIleBul(kayitNo);

    if(!kayit){

        alert("Katılımcı bulunamadı.");

        return;

    }

    goster(kayit);

}

manualSearch.addEventListener("click",()=>{

    const kod = manualCode.value.trim();

    if(kod===""){

        alert("Kayıt numarası giriniz.");

        return;

    }

    ara(kod);

});

checkinButton.addEventListener("click",async()=>{

    if(!aktifKayit) return;

    await checkinYap(aktifKayit.id);
    scanner.clear();

document.getElementById("reader").innerHTML="";

    alert("Check-in başarıyla tamamlandı.");

    aktifKayit.checkin = true;

    goster(aktifKayit);

});

const scanner = new Html5Qrcode("reader");

scanner.start(

{ facingMode:"environment" },

{

fps:10,

qrbox:250

},

async(decodedText)=>{

try{

let veri;

try{

    veri=JSON.parse(decodedText);

}catch{

    alert("Geçersiz QR Kod");

    return;

}

await ara(veri.kayitNo);

await scanner.stop();

}catch{

alert("Geçersiz QR kodu.");

}

}

);