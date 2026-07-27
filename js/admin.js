// admin.js Düzeltme Paketi
// Parça 1/12

import{
authListener,
logout,
listenRegistrations,
getStatistics,
updateSeat,
deleteRegistration,
checkIn,
checkOut
}from"./firebase.js";

import{
exportCurrentData,
importExcel,
downloadTemplate
}from"./excel.js";

/* ===========================
   DOM
=========================== */

const totalCount=document.getElementById("totalCount");
const checkedCount=document.getElementById("checkedCount");
const waitingCount=document.getElementById("waitingCount");
const remainingCount=document.getElementById("remainingCount");

const participantTable=document.getElementById("participantTable");

const search=document.getElementById("search");

const statusFilter=document.getElementById("statusFilter");

const sortSelect=document.getElementById("sortSelect");

const exportExcel=document.getElementById("exportExcel");

const importExcelBtn=document.getElementById("importExcel");

const excelFile=document.getElementById("excelFile");

const refreshBtn=document.getElementById("refreshBtn");

const checkAllBtn=document.getElementById("checkAllBtn");

const uncheckAllBtn=document.getElementById("uncheckAllBtn");

const deleteSelectedBtn=document.getElementById("deleteSelectedBtn");

const logoutBtn=document.getElementById("logoutBtn");
// admin.js Düzeltme Paketi
// Parça 2/12

/* ===========================
   MODAL
=========================== */

const participantDialog=document.getElementById("participantDialog");

const participantDialogClose=document.getElementById("participantDialogClose");

const saveParticipantBtn=document.getElementById("saveParticipantBtn");

const detailRegisterNo=document.getElementById("detailRegisterNo");

const detailName=document.getElementById("detailName");

const detailTC=document.getElementById("detailTC");

const detailPhone=document.getElementById("detailPhone");

const detailParent=document.getElementById("detailParent");

const detailParentPhone=document.getElementById("detailParentPhone");

const detailSchool=document.getElementById("detailSchool");

const detailClass=document.getElementById("detailClass");

const detailStatus=document.getElementById("detailStatus");

const detailSeat=document.getElementById("detailSeat");

let participants=[];

let currentParticipant=null;
 // admin.js Düzeltme Paketi
// Parça 3/12

authListener(user=>{

if(!user){

location.href="login.html";

return;

}

});

logoutBtn.addEventListener(

"click",

async()=>{

await logout();

location.href="login.html";

}

);

async function refreshStatistics(){

const stats=

await getStatistics();

totalCount.textContent=

stats.total;

checkedCount.textContent=

stats.checked;

waitingCount.textContent=

stats.waiting;

remainingCount.textContent=

stats.remaining;

}
// admin.js Düzeltme Paketi
// Parça 4/12

listenRegistrations(data=>{

participants=data;

renderTable();

refreshStatistics();

});
// admin.js Düzeltme Paketi
// Parça 5/12

function filteredParticipants(){

let list=[...participants];

const keyword=

search.value

.toLowerCase()

.trim();

if(keyword){

list=list.filter(p=>

p.adSoyad

.toLowerCase()

.includes(keyword)

||

p.tc.includes(keyword)

||

p.telefon.includes(keyword)

||

p.kayitNo

.toLowerCase()

.includes(keyword)

);

}

if(statusFilter.value==="checked"){

list=list.filter(p=>p.checkedIn);

}

if(statusFilter.value==="waiting"){

list=list.filter(p=>!p.checkedIn);

}

switch(sortSelect.value){

case "name":

list.sort((a,b)=>

a.adSoyad.localeCompare(b.adSoyad)

);

break;

case "register":

list.sort((a,b)=>

a.kayitNo.localeCompare(b.kayitNo)

);

break;

case "seat":

list.sort((a,b)=>

(a.seat||999)

-

(b.seat||999)

);

break;

}

return list;

}
// admin.js Düzeltme Paketi
// Parça 6/12

