alert("app.js yüklendi");
import { downloadPDF } from "./pdf.js";
import {
    addRegistration,
    getRemainingCapacity,
    isCapacityFull
} from "./firebase.js";

import { MAX_CAPACITY } from "./config.js";

const form = document.getElementById("registrationForm");

const capacityText = document.getElementById("capacityText");
const capacityBar = document.getElementById("capacityBar");

const successSection = document.getElementById("successSection");
const formSection = document.getElementById("formSection");

const qrImage = document.getElementById("qrImage");
const registerNumberText = document.getElementById("registerNumber");

const pdfButton = document.getElementById("downloadPdf");

let lastRegistration = null;

document.addEventListener("DOMContentLoaded", init);

/* ===================================================== */

async function init() {

    await updateCapacity();

    restoreDraft();

    form.addEventListener("submit", submitForm);

}

/* ===================================================== */

async function updateCapacity() {

    const remain = await getRemainingCapacity();

    const used = MAX_CAPACITY - remain;

    capacityText.textContent =
        `${used} / ${MAX_CAPACITY}`;

    const percent = (used / MAX_CAPACITY) * 100;

    capacityBar.style.width = percent + "%";

    if (await isCapacityFull()) {

        form.querySelectorAll("input,select,textarea,button")
            .forEach(x => x.disabled = true);

        capacityBar.classList.add("bg-danger");

        capacityText.textContent = "Kontenjan Doldu";

    }

}
/* ===================================================== */

form.addEventListener("input", saveDraft);

function saveDraft() {

    const data = Object.fromEntries(

        new FormData(form)

    );

    localStorage.setItem(

        "registrationDraft",

        JSON.stringify(data)

    );

}

function restoreDraft() {

    const draft = localStorage.getItem(

        "registrationDraft"

    );

    if (!draft) return;

    const data = JSON.parse(draft);

    Object.keys(data).forEach(key => {

        if (form[key])

            form[key].value = data[key];

    });

}

function clearDraft() {

    localStorage.removeItem(

        "registrationDraft"

    );

}
/* =====================================================
   DOĞRULAMA
===================================================== */

function validateForm() {

    const data = Object.fromEntries(
        new FormData(form)
    );

    if (!data.name.trim())
        throw new Error("Ad Soyad zorunludur.");

    if (!/^\d{11}$/.test(data.tc))
        throw new Error("TC Kimlik No 11 haneli olmalıdır.");

    if (!/^05\d{9}$/.test(data.phone))
        throw new Error("Telefon numarası hatalı.");

    if (!data.parent.trim())
        throw new Error("Veli adı zorunludur.");

    if (!/^05\d{9}$/.test(data.parentPhone))
        throw new Error("Veli telefonu hatalı.");

    if (!data.gender)
        throw new Error("Cinsiyet seçiniz.");

    if (!data.birth)
        throw new Error("Doğum tarihi seçiniz.");

    const birth = new Date(data.birth);

    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const month =
        today.getMonth() - birth.getMonth();

    if (
        month < 0 ||
        (month === 0 &&
            today.getDate() < birth.getDate())
    ) {
        age--;
    }

    if (age < 7 || age > 18) {
        throw new Error(
            "Yaş aralığı uygun değildir."
        );
    }

    return data;

}

/* =====================================================
   LOADING
===================================================== */

function setLoading(status) {

    const button =
        form.querySelector("button[type=submit]");

    button.disabled = status;

    if (status) {

        button.dataset.old = button.innerHTML;

        button.innerHTML =
            '<span class="spinner-border spinner-border-sm"></span> Kaydediliyor...';

    } else {

        button.innerHTML =
            button.dataset.old;

    }

}

/* =====================================================
   TOAST
===================================================== */

function showToast(message, success = true) {

    const toast =
        document.getElementById("toast");

    toast.className =
        `toast align-items-center text-bg-${success ? "success" : "danger"} border-0 show`;

    toast.querySelector(".toast-body")
        .textContent = message;

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}
/* =====================================================
   FORM GÖNDER
===================================================== */

async function submitForm(e) {

    alert("submit çalıştı");

    e.preventDefault();

}

    try {

        setLoading(true);

        const data = validateForm();

        const registration =
            await addRegistration(data);

        lastRegistration = registration;

        clearDraft();

        await updateCapacity();

        showSuccess(registration);

        showToast(
            "Kayıt başarıyla oluşturuldu."
        );

    }

    catch (err) {
    console.error(err);
    alert(err.message);
}

    finally {

        setLoading(false);

    }

}
/* =====================================================
   BAŞARI EKRANI
===================================================== */

function showSuccess(registration) {

    formSection.classList.add("d-none");
    successSection.classList.remove("d-none");

    registerNumberText.textContent =
        registration.registerNumber;

    createQRCode(registration);

}

/* =====================================================
   QR OLUŞTUR
===================================================== */

function createQRCode(registration) {

    qrImage.innerHTML = "";

    new QRCode(qrImage, {

        text: JSON.stringify({

            id: registration.id,
            registerNumber: registration.registerNumber,
            name: registration.name

        }),

        width: 220,
        height: 220,
        correctLevel: QRCode.CorrectLevel.H

    });

}

/* =====================================================
   PDF
===================================================== */

pdfButton.addEventListener("click", () => {

    if (!lastRegistration) return;

    downloadPDF(lastRegistration);

});

/* =====================================================
   YENİ KAYIT
===================================================== */

document
.getElementById("newRegistration")
.addEventListener("click", () => {

    form.reset();

    lastRegistration = null;

    successSection.classList.add("d-none");

    formSection.classList.remove("d-none");

    qrImage.innerHTML = "";

    restoreDraft();

});
/* =====================================================
   YAZDIR
===================================================== */

document
.getElementById("printRegistration")
?.addEventListener("click", () => {

    window.print();

});
/* =====================================================
   SAYFA KAPANIRKEN
===================================================== */

window.addEventListener("beforeunload", () => {

    if (formSection.classList.contains("d-none"))
        return;

    saveDraft();

});