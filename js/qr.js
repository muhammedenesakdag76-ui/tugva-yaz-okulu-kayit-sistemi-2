// qr.js
// Profesyonel Sürüm
// Parça 1/6

let qrInstance=null;

export function generateQR(

text,

elementId="qrcode"

){

const container=

document.getElementById(

elementId

);

container.innerHTML="";

qrInstance=

new QRCode(

container,

{

text,

width:220,

height:220,

colorDark:"#000",

colorLight:"#fff",

correctLevel:

QRCode.CorrectLevel.H

}

);

}
// qr.js
// Parça 2/6

export function clearQR(

elementId="qrcode"

){

const container=

document.getElementById(

elementId

);

container.innerHTML="";

qrInstance=null;

}

export function hasQR(){

return qrInstance!==null;

}
// qr.js
// Parça 3/6

export function getQRImage(

elementId="qrcode"

){

const container=

document.getElementById(

elementId

);

const img=

container.querySelector("img");

if(img){

return img.src;

}

const canvas=

container.querySelector("canvas");

if(canvas){

return canvas.toDataURL(

"image/png"

);

}

return null;

}
// qr.js
// Parça 4/6

export function downloadQR(

filename="qr.png",

elementId="qrcode"

){

const image=

getQRImage(

elementId

);

if(!image)return;

const a=

document.createElement("a");

a.href=image;

a.download=filename;

a.click();

}
// qr.js
// Parça 5/6

export function printQR(

elementId="qrcode"

){

const image=

getQRImage(

elementId

);

if(!image)return;

const w=

window.open(

"",

"_blank"

);

w.document.write(`

<img
src="${image}"
style="width:300px">

`);

w.document.close();

w.print();

}
// qr.js
// Parça 6/6 (Son)

export function regenerateQR(

text,

elementId="qrcode"

){

clearQR(

elementId

);

generateQR(

text,

elementId

);

}