import {
    addRegistration,
    generateRegisterNumber,
    getRemainingCapacity,
    registrationExists,
    phoneExists,
    isFull
} from "./firebase.js";

import {
    validateForm,
    onlyNumber
} from "./validation.js";

import {
    generateQR
} from "./qr.js";

import {
    downloadPDF
} from "./pdf.js";

const form = document.getElementById("registerForm");
const formSection = document.getElementById("formSection");
const successCard = document.getElementById("successCard");
const registerNumber = document.getElementById("registerNumber");
const remainingCapacity = document.getElementById("remainingCapacity");
const downloadPdf = document.getElementById("downloadPdf");
const newRegister = document.getElementById("newRegister");

const adSoyad = document.getElementById("adSoyad");
const tc = document.getElementById("tc");
const telefon = document.getElementById("telefon");
const email = document.getElementById("email");
const dogumTarihi = document.getElementById("dogumTarihi");
const cinsiyet = document.getElementById("cinsiyet");
const okul = document.getElementById("okul");
const sinif = document.getElementById("sinif");
const veliAdi = document.getElementById("veliAdi");
const veliTelefon = document.getElementById("veliTelefon");
const adres = document.getElementById("adres");
const note = document.getElementById("note");

let currentParticipant = null;
async function updateCapacity() {

    const remaining = await getRemainingCapacity();

    remainingCapacity.textContent = remaining;

}

function getFormData() {

    return {

        registerNumber: "",

        name: adSoyad.value.trim(),

        tc: tc.value.trim(),

        phone: telefon.value.trim(),

        email: email.value.trim(),

        birth: dogumTarihi.value,

        gender: cinsiyet.value,

        school: okul.value.trim(),

        class: sinif.value.trim(),

        parent: veliAdi.value.trim(),

        parentPhone: veliTelefon.value.trim(),

        address: adres.value.trim(),

        note: note.value.trim(),

        seat: "",

        checkedIn: false

    };

}

function clearForm() {

    form.reset();

}
async function register() {

    if (await isFull()) {
        alert("Kontenjan dolmuştur.");
        return;
    }

    const data = getFormData();

    const error = validateForm(data);

    if (error) {
        alert(error);
        return;
    }

    if (await registrationExists(data.tc)) {
        alert("Bu TC Kimlik Numarası ile kayıt bulunmaktadır.");
        return;
    }

    if (await phoneExists(data.phone)) {
        alert("Bu telefon numarası ile kayıt bulunmaktadır.");
        return;
    }

    data.registerNumber = await generateRegisterNumber();

    await addRegistration(data);

    currentParticipant = data;

    showSuccess();

}

function showSuccess() {

    formSection.style.display = "none";

    successCard.style.display = "block";

    registerNumber.textContent = currentParticipant.registerNumber;

    generateQR(currentParticipant.registerNumber);

    updateCapacity();

}
downloadPdf.addEventListener("click", () => {

    if (!currentParticipant) return;

    downloadPDF(currentParticipant);

});


form.addEventListener("submit", async (e) => {

    e.preventDefault();

    await safeRegister();

});

[tc, telefon, veliTelefon].forEach(input => {

    input.addEventListener("keydown", onlyNumber);

});
function capitalize(input) {

    input.value = input.value
        .toLowerCase()
        .replace(/(^|\s)\S/g, l => l.toUpperCase());

}

[adSoyad, veliAdi].forEach(input => {

    input.addEventListener("blur", () => {

        capitalize(input);

    });

});

window.addEventListener("DOMContentLoaded", () => {

    form.reset();

    successCard.style.display = "none";

    formSection.style.display = "block";

    updateCapacity();

});
function setLoading(isLoading) {

    const btn = form.querySelector('button[type="submit"]');

    if (!btn) return;

    btn.disabled = isLoading;

    if (isLoading) {
        btn.dataset.oldText = btn.textContent;
        btn.textContent = "Kaydediliyor...";
    } else {
        btn.textContent = btn.dataset.oldText || "Kaydı Tamamla";
    }

}

async function safeRegister() {

    try {

        setLoading(true);

        await register();

    } catch (err) {

        console.error(err);

        alert("Bir hata oluştu:\n\n" + (err.message || err));

    } finally {

        setLoading(false);

    }

}
function resetSuccessScreen() {

    successCard.style.display = "none";

    formSection.style.display = "block";

    registerNumber.textContent = "";

    const qr = document.getElementById("qrcode");

    if (qr) {
        qr.innerHTML = "";
    }

}

function resetApplication() {

    clearForm();

    currentParticipant = null;

    resetSuccessScreen();

    updateCapacity();

}

newRegister.removeEventListener?.("click", resetApplication);

newRegister.addEventListener("click", resetApplication);
// Başlangıç

window.addEventListener("DOMContentLoaded", async () => {

    try {

        clearForm();

        successCard.style.display = "none";

        formSection.style.display = "block";

        currentParticipant = null;

        await updateCapacity();

    } catch (err) {

        console.error("Başlatma Hatası:", err);

        alert("Uygulama başlatılırken bir hata oluştu.");

    }

});