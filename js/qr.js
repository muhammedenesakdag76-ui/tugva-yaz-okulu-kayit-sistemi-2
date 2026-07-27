import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm";

function createPayload(registration) {

    return JSON.stringify({

        id: registration.id,

        registerNumber: registration.registerNumber,

        name: registration.name,

        tc: registration.tc

    });

}

export async function generateQRCode(target, registration) {

    if (!target) {

        return;

    }

    target.innerHTML = "";

    const canvas = document.createElement("canvas");

    await QRCode.toCanvas(

        canvas,

        createPayload(registration),

        {

            width: 240,

            margin: 2,

            errorCorrectionLevel: "H"

        }

    );

    target.appendChild(canvas);

}
export async function createQRCodeDataURL(registration) {

    return await QRCode.toDataURL(

        createPayload(registration),

        {

            width: 600,

            margin: 2,

            errorCorrectionLevel: "H"

        }

    );

}

export async function downloadQRCode(registration) {

    const url = await createQRCodeDataURL(

        registration

    );

    const link = document.createElement("a");

    link.href = url;

    link.download =

        `${registration.registerNumber}.png`;

    link.click();

}
export function parseQRCode(text) {

    try {

        return JSON.parse(text);

    }

    catch {

        return null;

    }

}

export function isQRCodeValid(text) {

    const qr = parseQRCode(text);

    if (!qr) {

        return false;

    }

    return Boolean(

        qr.registerNumber &&

        qr.id

    );

}
export default {

    generateQRCode,

    createQRCodeDataURL,

    downloadQRCode,

    parseQRCode,

    isQRCodeValid

};