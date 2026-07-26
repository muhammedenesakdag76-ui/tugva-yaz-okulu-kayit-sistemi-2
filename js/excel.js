export function excelAktar(kayitlar){

    const veri = kayitlar.map(k => ({

        "Kayıt No": k.kayitNo,
        "Ad Soyad": k.adSoyad,
        "T.C. Kimlik": k.tc,
        "Doğum Tarihi": k.dogumTarihi,
        "Telefon": k.telefon,
        "E-posta": k.email || "",
        "Cinsiyet": k.cinsiyet,
        "Acil Durum Kişisi": k.acilDurumKisi || "",
        "Acil Durum Telefonu": k.acilDurumTelefonu || "",
        "Not": k.not || "",
        "Check-in": k.checkin ? "Yapıldı" : "Bekliyor"

    }));

    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.json_to_sheet(veri);

    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Katılımcılar"

    );

    XLSX.writeFile(

        workbook,

        "TUGVA_Katilimcilar.xlsx"

    );

}