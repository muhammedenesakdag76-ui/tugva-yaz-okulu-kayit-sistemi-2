import {
    authListener,
    logout,
    getAllRegistrations,
    getStatistics,
    updateSeat,
    deleteRegistration,
    checkIn,
    checkOut,
    searchParticipants
} from "./firebase.js";

const table =
    document.getElementById("participantTable");

const totalCount =
    document.getElementById("totalCount");

const checkedCount =
    document.getElementById("checkedCount");

const remainingCount =
    document.getElementById("remainingCount");

const searchInput =
    document.getElementById("search");

const logoutBtn =
    document.getElementById("logoutBtn");

let participants = [];

authListener(user => {

    if (!user) {

        location.href = "login.html";

    }

});

logoutBtn.addEventListener("click", async () => {

    await logout();

    location.href = "login.html";

});
async function loadStatistics() {

    const stats =
        await getStatistics();

    totalCount.textContent =
        stats.total;

    checkedCount.textContent =
        stats.checkedIn;

    remainingCount.textContent =
        stats.remaining;

}

async function loadParticipants() {

    participants =
        await getAllRegistrations();

    renderTable(participants);

    loadStatistics();

}
function renderTable(list) {

    table.innerHTML = "";

    list.forEach(item => {

        const row =
            document.createElement("tr");

        row.innerHTML = `

<td>${item.kayitNo}</td>

<td>${item.adSoyad}</td>

<td>${item.telefon}</td>

<td>

<input
class="seat-input"
data-id="${item.kayitNo}"
value="${item.seat || ""}"
placeholder="A1">

</td>

<td>

${item.checkedIn
? "✅ Giriş"
: "❌ Bekliyor"}

</td>

<td>

<button
class="check-btn"
data-id="${item.kayitNo}">

${item.checkedIn
? "Çıkış"
: "Giriş"}

</button>

<button
class="delete-btn"
data-id="${item.kayitNo}">

Sil

</button>

</td>

`;

        table.appendChild(row);

    });

    bindEvents();

}
function bindEvents() {

document.querySelectorAll(".seat-input")

.forEach(input=>{

input.addEventListener("change",async()=>{

await updateSeat(

input.dataset.id,

input.value.trim()

);

});

});

document.querySelectorAll(".delete-btn")

.forEach(btn=>{

btn.addEventListener("click",async()=>{

if(!confirm("Bu kayıt silinsin mi?"))

return;

await deleteRegistration(

btn.dataset.id

);

loadParticipants();

});

});

document.querySelectorAll(".check-btn")

.forEach(btn=>{

btn.addEventListener("click",async()=>{

const id=

btn.dataset.id;

const participant=

participants.find(

x=>x.kayitNo===id

);

if(participant.checkedIn){

await checkOut(id);

}else{

await checkIn(id);

}

loadParticipants();

});

});

}
searchInput.addEventListener(

"input",

async()=>{

const text=

searchInput.value.trim();

if(text===""){

renderTable(participants);

return;

}

const result=

await searchParticipants(text);

renderTable(result);

}

);

loadParticipants();