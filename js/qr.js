// ===============================
// QR Code Module
// ===============================

let qrInstance = null;


// ===============================
// Generate QR
// ===============================

export function generateQR(text, elementId = "qrcode") {

    const container =
        document.getElementById(elementId);

    if (!container)
        return;

    container.innerHTML = "";

    qrInstance = new QRCode(container, {

        text,

        width: 220,

        height: 220,

        colorDark: "#111827",

        colorLight: "#ffffff",

        correctLevel: QRCode.CorrectLevel.H

    });

}


// ===============================
// Clear QR
// ===============================

export function clearQR(elementId = "qrcode") {

    const container =
        document.getElementById(elementId);

    if (!container)
        return;

    container.innerHTML = "";

    qrInstance = null;

}


// ===============================
// Download QR
// ===============================

export function downloadQR(fileName = "qr-code") {

    const canvas =
        document.querySelector("#qrcode canvas");

    if (!canvas)
        return;

    const link =
        document.createElement("a");

    link.download =
        `${fileName}.png`;

    link.href =
        canvas.toDataURL("image/png");

    link.click();

}
// ===============================
// Get QR Image
// ===============================

export function getQRImage() {

    const canvas =
        document.querySelector("#qrcode canvas");

    if (!canvas)
        return null;

    return canvas.toDataURL("image/png");

}


// ===============================
// Print QR
// ===============================

export function printQR() {

    const image =
        getQRImage();

    if (!image)
        return;

    const win =
        window.open("", "_blank");

    win.document.write(`

        <html>

        <head>

        <title>QR Kod</title>

        </head>

        <body style="display:flex;justify-content:center;align-items:center;height:100vh;">

        <img src="${image}" style="width:300px;">

        </body>

        </html>

    `);

    win.document.close();

    win.print();

}


// ===============================
// QR Exists
// ===============================

export function hasQR() {

    return document.querySelector("#qrcode canvas") !== null;

}