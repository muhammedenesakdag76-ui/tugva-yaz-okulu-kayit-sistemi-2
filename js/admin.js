// admin.js
// Profesyonel Sürüm
// Parça 1/12

import {
    authListener,
    logout,
    listenRegistrations,
    getStatistics,
    updateSeat,
    deleteRegistration,
    checkIn,
    checkOut
} from "./firebase.js";

const table =
document.getElementById("participantTable");

const search =
document.getElementById("search");

const statusFilter =
document.getElementById("statusFilter");

const sortSelect =
document.getElementById("sortSelect");

const totalCount =
document.getElementById("totalCount");

const checkedCount =
document.getElementById("checkedCount");

const waitingCount =
document.getElementById("waitingCount");

const remainingCount =
document.getElementById("remainingCount");

const loading =
document.getElementById("loadingOverlay");

const emptyState =
document.getElementById("emptyState");

const logoutBtn =
document.getElementById("logoutBtn");

let participants = [];

let filtered = [];

let selectedParticipant = null;

authListener(user=>{

if(!user){

location.href="login.html";

}

});

logoutBtn.addEventListener(

"click",

async()=>{

await logout();

location.href="login.html";

}

);
// admin.js
// Parça 2/12

function showLoading(show=true){

loading.classList.toggle(
"hidden",
!show
);

}

async function loadStatistics(){

const stats=
await getStatistics();

totalCount.textContent=
stats.total;

checkedCount.textContent=
stats.checkedIn;

waitingCount.textContent=
stats.waiting;

remainingCount.textContent=
stats.remaining;

}

function updateEmptyState(){

emptyState.classList.toggle(

"hidden",

filtered.length!==0

);

}

function applyFilters(){

const keyword=
search.value
.trim()
.toLowerCase();

const status=
statusFilter.value;

filtered=
participants.filter(item=>{

const matchSearch=

item.adSoyad
.toLowerCase()
.includes(keyword)

||

item.kayitNo
.toLowerCase()
.includes(keyword)

||

item.tc
.includes(keyword)

||

item.telefon
.includes(keyword);

let matchStatus=true;

if(status==="checked"){

matchStatus=
item.checkedIn;

}

if(status==="waiting"){

matchStatus=
!item.checkedIn;

}

return(
matchSearch&&
matchStatus
);

});

sortParticipants();

renderTable();

updateEmptyState();

}
// admin.js
// Parça 3/12

function sortParticipants(){

switch(sortSelect.value){

case "name":

filtered.sort(

(a,b)=>

a.adSoyad.localeCompare(

b.adSoyad,

"tr"

)

);

break;

case "oldest":

filtered.sort(

(a,b)=>

a.createdAt?.seconds-

b.createdAt?.seconds

);

break;

case "seat":

filtered.sort(

(a,b)=>

(a.seat||"")

.localeCompare(

b.seat||"",

"tr"

)

);

break;

default:

filtered.sort(

(a,b)=>

b.createdAt?.seconds-

a.createdAt?.seconds

);

}

}
// admin.js
// Parça 4/12

function renderTable(){

table.innerHTML="";

filtered.forEach(item=>{

const tr=
document.createElement("tr");

tr.innerHTML=`

<td>

<input
type="checkbox"
class="row-checkbox"
data-id="${item.kayitNo}">

</td>

<td>${item.kayitNo}</td>

<td>${item.adSoyad}</td>

<td>${item.telefon}</td>

<td>${item.okul}</td>

<td>

<input

class="seat-input"

data-id="${item.kayitNo}"

value="${item.seat||""}"

maxlength="5">

</td>

<td>

<span class="status ${item.checkedIn?"checked":"waiting"}">

${item.checkedIn?"Giriş":"Bekliyor"}

</span>

</td>

<td>

<button

class="view-btn"

data-id="${item.kayitNo}">

Detay

</button>

<button

class="check-btn"

data-id="${item.kayitNo}">

${item.checkedIn?"Çıkış":"Giriş"}

</button>

<button

class="delete-btn"

data-id="${item.kayitNo}">

Sil

</button>

</td>

`;

table.appendChild(tr);

});

bindRowEvents();

}
// admin.js
// Parça 5/12

function bindRowEvents(){

document

.querySelectorAll(".seat-input")

.forEach(input=>{

input.addEventListener(

"change",

async()=>{

await updateSeat(

input.dataset.id,

input.value.trim()

);

}

);

});

document

.querySelectorAll(".view-btn")

.forEach(btn=>{

btn.onclick=()=>{

openParticipant(

btn.dataset.id

);

};

});

document

.querySelectorAll(".delete-btn")

.forEach(btn=>{

btn.onclick=()=>{

confirmDelete(

btn.dataset.id

);

};

});

document

.querySelectorAll(".check-btn")

.forEach(btn=>{

btn.onclick=()=>{

toggleCheck(

btn.dataset.id

);

};

});

}
// admin.js
// Parça 6/12

function openParticipant(id){

selectedParticipant=

participants.find(

x=>x.kayitNo===id

);

if(!selectedParticipant){

return;

}

participantDialog.showModal();

detailRegisterNo.textContent=
selectedParticipant.kayitNo;

detailName.textContent=
selectedParticipant.adSoyad;

detailTC.textContent=
selectedParticipant.tc;

detailPhone.textContent=
selectedParticipant.telefon;

detailParent.textContent=
selectedParticipant.veliAdi;

detailParentPhone.textContent=
selectedParticipant.veliTelefon;

detailSchool.textContent=
selectedParticipant.okul;

detailClass.textContent=
selectedParticipant.sinif;

detailStatus.textContent=

selectedParticipant.checkedIn

?

"Giriş Yaptı"

:

"Bekliyor";

detailSeat.value=

selectedParticipant.seat||"";

}
// admin.js
// Parça 7/12

saveParticipantBtn.onclick=

async()=>{

if(!selectedParticipant){

return;

}

await updateSeat(

selectedParticipant.kayitNo,

detailSeat.value.trim()

);

participantDialog.close();

};

closeParticipantBtn.onclick=

()=>participantDialog.close();

participantDialogClose.onclick=

()=>participantDialog.close();
// admin.js
// Parça 8/12

async function toggleCheck(id){

const participant=

participants.find(

x=>x.kayitNo===id

);

if(!participant){

return;

}

if(participant.checkedIn){

await checkOut(id);

}else{

await checkIn(id);

}

}

function confirmDelete(id){

selectedParticipant=id;

confirmDialog.showModal();

}
// admin.js
// Parça 9/12

confirmYes.onclick=

async()=>{

await deleteRegistration(

selectedParticipant

);

confirmDialog.close();

};

confirmNo.onclick=

()=>{

confirmDialog.close();

};
// admin.js
// Parça 10/12

search.addEventListener(

"input",

applyFilters

);

statusFilter.addEventListener(

"change",

applyFilters

);

sortSelect.addEventListener(

"change",

applyFilters

);
// admin.js
// Parça 11/12

listenRegistrations(

list=>{

participants=list;

applyFilters();

loadStatistics();

showLoading(false);

}

);

showLoading(true);
// admin.js
// Parça 12/12 (Son)

window.addEventListener(

"DOMContentLoaded",

()=>{

applyFilters();

loadStatistics();

}
);