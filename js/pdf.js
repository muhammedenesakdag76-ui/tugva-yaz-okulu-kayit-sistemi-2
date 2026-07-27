// ===============================
// PDF Generator
// ===============================

export async function downloadPDF(registration) {

    if (!registration)
        return;

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({

        orientation: "portrait",

        unit: "mm",

        format: "a4"

    });

    pdf.setFont("helvetica");

    pdf.setFontSize(22);

    pdf.text(
        "TÜGVA Yaz Okulu",
        105,
        20,
        {
            align: "center"
        }
    );

    pdf.setFontSize(15);

    pdf.text(
        "Kayıt Belgesi",
        105,
        30,
        {
            align: "center"
        }
    );

    pdf.setDrawColor(0);

    pdf.line(20, 36, 190, 36);

    pdf.setFontSize(12);

    let y = 50;

    const row = (title, value) => {

        pdf.setFont(undefined, "bold");

        pdf.text(title, 20, y);

        pdf.setFont(undefined, "normal");

        pdf.text(String(value ?? "-"), 75, y);

        y += 9;

    };

    row("Kayıt No", registration.kayitNo);

    row("Ad Soyad", registration.adSoyad);

    row("TC Kimlik", registration.tc);

    row("Telefon", registration.telefon);

    row("E-Posta", registration.email);

    row("Doğum Tarihi", registration.dogumTarihi);

    row("Okul", registration.okul);

    row("Sınıf", registration.sinif);

    row("Veli", registration.veliAdi);

    row("Veli Telefon", registration.veliTelefon);

    row(
        "Koltuk",
        registration.seat || "Henüz atanmadı"
    );

    y += 10;
        // ===============================
    // QR Code
    // ===============================

    const qrCanvas =
        document.querySelector("#qrcode canvas");

    if (qrCanvas) {

        const qrImage =
            qrCanvas.toDataURL("image/png");

        pdf.addImage(

            qrImage,

            "PNG",

            135,

            45,

            45,

            45

        );

        pdf.setFontSize(10);

        pdf.text(

            "QR Kodunu girişte görevliye gösteriniz.",

            157.5,

            95,

            {

                align: "center"

            }

        );

    }


    // ===============================
    // Information Box
    // ===============================

    y += 10;

    pdf.setFillColor(245, 245, 245);

    pdf.roundedRect(

        20,

        y,

        170,

        45,

        3,

        3,

        "F"

    );

    pdf.setFontSize(11);

    pdf.setFont(undefined, "bold");

    pdf.text(

        "Bilgilendirme",

        25,

        y + 8

    );

    pdf.setFont(undefined, "normal");

    pdf.text(

        "• Etkinlik günü bu belgeyi yanınızda bulundurunuz.",

        28,

        y + 18

    );

    pdf.text(

        "• QR kod giriş sırasında okutulacaktır.",

        28,

        y + 26

    );

    pdf.text(

        "• Koltuk numarası yönetici tarafından atanacaktır.",

        28,

        y + 34

    );


    // ===============================
    // Footer
    // ===============================

    pdf.setDrawColor(180);

    pdf.line(

        20,

        275,

        190,

        275

    );

    pdf.setFontSize(10);

    pdf.text(

        "TÜGVA Yaz Okulu Kayıt Sistemi",

        105,

        282,

        {

            align: "center"

        }

    );

    pdf.text(

        new Date().toLocaleString("tr-TR"),

        105,

        288,

        {

            align: "center"

        }

    );
        // ===============================
    // Signature Area
    // ===============================

    pdf.setDrawColor(120);

    pdf.line(20, 245, 80, 245);
    pdf.line(130, 245, 190, 245);

    pdf.setFontSize(10);

    pdf.text(
        "Katılımcı İmzası",
        50,
        251,
        {
            align: "center"
        }
    );

    pdf.text(
        "Yetkili İmzası",
        160,
        251,
        {
            align: "center"
        }
    );


    // ===============================
    // Watermark
    // ===============================

    pdf.setTextColor(235);

    pdf.setFontSize(48);

    pdf.text(
        "TÜGVA",
        105,
        170,
        {
            angle: 45,
            align: "center"
        }
    );

    pdf.setTextColor(0);


    // ===============================
    // File Name
    // ===============================

    const safeName =
        (registration.adSoyad || "Katilimci")
            .replace(/[^\w\s]/g, "")
            .replace(/\s+/g, "_");

    const fileName =
        `${registration.kayitNo}_${safeName}.pdf`;


    // ===============================
    // Download
    // ===============================

    pdf.save(fileName);

}