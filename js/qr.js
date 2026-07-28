import {
    db,
    REGISTRATION_COLLECTION
} from "./config.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

/* -------------------- QR OLUŞTUR -------------------- */

export function createQRCode(elementId, registration) {

    const container = document.getElementById(elementId);

    if (!container) return;

    container.innerHTML = "";

    const qrData = JSON.stringify({

        id: registration.id,

        registerNumber: registration.registerNumber

    });

    new QRCode(container, {

        text: qrData,

        width: 240,

        height: 240,

        correctLevel: QRCode.CorrectLevel.H

    });

}

/* -------------------- QR TEMİZLE -------------------- */

export function clearQRCode(elementId) {

    const container = document.getElementById(elementId);

    if (!container) return;

    container.innerHTML = "";

}

/* -------------------- QR METNİNİ AYIKLA -------------------- */

export function parseQRCode(text) {

    try {

        return JSON.parse(text);

    }

    catch {

        return null;

    }

}

/* -------------------- FIRESTORE'DAN KAYIT GETİR -------------------- */

export async function getRegistrationFromQR(text) {

    const qr = parseQRCode(text);

    if (!qr)

        throw new Error(

            "Geçersiz QR."

        );

    if (!qr.id)

        throw new Error(

            "QR içinde belge kimliği yok."

        );

    const ref = doc(

        db,

        REGISTRATION_COLLECTION,

        qr.id

    );

    const snap = await getDoc(ref);

    if (!snap.exists())

        throw new Error(

            "Kayıt bulunamadı."

        );

    return {

        id: snap.id,

        ...snap.data()

    };

}

/* -------------------- TELEFON KAMERASI -------------------- */

let scanner = null;

export async function startScanner(

    readerId,

    onSuccess

) {

    if (scanner) {

        await stopScanner();

    }

    scanner = new Html5Qrcode(

        readerId

    );

    await scanner.start(

        {

            facingMode: "environment"

        },

        {

            fps: 10,

            qrbox: {

                width: 260,

                height: 260

            }

        },

        async(decodedText) => {

            try {

                const registration =

                    await getRegistrationFromQR(

                        decodedText

                    );

                await stopScanner();

                onSuccess(

                    registration

                );

            }

            catch (err) {

                console.error(err);

            }

        }

    );

}

/* -------------------- KAMERAYI DURDUR -------------------- */

export async function stopScanner() {

    if (!scanner)

        return;

    try {

        await scanner.stop();

        await scanner.clear();

    }

    finally {

        scanner = null;

    }

}

/* -------------------- QR'DAN KAYIT BİLGİSİ HTML -------------------- */

export function registrationToHTML(data) {

    return `

<div class="card shadow border-0">

<div class="card-body">

<h4 class="mb-4">

${data.registerNumber}

</h4>

<table class="table">

<tbody>

<tr>

<th>Ad Soyad</th>

<td>${data.name} ${data.surname}</td>

</tr>

<tr>

<th>TC</th>

<td>${data.tc}</td>

</tr>

<tr>

<th>Telefon</th>

<td>${data.phone}</td>

</tr>

<tr>

<th>Doğum Tarihi</th>

<td>${data.birthDate}</td>

</tr>

<tr>

<th>Cinsiyet</th>

<td>${data.gender}</td>

</tr>

<tr>

<th>İlçe</th>

<td>${data.district}</td>

</tr>

<tr>

<th>Mahalle</th>

<td>${data.neighborhood}</td>

</tr>

<tr>

<th>Adres</th>

<td>${data.address}</td>

</tr>

<tr>

<th>Okul</th>

<td>${data.school || "-"}</td>

</tr>

<tr>

<th>Sınıf</th>

<td>${data.className || "-"}</td>

</tr>

<tr>

<th>Veli</th>

<td>${data.parentName || "-"}</td>

</tr>

<tr>

<th>Veli Telefonu</th>

<td>${data.parentPhone || "-"}</td>

</tr>

<tr>

<th>Koltuk</th>

<td>

<strong>

${data.seatNumber || "-"}

</strong>

</td>

</tr>

</tbody>

</table>

</div>

</div>

`;

}