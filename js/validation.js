function bosMu(deger){

return deger===undefined||

deger===null||

String(deger).trim()==="";

}

export function tcKontrol(tc){

if(!/^\d{11}$/.test(tc)){

return false;

}

if(tc[0]==="0"){

return false;

}

let tek=0;

let cift=0;

for(let i=0;i<9;i++){

if(i%2===0){

tek+=Number(tc[i]);

}else{

cift+=Number(tc[i]);

}

}

const onuncu=((tek*7)-cift)%10;

if(onuncu!==Number(tc[9])){

return false;

}

let toplam=0;

for(let i=0;i<10;i++){

toplam+=Number(tc[i]);

}

const onBirinci=toplam%10;

return onBirinci===Number(tc[10]);

}

export function telefonKontrol(tel){

return /^05\d{9}$/.test(tel);

}

export function emailKontrol(email){

if(email.trim()===""){

return true;

}

return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

export function yasHesapla(dogum){

const tarih=new Date(dogum);

const bugun=new Date();

let yas=

bugun.getFullYear()-tarih.getFullYear();

const ay=

bugun.getMonth()-tarih.getMonth();

if(

ay<0||

(ay===0&&

bugun.getDate()<tarih.getDate())

){

yas--;

}

return yas;

}

export function formKontrol(veri){

if(bosMu(veri.name)){

return"Ad Soyad zorunludur.";

}

if(!tcKontrol(veri.tc)){

return"Geçerli bir T.C. Kimlik Numarası giriniz.";

}

if(bosMu(veri.birth)){

return"Doğum tarihi zorunludur.";

}

if(!telefonKontrol(veri.phone)){

return"Telefon numarası hatalı.";

}

if(!emailKontrol(veri.email)){

return"E-posta adresi geçersiz.";

}

if(bosMu(veri.gender)){

return"Cinsiyet seçiniz.";

}

const yas=yasHesapla(veri.birth);

if(yas<18&&!veri.parent){

return"18 yaş altı katılımcılar veli onayını işaretlemelidir.";

}

if(!veri.kvkk){

return"KVKK onayı zorunludur.";

}

return null;

}