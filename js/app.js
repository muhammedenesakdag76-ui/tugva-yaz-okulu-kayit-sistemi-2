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

    try {

        const toplam = await toplamKayit();

        remainingCount.textContent = Math.max(
            0,
            MAX_KONTENJAN - toplam
        );

    } catch {

        remainingCount.textContent = "-";

    }

}

kontenjanGuncelle();

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

        generateQR(sonuc.kayitNo);

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

window.addEventListener("load", () => {

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

        if (typeof downloadPDF === "function") {

            downloadPDF(aktifKayitNo);

        }

    });

}

const qrButton = document.getElementById("downloadQr");

if (qrButton) {

    qrButton.addEventListener("click", () => {

        const canvas = document.querySelector("#qrcode canvas");

        if (!canvas) {

            alert("QR kod oluşturulamadı.");

            return;

        }

        const link = document.createElement("a");

        link.href = canvas.toDataURL("image/png");

        link.download = `${aktifKayitNo}-QR.png`;

        link.click();

    });

}

window.aktifKayitNo = () => aktifKayitNo;