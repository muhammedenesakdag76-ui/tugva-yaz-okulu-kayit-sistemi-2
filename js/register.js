import {
    tcVarMi,
    toplamKayit,
    kayitOlustur,
    MAX_KONTENJAN
} from "./firebase.js";

function temizle(veri){

    return{

        name:(veri.name||"").trim(),

        tc:(veri.tc||"").replace(/\D/g,""),

        birth:veri.birth||"",

        phone:(veri.phone||"").trim(),

        email:(veri.email||"").trim().toLowerCase(),

        gender:veri.gender||"",

        emergencyName:(veri.emergencyName||"").trim(),

        emergencyPhone:(veri.emergencyPhone||"").trim(),

        note:(veri.note||"").trim()

    };

}

export async function yeniKayit(veri){

    veri=temizle(veri);

    try{

        const tcKayitli=await tcVarMi(veri.tc);

        if(tcKayitli){

            return{

                basarili:false,

                mesaj:"Bu T.C. Kimlik Numarası ile daha önce kayıt yapılmıştır."

            };

        }

        const toplam=await toplamKayit();

        if(toplam>=MAX_KONTENJAN){

            return{

                basarili:false,

                mesaj:"Kontenjan dolmuştur."

            };

        }

        const yil=new Date()
            .getFullYear()
            .toString()
            .slice(2);

        const kayitNo=`TYG${yil}-${String(toplam+1).padStart(4,"0")}`;

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

            kalanKontenjan:Math.max(

                0,

                MAX_KONTENJAN-(toplam+1)

            )

        };

    }catch(err){

        console.error(err);

        return{

            basarili:false,

            mesaj:"Kayıt oluşturulurken bir hata oluştu."

        };

    }

}