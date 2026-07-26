import {
    tcVarMi,
    toplamKayit,
    kayitOlustur
} from "./firebase.js";

const MAX_KONTENJAN = import { MAX_KONTENJAN } from "./firebase.js";;

export async function yeniKayit(veri) {

    veri.name = veri.name.trim();
    veri.tc = veri.tc.trim();
    veri.phone = veri.phone.trim();

    const tcKayitli = await tcVarMi(veri.tc);

    if (tcKayitli) {
        throw new Error("Bu T.C. Kimlik Numarası ile daha önce kayıt yapılmış.");
    }

    const toplam = await toplamKayit();

    if (toplam >= MAX_KONTENJAN) {
        throw new Error("Kontenjan dolmuştur.");
    }

    const tarih = new Date();
    const yil = tarih.getFullYear().toString().slice(2);

    const kayitNo = `TYG${yil}-${String(toplam + 1).padStart(4, "0")}`;

    await kayitOlustur({
        kayitNo,
        adSoyad: veri.name,
        tc: veri.tc,
        dogumTarihi: veri.birth,
        telefon: veri.phone,
        email: veri.email,
        cinsiyet: veri.gender,
        acilDurumKisi: veri.emergencyName,
        acilDurumTelefonu: veri.emergencyPhone,
        not: veri.note
    });

    return {
        basarili: true,
        kayitNo,
        kalanKontenjan: MAX_KONTENJAN - (toplam + 1)
    };

}