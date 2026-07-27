import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm";

export async function generateQRCode(text, canvas) {

    if (!canvas) {
        throw new Error("Canvas bulunamadı.");
    }

    await QRCode.toCanvas(canvas, text, {

        width: 300,

        margin: 2,

        errorCorrectionLevel: "H",

        color: {

            dark: "#000000",

            light: "#FFFFFF"

        }

    });

    return canvas;

}

export async function registrationQR(registration) {

    return JSON.stringify({

        id: registration.id,

        registerNumber: registration.registerNumber,

        name: registration.name,

        tc: registration.tc

    });

}

export async function drawRegistrationQR(registration, canvas) {

    const text = await registrationQR(registration);

    return await generateQRCode(text, canvas);

}
export function downloadQR(canvas, fileName = "qr.png") {

    const link = document.createElement("a");

    link.download = fileName;

    link.href = canvas.toDataURL("image/png");

    link.click();

}

export function qrToImage(canvas) {

    return canvas.toDataURL("image/png");

}

export function clearQR(canvas) {

    const ctx = canvas.getContext("2d");

    ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );

}
export function parseQR(text) {

    try {

        return JSON.parse(text);

    }

    catch {

        return null;

    }

}

export function isValidQR(data) {

    if (!data) return false;

    return (

        data.id &&

        data.registerNumber &&

        data.name &&

        data.tc

    );

}
export async function createRegistrationQR(registration, canvas) {

    await drawRegistrationQR(

        registration,

        canvas

    );

    return {

        image: qrToImage(canvas),

        canvas

    };

}

export default {

    generateQRCode,

    registrationQR,

    drawRegistrationQR,

    createRegistrationQR,

    downloadQR,

    parseQR,

    isValidQR,

    clearQR

};