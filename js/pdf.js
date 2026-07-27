<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
const { jsPDF } = window.jspdf;

/* ==========================================
   PDF OLUŞTUR
========================================== */

export async function downloadPDF(student){

    const pdf = new jsPDF({

        orientation: "portrait",

        unit: "mm",

        format: "a4"

    });

    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFont("helvetica","bold");

    pdf.setFontSize(20);

    pdf.text("TÜGVA Yaz Okulu", pageWidth/2,20,{
        align:"center"
    });

    pdf.setFontSize(15);

    pdf.text("Kayıt Belgesi",pageWidth/2,30,{
        align:"center"
    });

    pdf.setDrawColor(0);

    pdf.line(20,35,190,35);

    pdf.setFont("helvetica","normal");

    pdf.setFontSize(12);
        let y = 50;

    const row = (title,value)=>{

        pdf.setFont("helvetica","bold");

        pdf.text(title,20,y);

        pdf.setFont("helvetica","normal");

        pdf.text(String(value ?? "-"),70,y);

        y += 10;

    };

    row("Ad Soyad",student.name);

    row("TC Kimlik",student.tc);

    row("Telefon",student.phone);

    row("Veli",student.parent);

    row("Veli Telefon",student.parentPhone);

    row("Okul",student.school);

    row("Sınıf",student.class);

    row("Kayıt No",student.registerNumber);

    row("Koltuk No",student.seatNumber || "-");

    row("Kayıt Tarihi",student.createdAtText);
        const qrCanvas = document.querySelector("#qr canvas");

    if(qrCanvas){

        const image = qrCanvas.toDataURL("image/png");

        pdf.addImage(

            image,

            "PNG",

            145,

            45,

            40,

            40

        );

    }
        y += 10;

    pdf.setDrawColor(180);

    pdf.line(20, y, 190, y);

    y += 15;

    pdf.setFont("helvetica", "bold");

    pdf.text("Bilgilendirme", 20, y);

    y += 8;

    pdf.setFont("helvetica", "normal");

    pdf.setFontSize(11);

    pdf.text(
        "Bu belge TÜGVA Yaz Okulu kayıt sistemi tarafından oluşturulmuştur.",
        20,
        y
    );

    y += 7;

    pdf.text(
        "Kayıt sırasında verilen QR kodu giriş yoklamasında kullanılacaktır.",
        20,
        y
    );

    y += 7;

    pdf.text(
        "Lütfen bu belgeyi saklayınız.",
        20,
        y
    );

    y += 20;

    pdf.line(25, y, 80, y);

    pdf.line(130, y, 185, y);

    pdf.setFontSize(10);

    pdf.text("Veli İmzası", 40, y + 6);

    pdf.text("Görevli İmzası", 143, y + 6);
        const createdDate =
        new Date().toLocaleString("tr-TR");

    pdf.setFontSize(9);

    pdf.setTextColor(120);

    pdf.text(
        `Belge Oluşturulma Tarihi: ${createdDate}`,
        20,
        285
    );

    pdf.text(
        "© TÜGVA Yaz Okulu Kayıt Sistemi",
        190,
        285,
        {
            align: "right"
        }
    );
        const fileName = `${
        student.registerNumber || "Kayit"
    }-${
        (student.name || "Ogrenci")
            .replace(/\s+/g, "_")
    }.pdf`;

    pdf.save(fileName);

}