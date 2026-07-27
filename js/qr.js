import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm";

const QR_OPTIONS = {

    width: 320,

    margin: 2,

    errorCorrectionLevel: "H",

    color: {

        dark: "#0b3d2e",

        light: "#ffffff"

    }

};

export function createQRPayload(registration) {

    return JSON.stringify({

        id: registration.id,

        registerNumber: registration.registerNumber,

        name: registration.name,

        tc: registration.tc,

        seat: registration.seat,

        checkedIn: registration.checkedIn

    });

}

export async function generateQRCode(registration) {

    const payload = createQRPayload(registration);

    return await QRCode.toDataURL(

        payload,

        QR_OPTIONS

    );

}

export async function drawQRCode(canvas, registration) {

    if (!(canvas instanceof HTMLCanvasElement)) {

        throw new Error("Canvas bulunamadı.");

    }

    const payload = createQRPayload(registration);

    await QRCode.toCanvas(

        canvas,

        payload,

        QR_OPTIONS

    );

    return canvas;

}

export async function createQRCodeImage(registration) {

    return await generateQRCode(registration);

}
export async function downloadQRCode(registration) {

    const qr = await generateQRCode(registration);

    const link = document.createElement("a");

    link.href = qr;

    link.download = `${registration.registerNumber}.png`;

    document.body.appendChild(link);

    link.click();

    link.remove();

}

export async function qrToBlob(registration) {

    const qr = await generateQRCode(registration);

    const response = await fetch(qr);

    return await response.blob();

}

export async function qrToImageElement(registration) {

    const image = new Image();

    image.src = await generateQRCode(registration);

    await new Promise((resolve, reject) => {

       export async function renderQRCode(imgElement, registration) {

    if (!(imgElement instanceof HTMLImageElement)) {

        throw new Error("QR görüntü alanı bulunamadı.");

    }

    const qrDataUrl = await generateQRCode(registration);

    imgElement.src = qrDataUrl;

    imgElement.alt = `${registration.registerNumber} QR`;

    return qrDataUrl;

}

export async function downloadQRCode(registration) {

    const qrDataUrl = await generateQRCode(registration);

    const link = document.createElement("a");

    link.href = qrDataUrl;

    link.download = `${registration.registerNumber}.png`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

}

export function clearQRCode(element) {

    if (!element) {

        return;

    }

    if (element instanceof HTMLImageElement) {

        element.removeAttribute("src");

    }

    if (element instanceof HTMLCanvasElement) {

        const context = element.getContext("2d");

        context.clearRect(

            0,

            0,

            element.width,

            element.height

        );

    }

}
export function parseQRCode(qrContent) {

    if (!qrContent) {

        throw new Error("QR verisi boş.");

    }

    let data;

    try {

        data = JSON.parse(qrContent);

    } catch {

        throw new Error("QR verisi okunamadı.");

    }

    return {

        id: data.id ?? "",

        registerNumber: data.registerNumber ?? "",

        name: data.name ?? "",

        tc: data.tc ?? "",

        seat: data.seat ?? "",

        checkedIn: Boolean(data.checkedIn)

    };

}

export function isValidQRCode(qrContent) {

    try {

        const data = parseQRCode(qrContent);

        return (

            data.id !== "" &&

            data.registerNumber !== "" &&

            data.name !== "" &&

            data.tc.length === 11

        );

    } catch {

        return false;

    }

}

export function getQRCodeText(registration) {

    return createQRPayload(registration);

}

export async function regenerateQRCode(registration) {

    return await generateQRCode(registration);

}
export async function createRegistrationQR(registration) {

    const qrImage = await generateQRCode(registration);

    return {

        registerNumber: registration.registerNumber,

        qr: qrImage

    };

}

export async function updateQRCode(target, registration) {

    if (target instanceof HTMLImageElement) {

        await renderQRCode(target, registration);

        return;

    }

    if (target instanceof HTMLCanvasElement) {

        await drawQRCode(target, registration);

        return;

    }

    throw new Error("Geçersiz QR hedefi.");

}

export function getQRFileName(registration) {

    return `${registration.registerNumber}_QR.png`;

}

export async function qrToBlob(registration) {

    const dataUrl = await generateQRCode(registration);

    const response = await fetch(dataUrl);

    return await response.blob();

}

export async function qrToFile(registration) {

    const blob = await qrToBlob(registration);

    return new File(

        [blob],

        getQRFileName(registration),

        {

            type: "image/png"

        }

    );

}

export default {

    createQRPayload,

    generateQRCode,

    drawQRCode,

    createQRCodeImage,

    renderQRCode,

    downloadQRCode,

    clearQRCode,

    parseQRCode,

    isValidQRCode,

    getQRCodeText,

    regenerateQRCode,

    createRegistrationQR,

    updateQRCode,

    getQRFileName,

    qrToBlob,

    qrToFile

};