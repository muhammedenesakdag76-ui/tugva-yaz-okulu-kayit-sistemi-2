import {
    getAllRegistrations,
    updateRegistration,
    deleteRegistration,
    addRegistration
} from "./firebase.js";

let participants = [];

let filteredParticipants = [];

let selectedParticipant = null;

let chart = null;

const tbody = document.getElementById("participantsBody");

const searchInput = document.getElementById("searchInput");

const statusFilter = document.getElementById("statusFilter");

const genderFilter = document.getElementById("genderFilter");

const schoolFilter = document.getElementById("schoolFilter");

const loading = document.getElementById("loadingOverlay");

const detailName = document.getElementById("detailName");

const detailRegister = document.getElementById("detailRegister");

const detailTc = document.getElementById("detailTc");

const detailPhone = document.getElementById("detailPhone");

const detailSchool = document.getElementById("detailSchool");

const detailClass = document.getElementById("detailClass");

const detailParent = document.getElementById("detailParent");

const detailParentPhone = document.getElementById("detailParentPhone");

const detailSeat = document.getElementById("detailSeat");

const detailStatus = document.getElementById("detailStatus");

const detailQr = document.getElementById("detailQr");

const statTotal = document.getElementById("statTotal");

const statChecked = document.getElementById("statChecked");

const statWaiting = document.getElementById("statWaiting");

const statRemaining = document.getElementById("statRemaining");

const capacity = 45;

document.addEventListener("DOMContentLoaded", init);

async function init() {

    showLoading();

    await loadParticipants();

    bindEvents();

    hideLoading();

}

function bindEvents() {

    searchInput.addEventListener("input", filterParticipants);

    statusFilter.addEventListener("change", filterParticipants);

    genderFilter.addEventListener("change", filterParticipants);

    schoolFilter.addEventListener("change", filterParticipants);

    document
        .getElementById("refreshBtn")
        .addEventListener("click", loadParticipants);

    document
        .getElementById("newParticipantBtn")
        .addEventListener("click", openCreateModal);

}

