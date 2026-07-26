let kayitOluyor = false;

import { pdfOlustur } from "./pdf.js";
import { formKontrol } from "./validation.js";
import { yeniKayit } from "./register.js";
import { toplamKayit } from "./firebase.js";
import { qrOlustur } from "./qr.js";

const MAX_KONTENJAN = 85;

const form = document.getElementById("registerForm");
const formCard = document.getElementById("formCard");
const successCard = document.getElementById("successCard");
const remainingCount = document.getElementById("remainingCount");
const registerNumber = document.getElementById("registerNumber");
const newRegister = document.getElementById("newRegister");
const downloadCard = document.getElementById("downloadCard");
const submitButton = form.querySelector("button[type='submit']");

async function kontenjanGuncelle(){

    try{

        const toplam = await toplamKayit();

        remainingCount.textContent = Math.max(0, MAX_KONTENJAN - toplam);

    }catch(err){

        console.error(err);

        remainingCount.textContent = "-";

    }

}

kontenjanGuncelle();

form.addEventListener("submit",async(e)=>{

    e.preventDefault();

    if(kayitOluyor) return;

    kayitOluyor = true;

    submitButton.disabled = true;
    submitButton.textContent = "Kaydediliyor...";

    const veri={

        name:document.getElementById("name").value.trim(),

        tc:document.getElementById("tc").value.trim(),

        birth:document.getElementById("birth").value,

        phone:document.getElementById("phone").value.trim(),

        email:document.getElementById("email").value.trim().toLowerCase(),

        gender:document.getElementById("gender").value,

        emergencyName:document.getElementById("emergencyName").value.trim(),

        emergencyPhone:document.getElementById("emergencyPhone").value.trim(),

        note:document.getElementById("note").value.trim(),

        parent:document.getElementById("parent").checked,

        kvkk:document.getElementById("kvkk").checked

    };

    const hata = formKontrol(veri);

    if(hata){

        alert(hata);

        submitButton.disabled = false;
        submitButton.textContent = "Kayıt Ol";

        kayitOluyor = false;

        return;

    }

    try{

        const sonuc = await yeniKayit(veri);

        if(!sonuc.basarili){

            alert(sonuc.mesaj);

            return;

        }

        const katilimci={

            kayitNo:sonuc.kayitNo,

            adSoyad:veri.name,

            tc:veri.tc,

            telefon:veri.phone

        };

        registerNumber.textContent = katilimci.kayitNo;

        await qrOlustur(katilimci);

        remainingCount.textContent = sonuc.kalanKontenjan;

        downloadCard.onclick = async()=>{

            try{

                await pdfOlustur(katilimci);

            }catch(err){

                console.error(err);

                alert("PDF oluşturulurken hata oluştu.");

            }

        };

        formCard.classList.add("hidden");
        successCard.classList.remove("hidden");

        successCard.scrollIntoView({

            behavior:"smooth",

            block:"start"

        });

        form.reset();

    }catch(err){

        console.error(err);

        alert(err.message || "Bir hata oluştu. Lütfen tekrar deneyiniz.");

    }finally{

        kayitOluyor = false;

        submitButton.disabled = false;

        submitButton.textContent = "Kayıt Ol";

        await kontenjanGuncelle();

    }

});

newRegister.addEventListener("click",()=>{

    successCard.classList.add("hidden");

    formCard.classList.remove("hidden");

    form.reset();

    kontenjanGuncelle();

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

});

window.addEventListener("pageshow",()=>{

    submitButton.disabled = false;

    submitButton.textContent = "Kayıt Ol";

    kayitOluyor = false;

});