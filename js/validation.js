export function sadeceRakam(deger) {

    return deger.replace(/\D/g, "");

}

export function tcGecerli(tc) {

    tc = sadeceRakam(tc);

    if (tc.length !== 11) return false;

    if (tc[0] === "0") return false;

    let tek = 0;
    let cift = 0;

    for (let i = 0; i < 9; i++) {

        if (i % 2 === 0) {

            tek += Number(tc[i]);

        } else {

            cift += Number(tc[i]);

        }

    }

    const onuncu = ((tek * 7) - cift) % 10;

    if (onuncu !== Number(tc[9])) {

        return false;

    }

    let toplam = 0;

    for (let i = 0; i < 10; i++) {

        toplam += Number(tc[i]);

    }

    return toplam % 10 === Number(tc[10]);

}

export function telefonGecerli(tel) {

    tel = sadeceRakam(tel);

    return tel.length === 10 || tel.length === 11;

}

export function emailGecerli(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

export function zorunluAlan(deger) {

    return deger.trim().length > 0;

}

export function bugundenSonraDegil(tarih) {

    if (!tarih) return false;

    const secilen = new Date(tarih);

    const bugun = new Date();

    bugun.setHours(0, 0, 0, 0);

    return secilen <= bugun;

}

export function formKontrol(veri) {

    if (!zorunluAlan(veri.name)) {

        return {
            basarili: false,
            mesaj: "Ad Soyad zorunludur."
        };

    }

    if (!tcGecerli(veri.tc)) {

        return {
            basarili: false,
            mesaj: "Geçerli bir T.C. Kimlik Numarası giriniz."
        };

    }

    if (!telefonGecerli(veri.phone)) {

        return {
            basarili: false,
            mesaj: "Telefon numarası hatalı."
        };

    }

    if (veri.email && !emailGecerli(veri.email)) {

        return {
            basarili: false,
            mesaj: "E-posta adresi geçersiz."
        };

    }

    if (!bugundenSonraDegil(veri.birth)) {

        return {
            basarili: false,
            mesaj: "Doğum tarihi hatalı."
        };

    }

    if (!zorunluAlan(veri.emergencyName)) {

        return {
            basarili: false,
            mesaj: "Acil durumda aranacak kişi zorunludur."
        };

    }

    if (!telefonGecerli(veri.emergencyPhone)) {

        return {
            basarili: false,
            mesaj: "Acil durum telefonu hatalı."
        };

    }

    return {

        basarili: true

    };

}