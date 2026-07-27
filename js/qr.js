
/* ==========================================
   QR OLUŞTUR
========================================== */

export function createQR(text, elementId = "qr") {

    const container = document.getElementById(elementId);

    if (!container) return;

    container.innerHTML = "";

    new QRCode(container, {
        text: String(text),
        width: 220,
        height: 220,
        correctLevel: QRCode.CorrectLevel.H
    });

}
/* ==========================================
   QR TEMİZLE
========================================== */

export function clearQR(elementId = "qr") {

    const container = document.getElementById(elementId);

    if (container) {

        container.innerHTML = "";

    }

}
/* ==========================================
   QR OKUYUCU
========================================== */

let scanner = null;

export async function startScanner(onSuccess) {

    if (scanner) {

        return;

    }

    scanner = new Html5Qrcode("qr-reader");

    await scanner.start(

        {
            facingMode: "environment"
        },

        {
            fps: 10,
            qrbox: 250
        },

        decodedText => {

            if (typeof onSuccess === "function") {

                onSuccess(decodedText);

            }

        }

    );

}
/* ==========================================
   DURDUR
========================================== */

export async function stopScanner() {

    if (!scanner) return;

    await scanner.stop();

    await scanner.clear();

    scanner = null;

}
/* ==========================================
   QR VERİSİNİ AYRIŞTIR
========================================== */

export function parseQR(text){

    if(!text){

        return null;

    }

    return String(text).trim();

}
/* ==========================================
   TEK OKUMA
========================================== */

export async function scanOnce(callback){

    await startScanner(async result=>{

        try{

            await stopScanner();

        }catch(e){}

        if(typeof callback==="function"){

            callback(parseQR(result));

        }

    });

}
/* ==========================================
   GEÇERLİ QR
========================================== */

export function isValidQR(text){

    if(!text){

        return false;

    }

    const value=String(text).trim();

    return value.length>0;

}
/* ==========================================
   DURUM
========================================== */

export function scannerRunning(){

    return scanner!==null;

}
/* ==========================================
   RESTART
========================================== */

export async function restartScanner(callback){

    if(scanner){

        await stopScanner();

    }

    await startScanner(callback);

}