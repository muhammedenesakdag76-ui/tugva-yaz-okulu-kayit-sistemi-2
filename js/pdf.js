// ===============================
// PDF Module
// ===============================

import { getQRImage } from "./qr.js";

const { jsPDF } = window;


// ===============================
// Draw Header
// ===============================

function drawHeader(pdf) {

    pdf.setFillColor(16, 24, 40);
    pdf.rect(0, 0, 210, 28, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);

    pdf.text(
        "TÜGVA YAZ OKULU",
        105,
        15,
        {
            align: "center"
        }
    );

    pdf.setFontSize(11);

    pdf.text(
        "Katılımcı Kayıt Belgesi",
        105,
        22,
        {
            align: "center"
        }
    );

}


// ===============================
// Draw Participant Information
// ===============================

function drawParticipant(pdf, data) {

    pdf.setTextColor(0);

    pdf.setFontSize(12);

    pdf.setFont("helvetica", "bold");

    pdf.text("Katılımcı Bilgileri", 15, 40);

    pdf.setFont("helvetica", "normal");

    let y = 50;

    const rows = [

        ["Kayıt No", data.kayitNo],

        ["Ad Soyad", data.adSoyad],

        ["TC Kimlik", data.tc],

        ["Telefon", data.telefon],

        ["Doğum Tarihi", data.dogumTarihi],

        ["Cinsiyet", data.cinsiyet],

        ["Okul", data.okul],

        ["Sınıf", data.sinif],

        ["Veli", data.veliAdi],

        ["Veli Telefon", data.veliTelefon]

    ];

    rows.forEach(row => {

        pdf.setFont("helvetica", "bold");

        pdf.text(row[0] + " :", 15, y);

        pdf.setFont("helvetica", "normal");

        pdf.text(String(row[1]), 55, y);

        y += 8;

    });

}
// ===============================
// Draw QR
// ===============================

function drawQR(pdf) {

    const image = getQRImage();

    if (!image)
        return;

    pdf.addImage(

        image,

        "PNG",

        145,

        45,

        45,

        45

    );

}


// ===============================
// Draw Address
// ===============================

function drawAddress(pdf, data) {

    pdf.setFont("helvetica", "bold");

    pdf.text(

        "Adres",

        15,

        145

    );

    pdf.setFont("helvetica", "normal");

    pdf.setFontSize(11);

    pdf.text(

        data.adres || "-",

        15,

        153,

        {

            maxWidth: 170

        }

    );

}


// ===============================
// Draw Note
// ===============================

function drawNote(pdf, data) {

    pdf.setFont("helvetica", "bold");

    pdf.text(

        "Not",

        15,

        175

    );

    pdf.setFont("helvetica", "normal");

    pdf.text(

        data.not || "-",

        15,

        183,

        {

            maxWidth: 170

        }

    );

}
// ===============================
// Footer
// ===============================

function drawFooter(pdf) {

    pdf.setDrawColor(180);

    pdf.line(15, 260, 195, 260);

    pdf.setFontSize(10);

    pdf.setTextColor(100);

    pdf.text(

        "Bu belge TÜGVA Yaz Okulu Kayıt Sistemi tarafından otomatik oluşturulmuştur.",

        105,

        268,

        {

            align: "center"

        }

    );

}


// ===============================
// Export PDF
// ===============================

export function downloadPDF(data) {

    const pdf = new jsPDF({

        orientation: "portrait",

        unit: "mm",

        format: "a4"

    });

    drawHeader(pdf);

    drawParticipant(pdf, data);

    drawQR(pdf);

    drawAddress(pdf, data);

    drawNote(pdf, data);

    drawFooter(pdf);

    pdf.save(

        `${data.kayitNo}.pdf`

    );

}