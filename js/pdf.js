// pdf.js
// Profesyonel Sürüm
// Parça 1/8

import {

getQRImage

}

from "./qr.js";

const {

jsPDF

}=window;

export function createPDF(

participant

){

const pdf=

new jsPDF({

orientation:"portrait",

unit:"mm",

format:"a4"

});

drawHeader(

pdf

);

drawParticipant(

pdf,

participant

);

drawQR(

pdf

);

drawFooter(

pdf

);

return pdf;

}
// pdf.js
// Parça 2/8

function drawHeader(pdf){

pdf.setFont(

"helvetica",

"bold"

);

pdf.setFontSize(22);

pdf.text(

"TÜGVA Yaz Okulu",

105,

20,

{

align:"center"

}

);

pdf.setFontSize(14);

pdf.setFont(

"helvetica",

"normal"

);

pdf.text(

"Kayıt Belgesi",

105,

29,

{

align:"center"

}

);

pdf.line(

15,

35,

195,

35

);

}
// pdf.js
// Parça 3/8

function drawParticipant(

pdf,

p

){

let y=48;

const rows=[

["Kayıt No",p.kayitNo],

["Ad Soyad",p.adSoyad],

["TC Kimlik",p.tc],

["Telefon",p.telefon],

["Okul",p.okul],

["Sınıf",p.sinif],

["Veli",p.veliAdi],

["Veli Telefon",p.veliTelefon],

["Adres",p.adres]

];

rows.forEach(r=>{

pdf.setFont(

"helvetica",

"bold"

);

pdf.text(

r[0]+":",

20,

y

);

pdf.setFont(

"helvetica",

"normal"

);

pdf.text(

String(r[1]||""),

70,

y

);

y+=10;

});

}
// pdf.js
// Parça 4/8

function drawQR(pdf){

const img=

getQRImage();

if(!img){

return;

}

pdf.addImage(

img,

"PNG",

145,

45,

45,

45

);

}
// pdf.js
// Parça 5/8

function drawFooter(pdf){

pdf.setDrawColor(

180

);

pdf.line(

15,

275,

195,

275

);

pdf.setFontSize(

10

);

pdf.text(

"TÜGVA Yaz Okulu Kayıt Sistemi",

105,

283,

{

align:"center"

}

);

}
// pdf.js
// Parça 6/8

export function downloadPDF(

participant

){

const pdf=

createPDF(

participant

);

pdf.save(

`${participant.kayitNo}.pdf`

);

}
// pdf.js
// Parça 7/8

export function previewPDF(

participant

){

const pdf=

createPDF(

participant

);

window.open(

pdf.output(

"bloburl"

),

"_blank"

);

}
// pdf.js
// Parça 8/8 (Son)

export function printPDF(

participant

){

const pdf=

createPDF(

participant

);

const url=

pdf.output(

"bloburl"

);

const win=

window.open(

url

);

win.onload=

()=>win.print();

}