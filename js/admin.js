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
import { Html5QrcodeScanner } from "https://unpkg.com/html5-qrcode";

let scanner;

export function startQRScanner(){

    scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
            fps:10,
            qrbox:250
        }
    );

    scanner.render(onScanSuccess);

}

async function onScanSuccess(text){

    try{

        const qr = JSON.parse(text);

        await toggleCheckIn(qr.id);

        showToast(
            qr.name + " yoklaması alındı."
        );

        scanner.clear();

    }

    catch(e){

        showToast(
            "Geçersiz QR",
            false
        );

    }

}
document
.getElementById("exportExcel")
.addEventListener("click",exportExcel);

function exportExcel(){

    const rows=[];

    registrations.forEach(r=>{

        rows.push({

            "Kayıt No":r.registerNumber,

            "Ad Soyad":r.name,

            "Telefon":r.phone,

            "Veli":r.parent,

            "Veli Telefon":r.parentPhone,

            "Koltuk":r.seat,

            "Durum":r.checkedIn?"Geldi":"Gelmedi"

        });

    });

    const worksheet=XLSX.utils.json_to_sheet(rows);

    const workbook=XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Öğrenciler"
    );

    XLSX.writeFile(
        workbook,
        "TUGVA-Yaz-Okulu.xlsx"
    );

}
document
.getElementById("printList")
.addEventListener("click",()=>{

    window.print();

});
import { signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import { auth } from "./config.js";

document
.getElementById("logout")
.addEventListener("click",async()=>{

    await signOut(auth);

    location.href="login.html";

});
async function updateCapacityWarning(){

    const stats=await getStatistics();

    const card=document.getElementById("capacityCard");

    card.classList.remove(
        "bg-success",
        "bg-warning",
        "bg-danger"
    );

    if(stats.percent<70){

        card.classList.add("bg-success");

    }

    else if(stats.percent<100){

        card.classList.add("bg-warning");

    }

    else{

        card.classList.add("bg-danger");

    }

}
setInterval(()=>{

    document.getElementById("clock").textContent=
        new Date().toLocaleString("tr-TR");

},1000);