function renderTable(){

const list=

filteredParticipants();

participantTable.innerHTML="";

if(list.length===0){

participantTable.innerHTML=`

<tr>

<td colspan="8">

Kayıt bulunamadı.

</td>

</tr>

`;

return;

}

list.forEach(item=>{

const tr=document.createElement("tr");

tr.innerHTML=`

<td>${item.kayitNo}</td>

<td>${item.adSoyad}</td>

<td>${item.telefon}</td>

<td>${item.seat||"-"}</td>

<td>

${item.checkedIn

?'<span class="status success">Geldi</span>'

:'<span class="status waiting">Bekliyor</span>'}

</td>

<td>

<button class="detailBtn">

Detay

</button>

</td>

`;

participantTable.appendChild(tr);

});
}
// admin.js Düzeltme Paketi
// Parça 7/12

participantTable.addEventListener("click",e=>{

const button=e.target.closest(".detailBtn");

if(!button){

return;

}

const row=button.closest("tr");

const registerNo=row.cells[0].textContent;

currentParticipant=

participants.find(

p=>p.kayitNo===registerNo

);

if(!currentParticipant){

return;

}

detailRegisterNo.textContent=currentParticipant.kayitNo;

detailName.value=currentParticipant.adSoyad;

detailTC.value=currentParticipant.tc;

detailPhone.value=currentParticipant.telefon;

detailParent.value=currentParticipant.veliAdi;

detailParentPhone.value=currentParticipant.veliTelefon;

detailSchool.value=currentParticipant.okul;

detailClass.value=currentParticipant.sinif;

detailStatus.textContent=

currentParticipant.checkedIn

?"Geldi"

:"Bekliyor";

detailSeat.value=

currentParticipant.seat||"";

participantDialog.showModal();

});
// admin.js Düzeltme Paketi
// Parça 8/12

participantDialogClose.addEventListener(

"click",

()=>{

participantDialog.close();

currentParticipant=null;

}

);

saveParticipantBtn.addEventListener(

"click",

async()=>{

if(!currentParticipant){

return;

}

await updateSeat(

currentParticipant.id,

detailSeat.value.trim()

);

participantDialog.close();

refreshStatistics();

}
);
// admin.js Düzeltme Paketi
// Parça 9/12

search.addEventListener(

"input",

renderTable

);

statusFilter.addEventListener(

"change",

renderTable

);

sortSelect.addEventListener(

"change",

renderTable

);

refreshBtn.addEventListener(

"click",

()=>{

renderTable();

refreshStatistics();

}
);
// admin.js Düzeltme Paketi
// Parça 10/12

exportExcel.addEventListener(

"click",

()=>{

exportCurrentData(participants);

}

);

importExcelBtn.addEventListener(

"click",

()=>{

excelFile.click();

}

);

excelFile.addEventListener(

"change",

async e=>{

const file=e.target.files[0];

if(!file){

return;

}

await importExcel(file);

excelFile.value="";

}

);
// admin.js Düzeltme Paketi
// Parça 11/12

checkAllBtn.addEventListener(

"click",

async()=>{

if(!currentParticipant){

return;

}

await checkIn(currentParticipant.id);

refreshStatistics();

}

);

uncheckAllBtn.addEventListener(

"click",

async()=>{

if(!currentParticipant){

return;

}

await checkOut(currentParticipant.id);

refreshStatistics();

}

);

deleteSelectedBtn.addEventListener(

"click",

async()=>{

if(!currentParticipant){

return;

}

const ok=

confirm(

`${currentParticipant.adSoyad} isimli katılımcı silinsin mi?`

);

if(!ok){

return;

}

await deleteRegistration(currentParticipant.id);

participantDialog.close();

refreshStatistics();

}
);
// admin.js Düzeltme Paketi
// Parça 12/12 (Son)

window.addEventListener(

"DOMContentLoaded",

()=>{

refreshStatistics();

renderTable();

}

);