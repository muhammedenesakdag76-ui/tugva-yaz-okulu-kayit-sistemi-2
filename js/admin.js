import {
    listenRegistrations,
    getStatistics,
    deleteRegistration,
    assignSeat,
    toggleCheckIn,
    searchRegistrations
} from "./firebase.js";

const tbody = document.getElementById("tableBody");

const searchInput = document.getElementById("search");

const totalCard = document.getElementById("totalStudent");
const remainCard = document.getElementById("remainingStudent");
const checkCard = document.getElementById("checkedStudent");
const percentCard = document.getElementById("percentStudent");

let registrations = [];

/* ===================================================== */

document.addEventListener("DOMContentLoaded", init);

async function init() {

    loadDashboard();

    listenRegistrations(data => {

        registrations = data;

        renderTable(data);

        loadDashboard();

    });

    searchInput.addEventListener("input", search);

}
/* ===================================================== */

async function loadDashboard() {

    const stats = await getStatistics();

    totalCard.textContent = stats.total;

    remainCard.textContent = stats.remaining;

    checkCard.textContent = stats.checkedIn;

    percentCard.textContent = stats.percent + "%";

    if (stats.full) {

        remainCard.classList.add("text-danger");

    }

}
/* ===================================================== */

function renderTable(list) {

    tbody.innerHTML = "";

    if (!list.length) {

        tbody.innerHTML = `
        <tr>
        <td colspan="10" class="text-center">
        Kayıt bulunamadı
        </td>
        </tr>
        `;

        return;

    }

    list.forEach(item => {

        tbody.innerHTML += createRow(item);

    });

}
/* ===================================================== */

function createRow(item) {

return `

<tr>

<td>${item.registerNumber}</td>

<td>${item.name}</td>

<td>${item.phone}</td>

<td>${item.parent}</td>

<td>

<span class="badge bg-${item.checkedIn?"success":"secondary"}">

${item.checkedIn?"Geldi":"Gelmedi"}

</span>

</td>

<td>

<input

type="number"

min="1"

max="45"

value="${item.seat||""}"

class="form-control seatInput"

data-id="${item.id}"

>

</td>

<td>

<button

class="btn btn-success btn-sm checkBtn"

data-id="${item.id}">

QR

</button>

<button

class="btn btn-primary btn-sm saveSeat"

data-id="${item.id}">

Kaydet

</button>

<button

class="btn btn-danger btn-sm deleteBtn"

data-id="${item.id}">

Sil

</button>

</td>

</tr>

`;

}
/* =====================================================
   ARAMA
===================================================== */

async function search(e) {

    const keyword = e.target.value.trim();

    if (!keyword) {
        renderTable(registrations);
        return;
    }

    const result = await searchRegistrations(keyword);

    renderTable(result);

}

/* =====================================================
   TABLO OLAYLARI
===================================================== */

tbody.addEventListener("click", async (e) => {

    const id = e.target.dataset.id;

    if (!id) return;

    /* -----------------------------
       KOLTUK KAYDET
    ----------------------------- */

    if (e.target.classList.contains("saveSeat")) {

        const input = document.querySelector(
            `.seatInput[data-id="${id}"]`
        );

        try {

            await assignSeat(id, input.value);

            showToast("Koltuk kaydedildi.");

        }

        catch(err){

            showToast(err.message,false);

        }

    }

    /* -----------------------------
       QR GİRİŞ
    ----------------------------- */

    if (e.target.classList.contains("checkBtn")) {

        try{

            await toggleCheckIn(id);

            showToast("Yoklama güncellendi.");

        }

        catch(err){

            showToast(err.message,false);

        }

    }

    /* -----------------------------
       SİL
    ----------------------------- */

    if (e.target.classList.contains("deleteBtn")) {

        if(!confirm("Bu kayıt silinsin mi?"))
            return;

        try{

            await deleteRegistration(id);

            showToast("Kayıt silindi.");

        }

        catch(err){

            showToast(err.message,false);

        }

    }

});
/* =====================================================
   TOAST
===================================================== */

function showToast(message, success = true){

    const toast =
        document.getElementById("toast");

    toast.className =
        `toast align-items-center text-bg-${success?"success":"danger"} border-0 show`;

    toast.querySelector(".toast-body")
        .textContent = message;

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}
/* =====================================================
   DASHBOARD RENKLERİ
===================================================== */

async function refreshCards(){

    const stats = await getStatistics();

    if(stats.remaining<=5){

        remainCard.classList.remove("text-success");

        remainCard.classList.add("text-danger");

    }

    if(stats.percent>=90){

        percentCard.classList.add("text-danger");

    }

}
/* =====================================================
   AUTO REFRESH
===================================================== */

setInterval(async()=>{

    await loadDashboard();

    await refreshCards();

},5000);