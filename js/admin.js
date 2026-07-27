// ===============================
// admin.js
// Bölüm 1
// ===============================

import {
    login,
    logout,
    authListener,
    realtimeParticipants,
    updateParticipant,
    deleteParticipant
} from "./firebase.js";

import {
    showToast,
    showLoading,
    hideLoading
} from "./validation.js";

// ===============================
// ELEMENTLER
// ===============================

const loginPage = document.getElementById("loginPage");
const adminPanel = document.getElementById("adminPanel");

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const logoutButton = document.getElementById("logoutButton");

const tableBody = document.getElementById("participantTable");

const totalCount = document.getElementById("totalCount");
const adultCount = document.getElementById("adultCount");
const childCount = document.getElementById("childCount");
const assignedCount = document.getElementById("assignedCount");

const searchInput = document.getElementById("searchInput");
const filterBus = document.getElementById("filterBus");

const editModal = document.getElementById("editModal");

const editId = document.getElementById("editId");
const editBus = document.getElementById("editBus");
const editSeat = document.getElementById("editSeat");

const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");

let participants = [];

// ===============================
// AUTH
// ===============================

authListener(user => {

    hideLoading();

    if (user) {

        loginPage.classList.add("hidden");
        adminPanel.classList.remove("hidden");

        loadParticipants();

    } else {

        loginPage.classList.remove("hidden");
        adminPanel.classList.add("hidden");

    }

});

// ===============================
// LOGIN
// ===============================

loginForm.addEventListener("submit", async e => {

    e.preventDefault();

    showLoading();

    try {

        await login(

            emailInput.value.trim(),

            passwordInput.value

        );

        showToast("Giriş başarılı.");

    }

    catch (err) {

        console.error(err);

        showToast(

            "E-Posta veya şifre hatalı.",

            "error"

        );

    }

    finally {

        hideLoading();

    }

});

// ===============================
// LOGOUT
// ===============================

logoutButton.addEventListener("click", async () => {

    await logout();

});

// ===============================
// REALTIME
// ===============================

function loadParticipants() {

    realtimeParticipants(list => {

        participants = list;

        renderTable(list);

        updateStatistics(list);

    });

}

// ===============================
// İSTATİSTİKLER
// ===============================

function updateStatistics(list) {

    totalCount.textContent = list.length;

    adultCount.textContent = list.filter(

        p => p.age >= 18

    ).length;

    childCount.textContent = list.filter(

        p => p.age < 18

    ).length;

    assignedCount.textContent = list.filter(

        p => p.busNumber && p.seatNumber

    ).length;

}
// ===============================
// admin.js
// Bölüm 2
// ===============================

// ===============================
// TABLOYU OLUŞTUR
// ===============================

