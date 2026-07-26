export async function pdfOlustur(katilimci){

    const kart = document.createElement("div");

    kart.style.width = "800px";
    kart.style.background = "#ffffff";
    kart.style.padding = "40px";
    kart.style.fontFamily = "Arial, sans-serif";
    kart.style.position = "fixed";
    kart.style.left = "-9999px";
    kart.style.top = "0";
    kart.style.boxSizing = "border-box";
    kart.style.border = "3px solid #0b8f3a";
    kart.style.borderRadius = "12px";

    kart.innerHTML = `

        <div style="text-align:center;">

            <h1 style="margin:0;color:#0b8f3a;">
                TÜGVA
            </h1>

            <h2 style="margin:10px 0;">
                Yaz Okulu Finali
            </h2>

            <h3 style="margin:0;color:#444;">
                İstanbul Gezisi Kayıt Kartı
            </h3>

        </div>

        <hr style="margin:25px 0;">

        <table style="width:100%;font-size:18px;border-collapse:collapse;">

            <tr>
                <td style="padding:8px 0;"><b>Kayıt No</b></td>
                <td>${katilimci.kayitNo}</td>
            </tr>

            <tr>
                <td style="padding:8px 0;"><b>Ad Soyad</b></td>
                <td>${katilimci.adSoyad}</td>
            </tr>

            <tr>
                <td style="padding:8px 0;"><b>T.C. Kimlik No</b></td>
                <td>${katilimci.tc}</td>
            </tr>

            <tr>
                <td style="padding:8px 0;"><b>Telefon</b></td>
                <td>${katilimci.telefon}</td>
            </tr>

        </table>

        <div style="margin-top:35px;display:flex;justify-content:center;">

            <div id="pdfQr"></div>

        </div>

        <p style="margin-top:35px;text-align:center;font-size:14px;color:#666;">
            Bu QR kod etkinlik girişinde okutulacaktır.
        </p>

    `;

    document.body.appendChild(kart);

    new QRCode(document.getElementById("pdfQr"), {

        text: JSON.stringify(katilimci),

        width: 220,

        height: 220,

        correctLevel: QRCode.CorrectLevel.H

    });

    await new Promise(resolve => setTimeout(resolve, 700));

    const canvas = await html2canvas(kart, {

        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"

    });

    const img = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();

    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 10;

    const imgWidth = pageWidth - margin * 2;

    const imgHeight = canvas.height * imgWidth / canvas.width;

    pdf.addImage(
        img,
        "PNG",
        margin,
        margin,
        imgWidth,
        Math.min(imgHeight, pageHeight - margin * 2)
    );

    pdf.setFontSize(10);

    pdf.setTextColor(120);

    pdf.text(
        "TÜGVA Yaz Okulu Finali ve İstanbul Gezisi",
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
    );

    pdf.save(`${katilimci.kayitNo}.pdf`);

    document.body.removeChild(kart);

}