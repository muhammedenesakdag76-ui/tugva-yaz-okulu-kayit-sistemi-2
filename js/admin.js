import {

    getAllRegistrations,

    searchRegistrations,

    updateSeat,

    updateCheckIn,

    deleteRegistration,

    getStatistics

} from "./firebase.js";

const ADMIN = {

    registrations: [],

    filtered: [],

    current: null,

    scanner: null,

    dom: {}

};

function cacheDOM() {

    ADMIN.dom = {

        tableBody: document.getElementById("registrationTable"),

        search: document.getElementById("searchInput"),

        total: document.getElementById("statTotal"),

        checked: document.getElementById("statChecked"),

        absent: document.getElementById("statAbsent"),

        remaining: document.getElementById("statRemaining"),

        qrReader: document.getElementById("qr-reader"),

        qrResult: document.getElementById("qrResult"),

        refresh: document.getElementById("refreshButton")

    };

}
async function loadRegistrations() {

    try {

        ADMIN.registrations =

            await getAllRegistrations();

        ADMIN.filtered = [

            ...ADMIN.registrations

        ];

        renderTable();

        await loadStatistics();

    }

    catch (error) {

        console.error(error);

    }

}

async function loadStatistics() {

    const stats =

        await getStatistics();

    ADMIN.dom.total.textContent =

        stats.total;

    ADMIN.dom.checked.textContent =

        stats.checkedIn;

    ADMIN.dom.absent.textContent =

        stats.absent;

    ADMIN.dom.remaining.textContent =

        stats.remaining;

}
function renderTable() {

    ADMIN.dom.tableBody.innerHTML = "";

    ADMIN.filtered.forEach(item => {

        const tr = document.createElement("tr");

        tr.innerHTML = `

        <td>${item.registerNumber}</td>

        <td>${item.name}</td>

        <td>${item.phone}</td>

        <td>${item.school}</td>

        <td>${item.class}</td>

        <td>${item.seat || "-"}</td>

        <td>

            ${item.checkedIn

                ? '<span class="badge bg-success">Geldi</span>'

                : '<span class="badge bg-danger">Gelmedi</span>'}

        </td>

        <td>

            <button

                class="btn btn-sm btn-primary edit-btn"

                data-id="${item.id}"

            >

                Düzenle

            </button>

        </td>

        `;

        ADMIN.dom.tableBody.appendChild(tr);

    });

}
async function search(value) {

    ADMIN.filtered =

        await searchRegistrations(value);

    renderTable();

}

function bindSearch() {

    ADMIN.dom.search.addEventListener(

        "input",

        event => {

            search(

                event.target.value

            );

        }

    );

}
function bindRefresh() {

    ADMIN.dom.refresh.addEventListener(

        "click",

        loadRegistrations

    );

}

async function init() {

    cacheDOM();

    bindSearch();

    bindRefresh();
startRealtime();
    await loadRegistrations();

}

document.addEventListener(

    "DOMContentLoaded",

    init

);
let html5Qr = null;

function stopScanner() {

    if (!html5Qr) {

        return;

    }

    html5Qr.stop()

        .catch(() => {});

}

