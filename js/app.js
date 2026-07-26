import { toplamKayit, MAX_KONTENJAN } from "./firebase.js";
import { yeniKayit } from "./register.js";

const form = document.getElementById("registerForm");
const formCard = document.getElementById("formCard");
const successCard = document.getElementById("successCard");

const remainingCount = document.getElementById("remainingCount");
const registerNumber = document.getElementById("registerNumber");

const newRegister = document.getElementById("newRegister");
const downloadCard = document.getElementById("downloadCard");

let aktifKayitNo = "";

async function kontenjanGuncelle() {

    if (!remainingCount) return;

    remainingCount.textContent = "...";

    try {

        const toplam = await toplamKayit();

        const kalan = MAX_KONTENJAN - toplam;

        remainingCount.textContent = kalan > 0 ? kalan : 0;

    } catch (err) {

        console.error("Kontenjan okunamadı:", err);

        remainingCount.textContent = "0";

    }

}

window.addEventListener("DOMContentLoaded", () => {

    kontenjanGuncelle();

});

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const button = form.querySelector("button[type='submit']");

    button.disabled = true;

    button.textContent = "Kayıt Yapılıyor...";

    const veri = {

        name: form.name.value,
        tc: form.tc.value,
        birth: form.birth.value,
        phone: form.phone.value,
        email: form.email.value,
        gender: form.gender.value,
        emergencyName: form.emergencyName.value,
        emergencyPhone: form.emergencyPhone.value,
        note: form.note.value

    };

    const sonuc = await yeniKayit(veri);

    button.disabled = false;

    button.textContent = "Kayıt Ol";

    if (!sonuc.basarili) {

        alert(sonuc.mesaj);

        kontenjanGuncelle();

        return;

    }
        aktifKayitNo = sonuc.kayitNo;

    registerNumber.textContent = sonuc.kayitNo;

    remainingCount.textContent = sonuc.kalanKontenjan;

    formCard.classList.add("hidden");

    successCard.classList.remove("hidden");

    if (typeof generateQR === "function") {

        generateQR(aktifKayitNo);

    }

    if (downloadCard) {

        downloadCard.classList.remove("hidden");

    }

});

newRegister.addEventListener("click", () => {

    form.reset();

    aktifKayitNo = "";

    formCard.classList.remove("hidden");

    successCard.classList.add("hidden");

    const qr = document.getElementById("qrcode");

    if (qr) {

        qr.innerHTML = "";

    }

    if (downloadCard) {

        downloadCard.classList.add("hidden");

    }

    kontenjanGuncelle();

});

window.addEventListener("focus", () => {

    kontenjanGuncelle();

});

document.addEventListener("visibilitychange", () => {

    if (!document.hidden) {

        kontenjanGuncelle();

    }

});
const pdfButton = document.getElementById("downloadPdf");

if (pdfButton) {

    pdfButton.addEventListener("click", () => {

        if (!aktifKayitNo) {

            alert("Önce kayıt oluşturulmalıdır.");

            return;

        }

        if (typeof downloadPDF === "function") {

            downloadPDF(aktifKayitNo);

        } else {

            alert("PDF modülü yüklenemedi.");

        }

    });

}

const qrButton = document.getElementById("downloadQr");

if (qrButton) {

    qrButton.addEventListener("click", () => {

        if (!aktifKayitNo) {

            alert("Önce kayıt oluşturulmalıdır.");

            return;

        }

        const canvas = document.querySelector("#qrcode canvas");

        if (!canvas) {

            alert("QR kod oluşturulamadı.");

            return;

        }

        const link = document.createElement("a");

        link.href = canvas.toDataURL("image/png");

        link.download = `${aktifKayitNo}-QR.png`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

    });

}

/* Her 30 saniyede bir kontenjanı güncelle */

setInterval(() => {

    if (!document.hidden) {

        kontenjanGuncelle();

    }

}, 30000);

/* Sayfa tamamen yüklendiğinde bir kez daha güncelle */

window.addEventListener("load", () => {

    kontenjanGuncelle();

});

window.aktifKayitNo = () => aktifKayitNo;