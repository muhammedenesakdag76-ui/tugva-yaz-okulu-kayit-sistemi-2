export async function pdfOlustur(katilimci){

    const kart=document.createElement("div");

    kart.style.width="800px";
    kart.style.background="#ffffff";
    kart.style.padding="40px";
    kart.style.fontFamily="Arial";
    kart.style.position="fixed";
    kart.style.left="-9999px";

    kart.innerHTML=`

        <h1 style="color:#0b8f3a;text-align:center;">
        TÜGVA Yaz Okulu
        </h1>

        <h2 style="text-align:center;">
        İstanbul Gezisi Kayıt Kartı
        </h2>

        <hr>

        <p><b>Kayıt No:</b> ${katilimci.kayitNo}</p>

        <p><b>Ad Soyad:</b> ${katilimci.adSoyad}</p>

        <p><b>T.C.:</b> ${katilimci.tc}</p>

        <p><b>Telefon:</b> ${katilimci.telefon}</p>

        <br>

        <div id="pdfQr" style="display:flex;justify-content:center;"></div>

    `;

    document.body.appendChild(kart);

    new QRCode(document.getElementById("pdfQr"),{

        text:JSON.stringify(katilimci),

        width:180,

        height:180

    });

    await new Promise(r=>setTimeout(r,500));

    const canvas=await html2canvas(kart);

    const img=canvas.toDataURL("image/png");

    const pdf=new jspdf.jsPDF();

    pdf.addImage(img,"PNG",10,10,190,260);

    pdf.save(`${katilimci.kayitNo}.pdf`);

    document.body.removeChild(kart);

}