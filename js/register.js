import{

tcVarMi,

toplamKayit,

kayitOlustur

}from"./firebase.js";

const MAKSIMUM_KONTENJAN=85;

function kayitNumarasiOlustur(sira){

return"TYG-"+String(sira).padStart(4,"0");

}

export async function yeniKayit(veri){

const tcKayitli=await tcVarMi(veri.tc);

if(tcKayitli){

throw new Error(

"Bu T.C. Kimlik Numarası ile daha önce kayıt yapılmış."

);

}

const toplam=await toplamKayit();

if(toplam>=MAKSIMUM_KONTENJAN){

throw new Error(

"Kontenjan dolmuştur."

);

}

const kayitNo=kayitNumarasiOlustur(

toplam+1

);

await kayitOlustur({

kayitNo,

adSoyad:veri.name,

tc:veri.tc,

dogumTarihi:veri.birth,

telefon:veri.phone,

email:veri.email,

cinsiyet:veri.gender,

acilDurumKisi:veri.emergencyName,

acilDurumTelefonu:veri.emergencyPhone,

not:veri.note

});

return{

basarili:true,

kayitNo,

kalanKontenjan:

MAKSIMUM_KONTENJAN-(toplam+1)

};

}