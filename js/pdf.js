import { jsPDF } from "https://cdn.jsdelivr.net/npm/jspdf@2.5.2/+esm";

import {
    createQRCodeDataURL
} from "./qr.js";

const PAGE = {

    width: 210,

    height: 297,

    margin: 20

};

function center(pdf, text, y, size = 16) {

    pdf.setFont("helvetica", "bold");

    pdf.setFontSize(size);

    const width = pdf.getTextWidth(text);

    pdf.text(

        text,

        (PAGE.width - width) / 2,

        y

    );

}

function field(pdf, label, value, y) {

    pdf.setFontSize(11);

    pdf.setFont("helvetica", "bold");

    pdf.text(label, PAGE.margin, y);

    pdf.setFont("helvetica", "normal");

    pdf.text(

        String(value ?? "-"),

        PAGE.margin + 45,

        y

    );

}
export async function createRegistrationPDF(registration) {

    const pdf = new jsPDF();

    center(

        pdf,

        "TÜGVA Yaz Okulu Kayıt Belgesi",

        20

    );

    pdf.setDrawColor(180);

    pdf.line(

        PAGE.margin,

        25,

        PAGE.width - PAGE.margin,

        25

    );

    let y = 40;

    field(

        pdf,

        "Kayıt No",

        registration.registerNumber,

        y

    );

    y += 10;

    field(pdf, "Ad Soyad", registration.name, y);

    y += 10;

    field(pdf, "T.C.", registration.tc, y);

    y += 10;

    field(pdf, "Telefon", registration.phone, y);

    y += 10;

    field(pdf, "Okul", registration.school, y);

    y += 10;

    field(pdf, "Sınıf", registration.class, y);

    y += 10;

    field(pdf, "Veli", registration.parent, y);

    y += 10;

    field(pdf, "Veli Telefon",

        registration.parentPhone,

        y

    );

    y += 10;

    field(

        pdf,

        "Koltuk",

        registration.seat || "-",

        y

    );
        const qr =

        await createQRCodeDataURL(

            registration

        );

    pdf.addImage(

        qr,

        "PNG",

        145,

        40,

        45,

        45

    );

    pdf.setFontSize(10);

    pdf.setTextColor(90);

    pdf.text(

        "QR kodu etkinlik girişinde görevlilere gösteriniz.",

        PAGE.margin,

        170

    );

    pdf.text(

        "Bu belge sistem tarafından oluşturulmuştur.",

        PAGE.margin,

        178

    );

    return pdf;

}
export async function downloadRegistrationPDF(

    registration

) {

    const pdf =

        await createRegistrationPDF(

            registration

        );

    pdf.save(

        `${registration.registerNumber}.pdf`

    );

}

export async function openRegistrationPDF(

    registration

) {

    const pdf =

        await createRegistrationPDF(

            registration

        );

    window.open(

        pdf.output("bloburl"),

        "_blank"

    );

}
export default {

    createRegistrationPDF,

    downloadRegistrationPDF,

    openRegistrationPDF

};