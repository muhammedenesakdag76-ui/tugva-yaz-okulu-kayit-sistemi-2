// js/pdf.js

import { formatDate, formatPhone } from "./utils.js";

export async function downloadPDF(registration) {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({

        orientation: "portrait",
        unit: "mm",
        format: "a4"

    });

    const pageWidth = doc.internal.pageSize.getWidth();

    let y = 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("TÜGVA YAZ OKULU", pageWidth / 2, y, {
        align: "center"
    });

    y += 8;

    doc.setFontSize(13);
    doc.text("Kayıt Bilgileri", pageWidth / 2, y, {
        align: "center"
    });

    y += 12;

    doc.setDrawColor(220);
    doc.line(15, y, 195, y);

    y += 8;

    const rows = [

        ["Kayıt No", registration.registerNumber],

        ["Ad Soyad",
            `${registration.name} ${registration.surname}`],

        ["TC Kimlik",
            registration.tc],

        ["Telefon",
            formatPhone(registration.phone)],

        ["Doğum Tarihi",
            formatDate(registration.birthDate)],

        ["Yaş",
            String(registration.age)],

        ["Cinsiyet",
            registration.gender],

        ["İlçe",
            registration.district],

        ["Mahalle",
            registration.neighborhood],

        ["Adres",
            registration.address],

        ["Okul",
            registration.school || "-"],

        ["Sınıf",
            registration.className || "-"],

        ["Veli",
            registration.parentName || "-"],

        ["Veli Telefonu",
            registration.parentPhone
                ? formatPhone(registration.parentPhone)
                : "-"],

        ["Koltuk",
            registration.seatNumber || "-"]

    ];

    doc.setFontSize(11);

    rows.forEach(row => {

        doc.setFont("helvetica", "bold");

        doc.text(
            row[0],
            18,
            y
        );

        doc.setFont("helvetica", "normal");

        doc.text(
            String(row[1]),
            65,
            y
        );

        y += 8;

    });

    y += 5;

    doc.setDrawColor(220);

    doc.line(
        15,
        y,
        195,
        y
    );

    y += 12;

    const qrCanvas =
        document
        .querySelector("#qrContainer canvas");

    if (qrCanvas) {

        const image =
            qrCanvas.toDataURL("image/png");

        doc.addImage(

            image,

            "PNG",

            72,

            y,

            65,

            65

        );

    }

    y += 78;

    doc.setFont(
        "helvetica",
        "italic"
    );

    doc.setFontSize(10);

    doc.text(

        "Bu belge TÜGVA Yaz Okulu Kayıt Sistemi tarafından oluşturulmuştur.",

        pageWidth / 2,

        y,

        {

            align: "center"

        }

    );

    y += 18;

    doc.setFont(

        "helvetica",

        "normal"

    );

    doc.text(

        "İmza",

        165,

        y

    );

    doc.line(

        145,

        y + 2,

        195,

        y + 2

    );

    doc.save(

        `${registration.registerNumber}.pdf`

    );

}