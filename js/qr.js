export function generateQR(kayitNo) {

    console.log("generateQR çalıştı", kayitNo);

    const alan = document.getElementById("qrcode");

    if (!alan) return;

    alan.innerHTML = "";

    new QRCode(alan, {

        text: kayitNo,
        width: 220,
        height: 220,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H

    });

}

export function qrResmiAl() {

    const canvas = document.querySelector("#qrcode canvas");

    if (canvas) {

        return canvas.toDataURL("image/png");

    }

    const img = document.querySelector("#qrcode img");

    if (img) {

        return img.src;

    }

    return null;

}

export function qrIndir(kayitNo) {

    const veri = qrResmiAl();

    if (!veri) {

        alert("QR kod oluşturulamadı.");

        return;

    }

    const link = document.createElement("a");

    link.href = veri;

    link.download = `${kayitNo}-QR.png`;

    link.click();

}

window.generateQR = generateQR;
window.qrIndir = qrIndir;