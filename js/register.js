import {
    tcVarMi,
    toplamKayit,
    kayitOlustur,
    MAX_KONTENJAN
} from "./firebase.js";

export async function yeniKayit(veri) {
    try {

        const tc = (veri.tc || "").replace(/\D/g, "");

        if (!tc || tc.length !== 11) {
            return {
                basarili: false,
                mesaj: "Geçerli bir T.C. Kimlik Numarası giriniz."
            };
        }

        const varMi = await tcVarMi(tc);

        if (varMi) {
            return {
                basarili: false,
                mesaj: "Bu T.C. Kimlik Numarası ile daha önce kayıt yapılmıştır."
            };
        }

        const toplam = await toplamKayit();

        if (toplam >= MAX_KONTENJAN) {
            return {
                basarili: false,
                mesaj: "Kontenjan dolmuştur."
            };
        }

        const yil = new Date().getFullYear().toString().slice(-2);

        const kayitNo = `TYG${yil}-${String(toplam + 1).padStart(4, "0")}`;

        await kayitOlustur({
            kayitNo,
            adSoyad: veri.name?.trim() || "",
            tc,
            dogumTarihi: veri.birth || "",
            telefon: veri.phone?.trim() || "",
            email: veri.email?.trim().toLowerCase() || "",
            cinsiyet: veri.gender || "",
            acilDurumKisi: veri.emergencyName?.trim() || "",
            acilDurumTelefonu: veri.emergencyPhone?.trim() || "",
            not: veri.note?.trim() || ""
        });

        return {
            basarili: true,
            kayitNo,
            kalanKontenjan: MAX_KONTENJAN - (toplam + 1)
        };

    } catch (e) {

        console.error(e);

        return {
            basarili: false,
            mesaj: "Kayıt oluşturulurken bir hata oluştu."
        };
    }
}