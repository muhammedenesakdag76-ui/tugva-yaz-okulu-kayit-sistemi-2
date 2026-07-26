import {
    kayitNoIleBul,
    checkinYap
} from "./firebase.js";

let aktifKayit = null;
let scanner = null;
let scannerAktif = false;

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

    resultCard.scrollIntoView({

        behavior:"smooth",
        block:"center"

    });

}

async function ara(kayitNo){

    try{

        const kayit = await kayitNoIleBul(kayitNo);

        if(!kayit){

            alert("Katılımcı bulunamadı.");
            return;

        }

        goster(kayit);

    }catch(err){

        console.error(err);
        alert("Katılımcı aranırken hata oluştu.");

    }

}

manualSearch.addEventListener("click",()=>{

    const kayitNo = manualCode.value.trim().toUpperCase();

    if(!kayitNo){

        alert("Kayıt numarası giriniz.");
        return;

    }

    ara(kayitNo);

});

manualCode.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        e.preventDefault();
        manualSearch.click();

    }

});

checkinButton.addEventListener("click",async()=>{

    if(!aktifKayit) return;

    if(aktifKayit.checkin){

        alert("Bu katılımcı zaten giriş yapmış.");
        return;

    }

    try{

        checkinButton.disabled = true;
        checkinButton.textContent = "Kaydediliyor...";

        await checkinYap(aktifKayit.id);

        aktifKayit.checkin = true;

        goster(aktifKayit);

        if(navigator.vibrate){

            navigator.vibrate(200);

        }

        alert("Check-in başarıyla tamamlandı.");

    }catch(err){

        console.error(err);
        alert("Check-in sırasında hata oluştu.");

    }finally{

        if(!aktifKayit?.checkin){

            checkinButton.disabled = false;
            checkinButton.textContent = "Check-in Yap";

        }

    }

});

async function kameraBaslat(){

    scanner = new Html5Qrcode("reader");

    scannerAktif = true;

    await scanner.start(

        {facingMode:"environment"},

        {
            fps:10,
            qrbox:{width:250,height:250}
        },

        async(decodedText)=>{

            if(!scannerAktif) return;

            scannerAktif=false;

            try{

                let veri;

                try{

                    veri=JSON.parse(decodedText);

                }catch{

                    alert("Geçersiz QR Kod");

                    scannerAktif=true;
                    return;

                }

                if(!veri.kayitNo){

                    alert("QR Kod geçersiz.");

                    scannerAktif=true;
                    return;

                }

                if(navigator.vibrate){

                    navigator.vibrate(100);

                }

                await ara(veri.kayitNo);

                await scanner.stop();
                await scanner.clear();

                document.getElementById("reader").innerHTML="";

            }catch(err){

                console.error(err);
                alert("QR okunurken hata oluştu.");

                scannerAktif=true;

            }

        },

        ()=>{}

    );

}

kameraBaslat().catch(err=>{

    console.error(err);

    alert("Kamera başlatılamadı. Kamera izni verdiğinizden emin olun.");

});
window.addEventListener("beforeunload",async()=>{

    try{

        await scanner.stop();

        await scanner.clear();

    }catch{}

});