async function startScanner() {

    stopScanner();

    html5Qr = new Html5Qrcode("qr-reader");

    const cameras =

        await Html5Qrcode.getCameras();

    if (!cameras.length) {

        alert("Kamera bulunamadı.");

        return;

    }

    await html5Qr.start(

        {

            facingMode: "environment"

        },

        {

            fps: 10,

            qrbox: 250

        },

        onQRCodeSuccess

    );

}
async function onQRCodeSuccess(text) {

    stopScanner();

    const qr = parseQRCode(text);

    if (!qr) {

        showQRMessage(

            "Geçersiz QR",

            false

        );

        return;

    }

    const person =

        ADMIN.registrations.find(

            x => x.id === qr.id

        );

    if (!person) {

        showQRMessage(

            "Kayıt bulunamadı",

            false

        );

        return;

    }

    ADMIN.current = person;

    showPerson(person);

}
function showPerson(person) {

    ADMIN.dom.qrResult.innerHTML = `
${renderSeatEditor(person)}
document
    .getElementById("saveSeatButton")
    .onclick = saveSeat;
<div class="card">

<h3>${person.name}</h3>

<p>Kayıt No : ${person.registerNumber}</p>

<p>Koltuk : ${person.seat || "-"}</p>

<p>Telefon : ${person.phone}</p>

<p>Durum :

${person.checkedIn

? "✅ Giriş Yapmış"

: "❌ Giriş Yapmamış"}

</p>

<button

id="checkButton"

class="btn btn-success"

>

Giriş Yapıldı

</button>

</div>

`;

    document

        .getElementById("checkButton")

        .onclick = checkPerson;

}
async function checkPerson() {

    if (!ADMIN.current) {

        return;

    }

    if (ADMIN.current.checkedIn) {

        alert(

            "Bu öğrenci zaten giriş yapmış."

        );

        return;

    }

    await updateCheckIn(

        ADMIN.current.id,

        true

    );

    await loadRegistrations();

    alert("Yoklama kaydedildi.");

}
function renderSeatEditor(person) {

    return `

    <div class="seat-editor">

        <input

            id="seatInput"

            class="form-control"

            placeholder="Koltuk No"

            value="${person.seat || ""}"

        >

        <button

            id="saveSeatButton"

            class="btn btn-warning"

        >

            Koltuğu Güncelle

        </button>

    </div>

    `;

}
async function saveSeat() {

    if (!ADMIN.current) {

        return;

    }

    const seat =

        document

        .getElementById("seatInput")

        .value

        .trim();

    await updateSeat(

        ADMIN.current.id,

        seat

    );

    ADMIN.current.seat = seat;

    await loadRegistrations();

    showPerson(ADMIN.current);

    alert("Koltuk güncellendi.");

}
<td>${item.seat || "-"}</td>
function openEditModal(person) {

    ADMIN.current = person;

    document.getElementById("editName").value = person.name;

    document.getElementById("editPhone").value = person.phone;

    document.getElementById("editSchool").value = person.school;

    document.getElementById("editClass").value = person.class;

    document.getElementById("editParent").value = person.parent;

    document.getElementById("editParentPhone").value = person.parentPhone;

    document.getElementById("editAddress").value = person.address;

    document.getElementById("editNote").value = person.note;

    document.getElementById("editSeat").value = person.seat;

    document
        .getElementById("editModal")
        .classList.add("show");

}
function closeEditModal() {

    document
        .getElementById("editModal")
        .classList.remove("show");

}
async function saveEdit() {

    if (!ADMIN.current) {

        return;

    }

    const data = {

        name: document.getElementById("editName").value.trim(),

        phone: document.getElementById("editPhone").value.trim(),

        school: document.getElementById("editSchool").value.trim(),

        class: document.getElementById("editClass").value.trim(),

        parent: document.getElementById("editParent").value.trim(),

        parentPhone: document.getElementById("editParentPhone").value.trim(),

        address: document.getElementById("editAddress").value.trim(),

        note: document.getElementById("editNote").value.trim(),

        seat: document.getElementById("editSeat").value.trim()

    };

    await updateRegistration(

        ADMIN.current.id,

        data

    );

    closeEditModal();

    await loadRegistrations();

}
document.addEventListener(

    "click",

    e => {

        if (

            !e.target.classList.contains("edit-btn")

        ) {

            return;

        }

        const person =

            ADMIN.registrations.find(

                x => x.id ===

                e.target.dataset.id

            );

        if (person) {

            openEditModal(person);

        }

    }

);
document

.getElementById("saveEditButton")

.onclick = saveEdit;

document

.getElementById("closeEditButton")

.onclick = closeEditModal;
import {
    subscribeRegistrations
} from "./firebase.js";

function startRealtime() {

    subscribeRegistrations(data => {

        ADMIN.registrations = data;

        ADMIN.filtered = [...data];

        renderTable();

        loadStatistics();

    });

}
const LAST_CHECKINS = [];

function addLastCheckin(person){

    LAST_CHECKINS.unshift({

        name:person.name,

        seat:person.seat,

        time:new Date()

    });

    if(LAST_CHECKINS.length>20){

        LAST_CHECKINS.pop();

    }

    renderLastCheckins();

}

function renderLastCheckins(){

    const box=document.getElementById("lastCheckins");

    box.innerHTML="";

    LAST_CHECKINS.forEach(item=>{

        box.innerHTML+=`

        <div class="item">

            <strong>${item.name}</strong>

            <span>${item.seat||"-"}</span>

            <small>${item.time.toLocaleTimeString("tr-TR")}</small>

        </div>

        `;

    });

}
addLastCheckin(person);
function successSound(){

    const audio=new Audio("sounds/success.mp3");

    audio.play();

}
function errorSound(){

    const audio=new Audio("sounds/error.mp3");

    audio.play();

}
function vibrate(){

    if(navigator.vibrate){

        navigator.vibrate(200);

    }

}
successSound();

vibrate();
setTimeout(()=>{

    startScanner();

},1000);
async function removeRegistration(id){

    if(!confirm("Bu kayıt kalıcı olarak silinsin mi?")){

        return;

    }

    await deleteRegistration(id);

    await loadRegistrations();

    showToast(

        "Kayıt silindi.",

        "success"

    );

}
function exportExcel(){

    const rows=ADMIN.registrations.map(x=>({

        "Kayıt No":x.registerNumber,

        "Ad Soyad":x.name,

        "TC":x.tc,

        "Telefon":x.phone,

        "Okul":x.school,

        "Sınıf":x.class,

        "Koltuk":x.seat,

        "Yoklama":x.checkedIn?"Geldi":"Gelmedi"

    }));

    const ws=XLSX.utils.json_to_sheet(rows);

    const wb=XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

        wb,

        ws,

        "Kayıtlar"

    );

    XLSX.writeFile(

        wb,

        "TUGVA_Yaz_Okulu.xlsx"

    );

}
