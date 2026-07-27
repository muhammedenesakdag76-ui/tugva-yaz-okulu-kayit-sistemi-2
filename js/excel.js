// excel.js
// Parça 1/10

export function exportExcel(data){

const rows=data.map(item=>({

"Kayıt No":item.kayitNo,

"Ad Soyad":item.adSoyad,

"TC":item.tc,

"Telefon":item.telefon,

"Okul":item.okul,

"Sınıf":item.sinif,

"Veli":item.veliAdi,

"Veli Telefon":item.veliTelefon,

"Koltuk":item.seat,

"Durum":item.checkedIn

?"Giriş"

:"Bekliyor"

}));

const workbook=

XLSX.utils.book_new();

const worksheet=

XLSX.utils.json_to_sheet(rows);

XLSX.utils.book_append_sheet(

workbook,

worksheet,

"Katılımcılar"

);

XLSX.writeFile(

workbook,

"Katilimcilar.xlsx"

);

}
// excel.js
// Parça 2/10

export function readExcel(file){

return new Promise(

(resolve,reject)=>{

const reader=

new FileReader();

reader.onload=e=>{

const data=

new Uint8Array(

e.target.result

);

const workbook=

XLSX.read(

data,

{

type:"array"

}

);

const sheet=

workbook.Sheets[

workbook.SheetNames[0]

];

resolve(

XLSX.utils.sheet_to_json(

sheet

)

);

};

reader.onerror=reject;

reader.readAsArrayBuffer(

file

);

}

);

}
// excel.js
// Parça 3/10

import{

createRegistration,

generateRegisterNumber

}

from "./firebase.js";

export async function importExcel(file){

const rows=

await readExcel(file);

for(const row of rows){

await createRegistration({

kayitNo:

await generateRegisterNumber(),

adSoyad:

row["Ad Soyad"],

tc:

String(row["TC"]),

telefon:

String(row["Telefon"]),

email:"",

dogumTarihi:"",

cinsiyet:"",

okul:

row["Okul"],

sinif:

row["Sınıf"],

veliAdi:

row["Veli"],

veliTelefon:

String(

row["Veli Telefon"]

),

adres:"",

not:""

});

}

}
// excel.js
// Parça 4/10

export function validateExcel(rows){

if(!rows.length){

return false;

}

return(

rows[0]["Ad Soyad"]!==undefined&&

rows[0]["Telefon"]!==undefined

);

}
// excel.js
// Parça 5/10

export function downloadTemplate(){

const workbook=

XLSX.utils.book_new();

const worksheet=

XLSX.utils.json_to_sheet([{

"Ad Soyad":"",

"TC":"",

"Telefon":"",

"Okul":"",

"Sınıf":"",

"Veli":"",

"Veli Telefon":""

}]);

XLSX.utils.book_append_sheet(

workbook,

worksheet,

"Şablon"

);

XLSX.writeFile(

workbook,

"Sablon.xlsx"

);

}
// excel.js
// Parça 6/10

import{

getAllRegistrations,

batchCheckIn,

batchCheckOut,

batchDelete

}

from "./firebase.js";

export async function exportCurrentData(){

const data=

await getAllRegistrations();

exportExcel(

data

);

}
// excel.js
// Parça 7/10

export async function exportCheckedIn(){

const data=

await getAllRegistrations();

const checked=

data.filter(

x=>x.checkedIn

);

exportExcel(

checked

);

}
// excel.js
// Parça 8/10

export async function exportWaiting(){

const data=

await getAllRegistrations();

const waiting=

data.filter(

x=>!x.checkedIn

);

exportExcel(

waiting

);

}
// excel.js
// Parça 9/10

export async function deleteImported(ids){

await batchDelete(

ids

);

}

export async function checkImported(ids){

await batchCheckIn(

ids

);

}

export async function uncheckImported(ids){

await batchCheckOut(

ids

);
}
// excel.js
// Parça 10/10 (Son)

export function formatExcelDate(value){

if(typeof value==="number"){

return new Date(

(value-25569)

*86400

*1000

);

}

return value;

}