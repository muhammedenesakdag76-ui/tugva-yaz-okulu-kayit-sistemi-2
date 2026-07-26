let qr = null;

export async function qrOlustur(katilimci) {

    const alan = document.getElementById("qr");

    alan.innerHTML = "";

    const veri = {

        kayitNo: katilimci.kayitNo,
        adSoyad: katilimci.adSoyad,
        tc: katilimci.tc,
        telefon: katilimci.telefon,
        tarih: new Date().toISOString(),
        etkinlik: "TÜGVA Yaz Okulu Finali ve İstanbul Gezisi"

    };

    qr = new QRCode(alan, {

        text: JSON.stringify(veri),

        width: 240,

        height: 240,

        correctLevel: QRCode.CorrectLevel.H

    });

    return veri;

}

export function qrTemizle() {

    const alan = document.getElementById("qr");

    alan.innerHTML = "";

    qr = null;

}

export function qrVerisiOlustur(katilimci) {

    return JSON.stringify({

        kayitNo: katilimci.kayitNo,
        adSoyad: katilimci.adSoyad,
        tc: katilimci.tc,
        telefon: katilimci.telefon,
        etkinlik: "TÜGVA Yaz Okulu Finali ve İstanbul Gezisi"

    });

}