function renderTable(list) {

    tableBody.innerHTML = "";

    if (list.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:40px;">
                    Kayıt bulunamadı.
                </td>
            </tr>
        `;

        return;

    }

    list.forEach(participant => {

        const row = document.createElement("tr");

        row.innerHTML = `

        <td>${participant.registrationCode}</td>

        <td>

            ${participant.firstName}
            ${participant.lastName}

        </td>

        <td>${participant.tc}</td>

        <td>${participant.phone}</td>

        <td>${participant.age}</td>

        <td>

            ${participant.busNumber || "-"}

        </td>

        <td>

            ${participant.seatNumber || "-"}

        </td>

        <td>

            <div class="actionButtons">

                <button
                    class="iconButton editButton"
                    data-id="${participant.id}">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                    class="iconButton qrButton"
                    data-id="${participant.id}">

                    <i class="fa-solid fa-qrcode"></i>

                </button>

                <button
                    class="iconButton deleteButton"
                    data-id="${participant.id}">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </td>

        `;

        tableBody.appendChild(row);

    });

}

// ===============================
// ARAMA
// ===============================

searchInput.addEventListener("input", () => {

    const value = searchInput.value
        .trim()
        .toLocaleLowerCase("tr");

    const filtered = participants.filter(item => {

        return (

            `${item.firstName} ${item.lastName}`

                .toLocaleLowerCase("tr")

                .includes(value)

            ||

            item.tc.includes(value)

        );

    });

    renderTable(filtered);

});

// ===============================
// OTOBÜS FİLTRESİ
// ===============================

filterBus.addEventListener("change", () => {

    if (filterBus.value === "") {

        renderTable(participants);

        return;

    }

    renderTable(

        participants.filter(item =>

            item.busNumber == filterBus.value

        )

    );

});

// ===============================
// TABLO TIKLAMA
// ===============================

tableBody.addEventListener("click", e => {

    const button = e.target.closest("button");

    if (!button) return;

    const id = button.dataset.id;

    if (button.classList.contains("editButton")) {

        openEditModal(id);

        return;

    }

    if (button.classList.contains("deleteButton")) {

        removeParticipant(id);

        return;

    }

    if (button.classList.contains("qrButton")) {

        showQRCode(id);

        return;

    }

});

// ===============================
// MODAL AÇ
// ===============================

function openEditModal(id) {

    const participant = participants.find(

        item => item.id === id

    );

    if (!participant) return;

    editId.value = participant.id;

    editBus.value = participant.busNumber || "";

    editSeat.value = participant.seatNumber || "";

    editModal.classList.remove("hidden");

}

// ===============================
// MODAL KAPAT
// ===============================

cancelButton.addEventListener("click", () => {

    editModal.classList.add("hidden");

});

window.addEventListener("click", e => {

    if (e.target === editModal) {

        editModal.classList.add("hidden");

    }

});
// ===============================
// admin.js
// Bölüm 3
// ===============================

// ===============================
// KAYDET
// ===============================

saveButton.addEventListener("click", async () => {

    const id = editId.value;

    if (!id) return;

    try {

        showLoading();

        await updateParticipant(id, {

            busNumber: editBus.value.trim(),

            seatNumber: editSeat.value.trim()

        });

        editModal.classList.add("hidden");

        showToast(

            "Otobüs ve koltuk bilgileri güncellendi."

        );

    }

    catch (error) {

        console.error(error);

        showToast(

            "Güncelleme sırasında hata oluştu.",

            "error"

        );

    }

    finally {

        hideLoading();

    }

});

// ===============================
// KATILIMCI SİL
// ===============================

async function removeParticipant(id) {

    const approve = confirm(

        "Bu kayıt kalıcı olarak silinsin mi?"

    );

    if (!approve) return;

    try {

        showLoading();

        await deleteParticipant(id);

        showToast(

            "Kayıt başarıyla silindi."

        );

    }

    catch (error) {

        console.error(error);

        showToast(

            "Silme işlemi başarısız.",

            "error"

        );

    }

    finally {

        hideLoading();

    }

}

// ===============================
// QR BİLGİLERİNİ GÖSTER
// ===============================

function showQRCode(id) {

    const participant = participants.find(

        item => item.id === id

    );

    if (!participant) return;

    alert(

`Kayıt Kodu : ${participant.registrationCode}

Ad Soyad : ${participant.firstName} ${participant.lastName}

Otobüs : ${participant.busNumber || "Atanmadı"}

Koltuk : ${participant.seatNumber || "Atanmadı"}

Bu bilgiler QR okutulduğunda görüntülenir.`

    );

}

// ===============================
// SAYI GİRİŞİ
// ===============================

editSeat.addEventListener("input", () => {

    editSeat.value = editSeat.value.replace(/\D/g, "");

    if (

        Number(editSeat.value) > 60

    ) {

        editSeat.value = 60;

    }

});

// ===============================
// YENİLE
// ===============================

document

.getElementById("refreshButton")

.addEventListener(

"click",

() => {

renderTable(participants);

updateStatistics(participants);

showToast(

"Liste yenilendi."

);

}

);

// ===============================
// ESC İLE MODAL KAPAT
// ===============================

document.addEventListener(

"keydown",

event => {

if (

event.key === "Escape"

) {

editModal.classList.add(

"hidden"

);

}

}

);

// ===============================
// TABLO SATIRINI BUL
// ===============================

function findParticipant(id){

return participants.find(

item=>item.id===id

);

}

// ===============================
// OTOBÜS DOLULUK
// ===============================

function getBusSeatCount(busNumber){

return participants.filter(

item=>item.busNumber==busNumber

).length;

}

// ===============================
// KOLTUK DOLU MU
// ===============================

function seatIsUsed(bus,seat,currentId=null){

return participants.some(item=>

item.id!==currentId &&

item.busNumber==bus &&

String(item.seatNumber)===String(seat)

);

}

// ===============================
// KAYDET ÖNCESİ KONTROL
// ===============================

saveButton.addEventListener(

"click",

event=>{

const bus=editBus.value;

const seat=editSeat.value;

const id=editId.value;

if(bus && seat){

if(seatIsUsed(bus,seat,id)){

event.stopImmediatePropagation();

showToast(

"Bu koltuk dolu.",

"error"

);

}

}

},

true

);

// ===============================
// BİTİŞ
// ===============================