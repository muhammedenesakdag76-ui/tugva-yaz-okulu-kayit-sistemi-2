// ===============================
// Imports
// ===============================

import {

    createRegistration,

    getRemainingCapacity

} from "./firebase.js";

import {

    validateForm

} from "./validation.js";

import {

    generateQR

} from "./qr.js";

import {

    downloadPDF

} from "./pdf.js";


// ===============================
// Elements
// ===============================

const form =
    document.getElementById("registerForm");

const formCard =
    document.getElementById("formSection");

const successCard =
    document.getElementById("successCard");

const remainingText =
    document.getElementById("remainingCapacity");

const registerNumber =
    document.getElementById("registerNumber");

const pdfButton =
    document.getElementById("downloadPdf");

const newButton =
    document.getElementById("newRegister");

let currentRegistration = null;


// ===============================
// Remaining Capacity
// ===============================

async function updateCapacity() {

    const remaining =
        await getRemainingCapacity();

    remainingText.textContent =
        remaining;

}


// ===============================
// Collect Form Data
// ===============================

function getFormData() {

    return {

        adSoyad:
            document.getElementById("adSoyad").value.trim(),

        tc:
            document.getElementById("tc").value.trim(),

        telefon:
            document.getElementById("telefon").value.trim(),

        email:
            document.getElementById("email").value.trim(),

        dogumTarihi:
            document.getElementById("dogumTarihi").value,

        cinsiyet:
            document.getElementById("cinsiyet").value,

        okul:
            document.getElementById("okul").value.trim(),

        sinif:
            document.getElementById("sinif").value.trim(),

        veliAdi:
            document.getElementById("veliAdi").value.trim(),

        veliTelefon:
            document.getElementById("veliTelefon").value.trim(),

        adres:
            document.getElementById("adres").value.trim(),

        not:
            document.getElementById("note").value.trim()

    };

}
// ===============================
// Success Screen
// ===============================

function showSuccess(data) {

    currentRegistration = data;

    formCard.classList.add("hidden");

    successCard.classList.remove("hidden");

    registerNumber.textContent =
        data.kayitNo;

    generateQR(data.kayitNo);

}


// ===============================
// Register
// ===============================

async function register(e) {

    e.preventDefault();

    try {

        const data =
            getFormData();

        const error =
            validateForm(data);

        if (error) {

            alert(error);

            return;

        }

        const registration =
            await createRegistration(data);

        showSuccess(registration);

        updateCapacity();

    }

    catch (err) {

        alert(err.message);

    }

}
// ===============================
// Events
// ===============================

form?.addEventListener("submit", register);


// ===============================
// PDF Download
// ===============================

pdfButton?.addEventListener("click", () => {

    if (!currentRegistration)
        return;

    downloadPDF(currentRegistration);

});


// ===============================
// New Registration
// ===============================

newButton?.addEventListener("click", () => {

    location.reload();

});


// ===============================
// Number Only Inputs
// ===============================

["tc", "telefon", "veliTelefon"].forEach(id => {

    const input = document.getElementById(id);

    if (!input)
        return;

    input.addEventListener("input", () => {

        input.value = input.value
            .replace(/\D/g, "")
            .substring(0, 11);

    });

});


// ===============================
// Uppercase Name Inputs
// ===============================

["adSoyad", "veliAdi"].forEach(id => {

    const input = document.getElementById(id);

    if (!input)
        return;

    input.addEventListener("input", () => {

        input.value = input.value.replace(/\b\w/g, c => c.toUpperCase());

    });

});
// ===============================
// Page Init
// ===============================

async function init() {

    await updateCapacity();

    successCard.classList.add("hidden");

    formCard.classList.remove("hidden");

}


// ===============================
// Auto Init
// ===============================

document.addEventListener("DOMContentLoaded", init);


// ===============================
// Export
// ===============================

export {

    init

};