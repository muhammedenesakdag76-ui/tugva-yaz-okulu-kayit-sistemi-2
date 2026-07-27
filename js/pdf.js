import { jsPDF } from "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm";

import {

    generateQRCode

} from "./qr.js";

const PAGE = {

    WIDTH: 210,

    HEIGHT: 297,

    MARGIN: 15

};

function center(doc, text, y, size = 18) {

    doc.setFont("helvetica", "bold");

    doc.setFontSize(size);

    const width = doc.getTextWidth(text);

    doc.text(

        text,

        (PAGE.WIDTH - width) / 2,

        y

    );

}

function field(doc, label, value, y) {

    doc.setFont("helvetica", "bold");

    doc.setFontSize(11);

    doc.text(`${label}:`, PAGE.MARGIN, y);

    doc.setFont("helvetica", "normal");

    doc.text(

        String(value ?? ""),

        60,

        y

    );

}

function line(doc, y) {

    doc.line(

        PAGE.MARGIN,

        y,

        PAGE.WIDTH - PAGE.MARGIN,

        y

    );

}

function footer(doc) {

    doc.setFontSize(9);

    doc.setFont("helvetica", "italic");

    doc.text(

        "TÜGVA Yaz Okulu Kayıt Sistemi",

        PAGE.MARGIN,

        288

    );

}
export async function createRegistrationPDF(registration) {

    const doc = new jsPDF({

        orientation: "portrait",

        unit: "mm",

        format: "a4"

    });

    center(

        doc,

        "TÜGVA YAZ OKULU",

        20,

        20

    );

    center(

        doc,

        "KAYIT BELGESİ",

        30,

        15

    );

    line(doc, 36);

    field(

        doc,

        "Kayıt No",

        registration.registerNumber,

        48

    );

    field(

        doc,

        "Ad Soyad",

        registration.name,

        58

    );

    field(

        doc,

        "TC Kimlik",

        registration.tc,

        68

    );

    field(

        doc,

        "Telefon",

        registration.phone,

        78

    );

    field(

        doc,

        "E-Posta",

        registration.email,

        88

    );

    field(

        doc,

        "Doğum Tarihi",

        registration.birth,

        98

    );

    field(

        doc,

        "Cinsiyet",

        registration.gender,

        108

    );

    field(

        doc,

        "Okul",

        registration.school,

        118

    );

    field(

        doc,

        "Sınıf",

        registration.class,

        128

    );

    field(

        doc,

        "Veli",

        registration.parent,

        138

    );

    field(

        doc,

        "Veli Telefon",

        registration.parentPhone,

        148

    );

    field(

        doc,

        "Koltuk",

        registration.seat || "-",

        158

    );

    field(

        doc,

        "Adres",

        registration.address,

        170

    );

    if (registration.note) {

        field(

            doc,

            "Not",

            registration.note,

            182

        );

    }

    const qrImage = await generateQRCode(

        registration

    );

    doc.addImage(

        qrImage,

        "PNG",

        145,

        45,

        45,

        45

    );

    footer(doc);

    return doc;

}
export async function downloadRegistrationPDF(registration) {

    const pdf = await createRegistrationPDF(
        registration
    );

    pdf.save(
        `${registration.registerNumber}.pdf`
    );

}

export async function getPDFBlob(registration) {

    const pdf = await createRegistrationPDF(
        registration
    );

    return pdf.output("blob");

}

export async function getPDFArrayBuffer(registration) {

    const pdf = await createRegistrationPDF(
        registration
    );

    return pdf.output("arraybuffer");

}

export async function getPDFDataUri(registration) {

    const pdf = await createRegistrationPDF(
        registration
    );

    return pdf.output("datauristring");

}

export async function openPDF(registration) {

    const pdf = await createRegistrationPDF(
        registration
    );

    const blob = pdf.output("blob");

    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");

    setTimeout(() => {

        URL.revokeObjectURL(url);

    }, 5000);

}
export function createPDFFileName(registration) {

    return `${registration.registerNumber}.pdf`;

}

export async function downloadPDF(registration) {

    await downloadRegistrationPDF(
        registration
    );

}

export async function previewPDF(registration) {

    await openPDF(
        registration
    );

}

export default {

    createRegistrationPDF,

    downloadRegistrationPDF,

    downloadPDF,

    previewPDF,

    getPDFBlob,

    getPDFArrayBuffer,

    getPDFDataUri,

    createPDFFileName,

    openPDF

};