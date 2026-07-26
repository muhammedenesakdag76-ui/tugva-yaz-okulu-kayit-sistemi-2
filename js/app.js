import { pdfOlustur } from "./pdf.js";

import { formKontrol } from "./validation.js";

import { yeniKayit } from "./register.js";

import { toplamKayit } from "./firebase.js";

import { qrOlustur } from "./qr.js";

const form=document.getElementById("registerForm");

const formCard=document.getElementById("formCard");

const successCard=document.getElementById("successCard");

const remainingCount=document.getElementById("remainingCount");

const registerNumber=document.getElementById("registerNumber");

const newRegister=document.getElementById("newRegister");

const downloadCard=document.getElementById("downloadCard");

async function kontenjanGuncelle(){

const toplam=await toplamKayit();

remainingCount.textContent=85-toplam;

}

kontenjanGuncelle();

form.addEventListener("submit",async(e)=>{

e.preventDefault();

const veri={

name:document.getElementById("name").value.trim(),

tc:document.getElementById("tc").value.trim(),

birth:document.getElementById("birth").value,

phone:document.getElementById("phone").value.trim(),

email:document.getElementById("email").value.trim(),

gender:document.getElementById("gender").value,

emergencyName:document.getElementById("emergencyName").value.trim(),

emergencyPhone:document.getElementById("emergencyPhone").value.trim(),

note:document.getElementById("note").value.trim(),

parent:document.getElementById("parent").checked,

kvkk:document.getElementById("kvkk").checked

};

const hata=formKontrol(veri);

if(hata){

alert(hata);

return;

}

try{

const sonuc=await yeniKayit(veri);

registerNumber.textContent=sonuc.kayitNo;

await qrOlustur({
    kayitNo: sonuc.kayitNo,
    adSoyad: veri.name,
    tc: veri.tc,
    telefon: veri.phone
});

remainingCount.textContent=sonuc.kalanKontenjan;

formCard.classList.add("hidden");

successCard.classList.remove("hidden");

form.reset();

}catch(err){

alert(err.message);

}

});

newRegister.addEventListener("click",()=>{

successCard.classList.add("hidden");

formCard.classList.remove("hidden");

kontenjanGuncelle();

window.scrollTo({

top:0,

behavior:"smooth"

});

});

downloadCard.addEventListener("click",async()=>{

    await pdfOlustur({

        kayitNo:registerNumber.textContent,

        adSoyad:veri.name,

        tc:veri.tc,

        telefon:veri.phone

    });

});