async function loadParticipants() {

    showLoading();

    try {

        participants = await getAllRegistrations();

        filteredParticipants = [...participants];

        populateSchoolFilter();

        renderTable();

        updateStats();

        updateChart();

    }

    catch (err) {

        console.error(err);

        toast(
            "Hata",
            "Katılımcılar yüklenemedi.",
            false
        );

    }

    hideLoading();

}
function renderTable() {

    tbody.innerHTML = "";

    if (filteredParticipants.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="empty">
                    Kayıt bulunamadı.
                </td>
            </tr>
        `;

        return;
    }

    filteredParticipants.forEach((participant) => {

        const tr = document.createElement("tr");

        const checked =
            participant.checkedIn === true ||
            participant.checked === true;

        tr.innerHTML = `

<td>

<input
type="checkbox"
class="rowCheck"
data-id="${participant.id}">

</td>

<td>

<button
class="btn btn-secondary qrBtn"
data-id="${participant.id}">

QR

</button>

</td>

<td>

${participant.registerNumber || "-"}

</td>

<td>

${participant.name || "-"}

</td>

<td>

${participant.tc || "-"}

</td>

<td>

${participant.phone || "-"}

</td>

<td>

${participant.school || "-"}

</td>

<td>

${participant.class || "-"}

</td>

<td>

${participant.seat || "-"}

</td>

<td>

<span class="badge ${checked ? "checked" : "waiting"}">

${checked ? "Giriş Yaptı" : "Bekliyor"}

</span>

</td>

<td>

<button
class="btn btn-success editBtn"
data-id="${participant.id}">

Düzenle

</button>

<button
class="btn btn-danger deleteBtn"
data-id="${participant.id}">

Sil

</button>

</td>

`;

        tr.addEventListener("click", (e) => {

            if (
                e.target.tagName === "BUTTON" ||
                e.target.tagName === "INPUT"
            ) return;

            showParticipant(participant);

        });

        tbody.appendChild(tr);

    });

    bindRowButtons();

}

function bindRowButtons() {

    document.querySelectorAll(".editBtn").forEach(btn => {

        btn.onclick = () => {

            const id = btn.dataset.id;

            const participant =
                participants.find(x => x.id === id);

            if (participant)
                openEditModal(participant);

        };

    });

    document.querySelectorAll(".deleteBtn").forEach(btn => {

        btn.onclick = () => {

            const id = btn.dataset.id;

            const participant =
                participants.find(x => x.id === id);

            if (participant)
                askDelete(participant);

        };

    });

    document.querySelectorAll(".qrBtn").forEach(btn => {

        btn.onclick = () => {

            const id = btn.dataset.id;

            const participant =
                participants.find(x => x.id === id);

            if (participant)
                openQrModal(participant);

        };

    });

}

function showParticipant(participant) {

    selectedParticipant = participant;

    detailName.textContent =
        participant.name || "-";

    detailRegister.textContent =
        participant.registerNumber || "-";

    detailTc.textContent =
        participant.tc || "-";

    detailPhone.textContent =
        participant.phone || "-";

    detailSchool.textContent =
        participant.school || "-";

    detailClass.textContent =
        participant.class || "-";

    detailParent.textContent =
        participant.parent || "-";

    detailParentPhone.textContent =
        participant.parentPhone || "-";

    detailSeat.textContent =
        participant.seat || "-";

    detailStatus.textContent =
        participant.checkedIn
            ? "Giriş Yaptı"
            : "Bekliyor";

    drawQr(participant);

}
function filterParticipants() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const status =
        statusFilter.value;

    const gender =
        genderFilter.value;

    const school =
        schoolFilter.value;

    filteredParticipants = participants.filter(p => {

        const checked =
            p.checkedIn === true ||
            p.checked === true;

        const searchMatch =

            (p.name || "")
                .toLowerCase()
                .includes(search)

            ||

            (p.tc || "")
                .toLowerCase()
                .includes(search)

            ||

            (p.phone || "")
                .toLowerCase()
                .includes(search)

            ||

            (p.registerNumber || "")
                .toLowerCase()
                .includes(search)

            ||

            (p.school || "")
                .toLowerCase()
                .includes(search);

        const statusMatch =

            !status ||

            (status === "checked" && checked)

            ||

            (status === "waiting" && !checked);

        const genderMatch =

            !gender ||

            p.gender === gender;

        const schoolMatch =

            !school ||

            p.school === school;

        return (
            searchMatch &&
            statusMatch &&
            genderMatch &&
            schoolMatch
        );

    });

    renderTable();

    updateStats();

}

function populateSchoolFilter() {

    schoolFilter.innerHTML = `
        <option value="">
            Tüm Okullar
        </option>
    `;

    const schools = [

        ...new Set(

            participants

                .map(p => p.school)

                .filter(Boolean)

        )

    ].sort();

    schools.forEach(school => {

        const option =
            document.createElement("option");

        option.value = school;

        option.textContent = school;

        schoolFilter.appendChild(option);

    });

}

function updateStats() {

    const total =
        filteredParticipants.length;

    const checked =
        filteredParticipants.filter(p =>
            p.checkedIn === true ||
            p.checked === true
        ).length;

    const waiting =
        total - checked;

    statTotal.textContent =
        total;

    statChecked.textContent =
        checked;

    statWaiting.textContent =
        waiting;

    statRemaining.textContent =
        Math.max(
            capacity - participants.length,
            0
        );

    updateReportCards();

}

function updateReportCards() {

    const male =
        participants.filter(p =>
            p.gender === "Erkek"
        ).length;

    const female =
        participants.filter(p =>
            p.gender === "Kız"
        ).length;

    document.getElementById(
        "maleCount"
    ).textContent = male;

    document.getElementById(
        "femaleCount"
    ).textContent = female;

    const today = new Date()
        .toLocaleDateString("tr-TR");

    const todayCount =
        participants.filter(p => {

            if (!p.createdAt)
                return false;

            const date =
                new Date(
                    p.createdAt
                ).toLocaleDateString("tr-TR");

            return date === today;

        }).length;

    document.getElementById(
        "todayRegister"
    ).textContent = todayCount;

    document.getElementById(
        "capacityRate"
    ).textContent =

        Math.round(

            (participants.length /
                capacity)

            * 100

        ) + "%";

}

function updateChart() {

    const male =
        participants.filter(p =>
            p.gender === "Erkek"
        ).length;

    const female =
        participants.filter(p =>
            p.gender === "Kız"
        ).length;

    const checked =
        participants.filter(p =>
            p.checkedIn === true ||
            p.checked === true
        ).length;

    const waiting =
        participants.length -
        checked;

    const ctx =
        document
            .getElementById("reportChart")
            .getContext("2d");

    if (chart)
        chart.destroy();

    chart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: [

                "Erkek",

                "Kız",

                "Giriş",

                "Bekleyen"

            ],

            datasets: [{

                label: "Katılımcılar",

                data: [

                    male,

                    female,

                    checked,

                    waiting

                ]

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            }

        }

    });

}
let editingId = null;

function openEditModal(participant) {

    editingId = participant.id;

    document.getElementById("editName").value =
        participant.name || "";

    document.getElementById("editTc").value =
        participant.tc || "";

    document.getElementById("editPhone").value =
        participant.phone || "";

    document.getElementById("editEmail").value =
        participant.email || "";

    document.getElementById("editBirth").value =
        participant.birth || "";

    document.getElementById("editGender").value =
        participant.gender || "Erkek";

    document.getElementById("editSchool").value =
        participant.school || "";

    document.getElementById("editClass").value =
        participant.class || "";

    document.getElementById("editParent").value =
        participant.parent || "";

    document.getElementById("editParentPhone").value =
        participant.parentPhone || "";

    document.getElementById("editAddress").value =
        participant.address || "";

    document.getElementById("editNote").value =
        participant.note || "";

    document.getElementById("editSeat").value =
        participant.seat || "";

    document
        .getElementById("editModal")
        .classList.add("show");

}

function closeEditModal() {

    editingId = null;

    document
        .getElementById("editModal")
        .classList.remove("show");

}

document
.getElementById("closeEditModal")
.onclick = closeEditModal;

document
.getElementById("cancelEdit")
.onclick = closeEditModal;

document
.getElementById("saveEdit")
.onclick = saveParticipant;

async function saveParticipant() {

    if (!editingId)
        return;

    showLoading();

    const data = {

        name:
        document.getElementById("editName").value.trim(),

        tc:
        document.getElementById("editTc").value.trim(),

        phone:
        document.getElementById("editPhone").value.trim(),

        email:
        document.getElementById("editEmail").value.trim(),

        birth:
        document.getElementById("editBirth").value,

        gender:
        document.getElementById("editGender").value,

        school:
        document.getElementById("editSchool").value.trim(),

        class:
        document.getElementById("editClass").value.trim(),

        parent:
        document.getElementById("editParent").value.trim(),

        parentPhone:
        document.getElementById("editParentPhone").value.trim(),

        address:
        document.getElementById("editAddress").value.trim(),

        note:
        document.getElementById("editNote").value.trim(),

        seat:
        document.getElementById("editSeat").value.trim()

    };

    try{

        await updateRegistration(
            editingId,
            data
        );

        toast(
            "Başarılı",
            "Katılımcı güncellendi.",
            true
        );

        closeEditModal();

        await loadParticipants();

    }

    catch(err){

        console.error(err);

        toast(
            "Hata",
            "Güncelleme başarısız.",
            false
        );

    }

    hideLoading();

}

function openCreateModal(){

    editingId = null;

    document
    .getElementById("editForm")
    .reset();

    document
    .getElementById("editModal")
    .classList.add("show");

}

async function createParticipant(data){

    showLoading();

    try{

        await addRegistration(data);

        toast(
            "Başarılı",
            "Yeni katılımcı oluşturuldu.",
            true
        );

        closeEditModal();

        await loadParticipants();

    }

    catch(err){

        console.error(err);

        toast(
            "Hata",
            "Kayıt oluşturulamadı.",
            false
        );

    }

    hideLoading();

}
let deletingId = null;

/* ==========================================
SİLME
========================================== */

function askDelete(participant){

    deletingId = participant.id;

    document
        .getElementById("deleteModal")
        .classList.add("show");

}

document
.getElementById("cancelDelete")
.onclick = () => {

    deletingId = null;

    document
        .getElementById("deleteModal")
        .classList.remove("show");

};

document
.getElementById("confirmDelete")
.onclick = async () => {

    if(!deletingId)
        return;

    showLoading();

    try{

        await deleteRegistration(deletingId);

        toast(
            "Başarılı",
            "Katılımcı silindi.",
            true
        );

        document
            .getElementById("deleteModal")
            .classList.remove("show");

        deletingId = null;

        await loadParticipants();

    }

    catch(err){

        console.error(err);

        toast(
            "Hata",
            "Silme işlemi başarısız.",
            false
        );

    }

    hideLoading();

};

/* ==========================================
CHECKBOX
========================================== */

document
.getElementById("selectAll")
.addEventListener("change", function(){

    document
        .querySelectorAll(".rowCheck")
        .forEach(box=>{

            box.checked=this.checked;

        });

});

function getSelectedIds(){

    return [...document.querySelectorAll(".rowCheck:checked")]

        .map(box=>box.dataset.id);

}

/* ==========================================
TOPLU SİL
========================================== */

document
.getElementById("bulkDelete")
.onclick = async ()=>{

    const ids=getSelectedIds();

    if(ids.length===0){

        toast(
            "Uyarı",
            "Önce katılımcı seçiniz.",
            false
        );

        return;

    }

    if(!confirm(
        ids.length+
        " kayıt silinsin mi?"
    )) return;

    showLoading();

    try{

        for(const id of ids){

            await deleteRegistration(id);

        }

        toast(
            "Başarılı",
            ids.length+
            " kayıt silindi.",
            true
        );

        await loadParticipants();

    }

    catch(err){

        console.error(err);

        toast(
            "Hata",
            "Toplu silme başarısız.",
            false
        );

    }

    hideLoading();

};

/* ==========================================
TOPLU GİRİŞ YAPILDI
========================================== */

document
.getElementById("bulkCheckIn")
.onclick = async ()=>{

    const ids=getSelectedIds();

    if(ids.length===0){

        toast(
            "Uyarı",
            "Katılımcı seçiniz.",
            false
        );

        return;

    }

    showLoading();

    try{

        for(const id of ids){

            await updateRegistration(id,{

                checkedIn:true,

                checkInTime:
                new Date().toISOString()

            });

        }

        toast(
            "Başarılı",
            ids.length+
            " kişi giriş yaptı.",
            true
        );

        await loadParticipants();

    }

    catch(err){

        console.error(err);

        toast(
            "Hata",
            "İşlem başarısız.",
            false
        );

    }

    hideLoading();

};

/* ==========================================
TOPLU GİRİŞİ İPTAL
========================================== */

document
.getElementById("bulkCheckOut")
.onclick = async ()=>{

    const ids=getSelectedIds();

    if(ids.length===0){

        toast(
            "Uyarı",
            "Katılımcı seçiniz.",
            false
        );

        return;

    }

    showLoading();

    try{

        for(const id of ids){

            await updateRegistration(id,{

                checkedIn:false,

                checkInTime:null

            });

        }

        toast(
            "Başarılı",
            ids.length+
            " kişinin girişi iptal edildi.",
            true
        );

        await loadParticipants();

    }

    catch(err){

        console.error(err);

        toast(
            "Hata",
            "İşlem başarısız.",
            false
        );

    }

    hideLoading();

};
/* ==========================================
QR MODAL
========================================== */

function openQrModal(participant){

    const modal =
        document.getElementById("qrModal");

    const qrBox =
        document.getElementById("qrModalImage");

    qrBox.innerHTML = "";

    QRCode.toCanvas(

        participant.registerNumber,

        {
            width:256,
            margin:2
        },

        function(err,canvas){

            if(err){

                console.error(err);
                return;

            }

            qrBox.appendChild(canvas);

        }

    );

    document.getElementById("qrModalNumber").textContent =
        participant.registerNumber || "-";

    document.getElementById("qrModalName").textContent =
        participant.name || "-";

    modal.classList.add("show");

}

document
.getElementById("closeQrModal")
.onclick=()=>{

    document
    .getElementById("qrModal")
    .classList.remove("show");

};

/* ==========================================
QR İNDİR
========================================== */

document
.getElementById("downloadQrPng")
.onclick=()=>{

    const canvas=
        document.querySelector("#qrModalImage canvas");

    if(!canvas)
        return;

    const a=document.createElement("a");

    a.download=
        "QR-"+Date.now()+".png";

    a.href=
        canvas.toDataURL("image/png");

    a.click();

};

/* ==========================================
YAZDIR
========================================== */

document
.getElementById("printQr")
.onclick=()=>{

    const canvas=
        document.querySelector("#qrModalImage canvas");

    if(!canvas)
        return;

    const win=
        window.open("","_blank");

    win.document.write(

`
<html>

<head>

<title>QR</title>

<style>

body{

display:flex;

justify-content:center;

align-items:center;

height:100vh;

font-family:Arial;

flex-direction:column;

}

img{

width:320px;

}

</style>

</head>

<body>

<img src="${canvas.toDataURL()}">

<h2>

${document.getElementById("qrModalName").textContent}

</h2>

<p>

${document.getElementById("qrModalNumber").textContent}

</p>

</body>

</html>

`

);

    win.document.close();

    win.focus();

    win.print();

};

/* ==========================================
PDF
========================================== */

document
.getElementById("btnPdf")
.onclick=createPdf;

async function createPdf(){

    if(!selectedParticipant)
        return;

    const {jsPDF}=window.jspdf;

    const pdf=new jsPDF();

    pdf.setFontSize(20);

    pdf.text(
        "TUGVA Yaz Okulu",
        20,
        20
    );

    pdf.setFontSize(13);

    pdf.text(
        "Ad Soyad : "+
        (selectedParticipant.name||"-"),
        20,
        40
    );

    pdf.text(
        "Kayit No : "+
        (selectedParticipant.registerNumber||"-"),
        20,
        50
    );

    pdf.text(
        "Telefon : "+
        (selectedParticipant.phone||"-"),
        20,
        60
    );

    pdf.text(
        "Okul : "+
        (selectedParticipant.school||"-"),
        20,
        70
    );

    const canvas=
        document.querySelector("#detailQr canvas");

    if(canvas){

        pdf.addImage(

            canvas.toDataURL(),

            "PNG",

            145,

            25,

            45,

            45

        );

    }

    pdf.save(

        (selectedParticipant.registerNumber||"Kayit")

        +".pdf"

    );

}

/* ==========================================
DETAY PANELİ QR
========================================== */

function drawQr(participant){

    detailQr.innerHTML="";

    QRCode.toCanvas(

        participant.registerNumber,

        {

            width:180,

            margin:1

        },

        function(err,canvas){

            if(err){

                console.error(err);

                return;

            }

            detailQr.appendChild(canvas);

        }

    );

}
/* ==========================================
TOAST
========================================== */

function toast(title, message, success = true) {

    const toast = document.getElementById("toast");

    document.getElementById("toastTitle").textContent = title;

    document.getElementById("toastMessage").textContent = message;

    const icon = document.getElementById("toastIcon");

    if (success) {

        icon.innerHTML = "✔";
        icon.style.background = "#0d8a43";

    } else {

        icon.innerHTML = "✖";
        icon.style.background = "#d32f2f";

    }

    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

document
.getElementById("closeToast")
.onclick = () => {

    document
    .getElementById("toast")
    .classList.remove("show");

};

/* ==========================================
LOADING
========================================== */

function showLoading() {

    loading.classList.remove("hidden");

}

function hideLoading() {

    loading.classList.add("hidden");

}

/* ==========================================
MENÜ
========================================== */

document.querySelectorAll(".menu").forEach(btn => {

    btn.addEventListener("click", () => {

        document
            .querySelectorAll(".menu")
            .forEach(x => x.classList.remove("active"));

        btn.classList.add("active");

        const page = btn.dataset.page;

        document
            .querySelectorAll(".page")
            .forEach(x => x.classList.remove("active"));

        if (page === "participants") {

            document
                .getElementById("participantsPage")
                .classList.add("active");

        }

        if (page === "reports") {

            document
                .getElementById("reportsPage")
                .classList.add("active");

        }

        if (page === "logs") {

            document
                .getElementById("logsPage")
                .classList.add("active");

        }

        if (page === "settings") {

            document
                .getElementById("settingsPage")
                .classList.add("active");

        }

        if (page === "dashboard") {

            document
                .getElementById("participantsPage")
                .classList.add("active");

        }

    });

});

/* ==========================================
OTOMATİK YENİLE
========================================== */

setInterval(async () => {

    try {

        await loadParticipants();

    }

    catch (e) {

        console.error(e);

    }

}, 60000);

/* ==========================================
ESC MODAL KAPATMA
========================================== */

window.addEventListener("keydown", e => {

    if (e.key !== "Escape")
        return;

    document
        .querySelectorAll(".modal.show")
        .forEach(m => m.classList.remove("show"));

});

/* ==========================================
MODAL DIŞINA TIKLAMA
========================================== */

document.querySelectorAll(".modal").forEach(modal => {

    modal.addEventListener("click", e => {

        if (e.target === modal) {

            modal.classList.remove("show");

        }

    });

});

/* ==========================================
ÇIKIŞ
========================================== */

document
.getElementById("logoutBtn")
.onclick = () => {

    if (!confirm("Oturum kapatılsın mı?"))
        return;

    localStorage.removeItem("adminLogged");

    window.location.href = "login.html";

};

/* ==========================================
RESPONSIVE SIDEBAR
========================================== */

const sidebar = document.querySelector(".sidebar");

const mobileButton = document.getElementById("mobileMenu");

if (mobileButton) {

    mobileButton.onclick = () => {

        sidebar.classList.toggle("show");

    };

}

/* ==========================================
SON
========================================== */

console.log("TÜGVA Admin Paneli Hazır.");