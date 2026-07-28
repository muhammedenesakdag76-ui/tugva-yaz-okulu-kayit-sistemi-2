/* ===========================================
   pdf.js
=========================================== */

import {
    formatPhone,
    formatDate
} from "./utils.js";

const { jsPDF } = window.jspdf;

/* ----------------------------------------- */
/* QR Görselini Al */
/* ----------------------------------------- */

function getQRCodeImage() {

    const qr = document.querySelector(
        "#qrContainer img,#qrContainer canvas"
    );

    if (!qr)
        return null;

    if (qr.tagName === "IMG") {

        return qr.src;

    }

    return qr.toDataURL("image/png");

}

/* ----------------------------------------- */
/* Başlık */
/* ----------------------------------------- */

function drawHeader(pdf) {

    pdf.setFont("helvetica", "bold");

    pdf.setFontSize(18);

    pdf.text(
        "TÜGVA YAZ OKULU",
        105,
        20,
        {
            align: "center"
        }
    );

    pdf.setFontSize(15);

    pdf.text(
        "KAYIT BELGESİ",
        105,
        30,
        {
            align: "center"
        }
    );

    pdf.line(
        20,
        36,
        190,
        36
    );

}

/* ----------------------------------------- */
/* Bilgi Satırı */
/* ----------------------------------------- */

function writeRow(
    pdf,
    label,
    value,
    y
) {

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.text(
        label,
        20,
        y
    );

    pdf.setFont(
        "helvetica",
        "normal"
    );

    pdf.text(
        value || "-",
        70,
        y
    );

}

/* ----------------------------------------- */
/* PDF Oluştur */
/* ----------------------------------------- */

export async function downloadPDF(data) {

    const pdf =
        new jsPDF({

            orientation: "portrait",

            unit: "mm",

            format: "a4"

        });

    drawHeader(pdf);

    let y = 48;

    writeRow(
        pdf,
        "Kayıt No",
        data.registerNumber,
        y
    );

    y += 10;

    writeRow(
        pdf,
        "Ad Soyad",
        `${data.name} ${data.surname}`,
        y
    );

    y += 10;

    writeRow(
        pdf,
        "TC Kimlik",
        data.tc,
        y
    );

    y += 10;

    writeRow(
        pdf,
        "Telefon",
        formatPhone(data.phone),
        y
    );

    y += 10;

    writeRow(
        pdf,
        "Doğum Tarihi",
        formatDate(data.birthDate),
        y
    );

    y += 10;

    writeRow(
        pdf,
        "Yaş",
        String(data.age),
        y
    );

    y += 10;

    writeRow(
        pdf,
        "Cinsiyet",
        data.gender,
        y
    );

    y += 10;

    writeRow(
        pdf,
        "İlçe",
        data.district,
        y
    );

    y += 10;

    writeRow(
        pdf,
        "Mahalle",
        data.neighborhood,
        y
    );

    y += 10;

    writeRow(
        pdf,
        "Adres",
        data.address,
        y
    );

    y += 10;

    if (data.school) {

        writeRow(
            pdf,
            "Okul",
            data.school,
            y
        );

        y += 10;

    }

    if (data.className) {

        writeRow(
            pdf,
            "Sınıf",
            data.className,
            y
        );

        y += 10;

    }

    if (data.parentName) {

        writeRow(
            pdf,
            "Veli",
            data.parentName,
            y
        );

        y += 10;

    }

    if (data.parentPhone) {

        writeRow(
            pdf,
            "Veli Telefonu",
            formatPhone(
                data.parentPhone
            ),
            y
        );

        y += 10;

    }

    writeRow(
        pdf,
        "Koltuk No",
        data.seatNumber || "-",
        y
    );

    const qrImage =
        getQRCodeImage();

    if (qrImage) {

        pdf.addImage(

            qrImage,

            "PNG",

            140,

            45,

            45,

            45

        );

    }

    pdf.setFontSize(10);

    pdf.text(

        "Bu belge sistem tarafından otomatik oluşturulmuştur.",

        105,

        280,

        {

            align: "center"

        }

    );

    pdf.save(

        `${data.registerNumber}.pdf`

    );

}

/* ----------------------------------------- */
/* Yazdır */
/* ----------------------------------------- */

export function printRegistration() {

    window.print();

}