import { jsPDF } from "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm";
import { createRegistrationQR } from "./qr.js";

const LOGO = "assets/logo.png";

function formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("tr-TR");
}

function addTitle(pdf) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("TÜGVA Yaz Okulu Kayıt Belgesi", 105, 18, {
        align: "center"
    });
}

function addLine(pdf) {
    pdf.setLineWidth(0.5);
    pdf.line(15, 23, 195, 23);
}

function addField(pdf, label, value, y) {

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text(`${label}:`, 18, y);

    pdf.setFont("helvetica", "normal");
    pdf.text(String(value || "-"), 60, y);

}

async function addQR(pdf, registration) {

    const canvas = document.createElement("canvas");

    const qr = await createRegistrationQR(
        registration,
        canvas
    );

    pdf.addImage(
        qr.image,
        "PNG",
        145,
        35,
        45,
        45
    );

}

function addFooter(pdf) {

    pdf.setDrawColor(180);

    pdf.line(15, 275, 195, 275);

    pdf.setFontSize(9);

    pdf.setFont("helvetica", "italic");

    pdf.text(
        "Bu belge TÜGVA Yaz Okulu Kayıt Sistemi tarafından oluşturulmuştur.",
        105,
        282,
        {
            align: "center"
        }
    );

}

export async function createRegistrationPDF(registration) {

    const pdf = new jsPDF({

        orientation: "portrait",

        unit: "mm",

        format: "a4"

    });

    addTitle(pdf);

    addLine(pdf);

    let y = 38;

    addField(
        pdf,
        "Kayıt No",
        registration.registerNumber,
        y
    );

    y += 10;

    addField(
        pdf,
        "Ad Soyad",
        registration.name,
        y
    );

    y += 10;

    addField(
        pdf,
        "T.C. Kimlik",
        registration.tc,
        y
    );

    y += 10;

    addField(
        pdf,
        "Telefon",
        registration.phone,
        y
    );

    y += 10;

    addField(
        pdf,
        "Doğum Tarihi",
        formatDate(registration.birth),
        y
    );

    y += 10;

    addField(
        pdf,
        "Cinsiyet",
        registration.gender,
        y
    );

    y += 10;

    addField(
        pdf,
        "Okul",
        registration.school,
        y
    );

    y += 10;

    addField(
        pdf,
        "Sınıf",
        registration.class,
        y
    );

    y += 10;

    addField(
        pdf,
        "Veli",
        registration.parent,
        y
    );

    y += 10;

    addField(
        pdf,
        "Veli Telefonu",
        registration.parentPhone,
        y
    );

    y += 10;

    addField(
        pdf,
        "Adres",
        registration.address,
        y
    );

    y += 10;

    addField(
        pdf,
        "Not",
        registration.note || "-",
        y
    );

    await addQR(
        pdf,
        registration
    );

    addFooter(pdf);

    return pdf;

}

export async function downloadRegistrationPDF(registration) {

    const pdf = await createRegistrationPDF(
        registration
    );

    pdf.save(

        `${registration.registerNumber || "kayit"}.pdf`

    );

}

export default {

    createRegistrationPDF,

    downloadRegistrationPDF

};