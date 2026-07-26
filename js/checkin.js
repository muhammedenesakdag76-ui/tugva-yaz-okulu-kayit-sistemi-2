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

let currentRecord = null;
let scanner = null;

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

    }

});

async function qrOkundu(qrText) {

    if (scanner) {

        await scanner.stop();

    }

    const kayit = await kayitNoIleBul(qrText);

    if (!kayit) {

        alert("Kayıt bulunamadı.");

        kameraBaslat();

        return;

    }

    currentRecord = kayit;

    name.textContent = kayit.adSoyad;

    registerNo.textContent = kayit.kayitNo;

    phone.textContent = kayit.telefon;

    if (kayit.checkin) {

        status.textContent = "✅ Check-in Yapıldı";

        status.style.color = "#198754";

        checkBtn.style.display = "none";

        cancelBtn.style.display = "block";

    } else {

        status.textContent = "⏳ Bekliyor";

        status.style.color = "#fd7e14";

        checkBtn.style.display = "block";

        cancelBtn.style.display = "none";

    }

    resultCard.style.display = "block";

}
async function kameraBaslat() {

    resultCard.style.display = "none";

    scanner = new Html5Qrcode("reader");

    try {

        const cameras = await Html5Qrcode.getCameras();

let cameraId = cameras[0].id;

const backCamera = cameras.find(camera =>
    /back|rear|environment|arka/i.test(
        camera.label
    )
);

if (backCamera) {
    cameraId = backCamera.id;
}

                fps: 10,

                qrbox: {

                    width: 250,

                    height: 250

                }

            },

            async (decodedText) => {

                await qrOkundu(decodedText);

            },

            () => {}

        );

    } catch (err) {

        console.error(err);

        alert("Kamera başlatılamadı.");

    }

}

checkBtn.addEventListener("click", async () => {

    if (!currentRecord) return;

    try {

        await checkinYap(currentRecord.id);

        alert("Check-in başarılı.");

        kameraBaslat();

    } catch (err) {

        console.error(err);

        alert("İşlem başarısız.");

    }

});

cancelBtn.addEventListener("click", async () => {

    if (!currentRecord) return;

    try {

        await checkinIptal(currentRecord.id);

        alert("Check-in iptal edildi.");

        kameraBaslat();

    } catch (err) {

        console.error(err);

        alert("İşlem başarısız.");

    }

});

backBtn.addEventListener("click", () => {

    window.location.href = "admin.html";

});
window.addEventListener("load", () => {

    kameraBaslat();

});

window.addEventListener("beforeunload", async () => {

    try {

        if (
            scanner &&
            scanner.isScanning
        ) {

            await scanner.stop();

            await scanner.clear();

        }

    } catch (err) {

        console.error(err);

    }

});

document.addEventListener("visibilitychange", async () => {

    if (document.hidden) {

        try {

            if (
                scanner &&
                scanner.isScanning
            ) {

                await scanner.stop();

            }

        } catch {}

    } else {

        try {

            if (
                !scanner ||
                !scanner.isScanning
            ) {

                kameraBaslat();

            }

        } catch {}

    }

});