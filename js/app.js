/* ===========================================
   app.js
=========================================== */

import {
    addRegistration
} from "./firebase.js";

import {
    validateForm,
    prepareData,
    isAdult
} from "./validation.js";

import {
    showLoading,
    hideLoading,
    showToast,
    saveDraft,
    restoreDraft,
    clearDraft,
    clearForm,
    toggleStudentFields,
    capitalizeWords,
    $
} from "./utils.js";

import {
    createQRCode
} from "./qr.js";

import {
    downloadPDF,
    printRegistration
} from "./pdf.js";

/* ===========================================
   DOM
=========================================== */

const form =
    $("#registrationForm");

const birthDate =
    $("#birthDate");

const successSection =
    $("#successSection");

const registerNumber =
    $("#registerNumber");

const qrContainer =
    $("#qrContainer");

const submitButton =
    $("#submitButton");

const downloadPdfButton =
    $("#downloadPdf");

const printButton =
    $("#printRegistration");

const newRegistrationButton =
    $("#newRegistration");

/* ===========================================
   Global
=========================================== */

let lastRegistration = null;

/* ===========================================
   Form Verisini Oku
=========================================== */

function getFormData() {

    return {

        name: $("#name").value,

        surname: $("#surname").value,

        tc: $("#tc").value,

        phone: $("#phone").value,

        birthDate: $("#birthDate").value,

        gender: $("#gender").value,

        district: $("#district").value,

        neighborhood: $("#neighborhood").value,

        address: $("#address").value,

        school: $("#school").value,

        className: $("#className").value,

        parentName: $("#parentName").value,

        parentPhone: $("#parentPhone").value

    };

}
/* ===========================================
   Doğum Tarihi
=========================================== */

birthDate.addEventListener(

    "change",

    () => {

        toggleStudentFields(

            !isAdult(

                birthDate.value

            )

        );

    }

);
/* ===========================================
   Draft
=========================================== */

form.addEventListener(

    "input",

    () => {

        saveDraft(

            getFormData()

        );

    }

);
/* ===========================================
   Submit
=========================================== */

async function submitForm(e) {

    e.preventDefault();

    try {

        showLoading();

        submitButton.disabled = true;

        /* ------------------------------- */
        /* Form Verisi */
        /* ------------------------------- */

        const formData =
            getFormData();

        /* ------------------------------- */
        /* Doğrulama */
        /* ------------------------------- */

        validateForm(formData);

        /* ------------------------------- */
        /* Temizleme */
        /* ------------------------------- */

        const data =
            prepareData(formData);

        /* ------------------------------- */
        /* Firebase */
        /* ------------------------------- */

        const registration =
            await addRegistration(data);

        lastRegistration =
            registration;

        /* ------------------------------- */
        /* Draft Sil */
        /* ------------------------------- */

        clearDraft();

        /* ------------------------------- */
        /* Başarı */
        /* ------------------------------- */

        showSuccess(registration);

    }

    catch (error) {

        console.error(error);

        showToast(

            error.message,

            "error"

        );

    }

    finally {

        hideLoading();

        submitButton.disabled = false;

    }

}
/* ===========================================
   Success
=========================================== */

function showSuccess(registration){

    form.parentElement.parentElement
        .style.display="none";

    successSection.classList
        .remove("d-none");

    registerNumber.textContent=

        registration.registerNumber;

    createQRCode(

        qrContainer,

        registration.id

    );

    showToast(

        "Kayıt başarıyla oluşturuldu."

    );

}
downloadPdfButton.addEventListener(

    "click",

    ()=>{

        if(!lastRegistration)

            return;

        downloadPDF(

            lastRegistration

        );

    }

);
printButton.addEventListener(

    "click",

    ()=>{

        printRegistration();

    }

);
newRegistrationButton.addEventListener(

    "click",

    ()=>{

        clearForm(form);

        lastRegistration=null;

        successSection.classList

            .add("d-none");

        const formSection = $("#formSection");

formSection.classList.add("d-none");
successSection.classList.remove("d-none");
    }

);
/* ===========================================
   Sayısal Alanlar
=========================================== */

[
    $("#tc"),
    $("#phone"),
    $("#parentPhone")
].forEach(input => {

    if (!input)
        return;

    input.addEventListener("input", () => {

        input.value = input.value.replace(/\D/g, "");

    });

});
/* ===========================================
   Büyük Harf
=========================================== */

[
    $("#name"),
    $("#surname"),
    $("#district"),
    $("#neighborhood"),
    $("#school"),
    $("#parentName")
].forEach(input => {

    if (!input)
        return;

    input.addEventListener("blur", () => {

        input.value =
            capitalizeWords(input.value);

    });

});
/* ===========================================
   Draft Yükle
=========================================== */

function loadDraft() {

    const draft =
        restoreDraft();

    if (!draft)
        return;

    Object.keys(draft).forEach(key => {

        const element =
            $("#" + key);

        if (!element)
            return;

        element.value =
            draft[key];

    });

    toggleStudentFields(

        !isAdult(

            $("#birthDate").value

        )

    );

}
/* ===========================================
   Form Durumu
=========================================== */

function setFormEnabled(enabled) {

    [...form.elements].forEach(element => {

        element.disabled = !enabled;

    });

}
/* ===========================================
   Init
=========================================== */

function init() {

    loadDraft();

    toggleStudentFields(

        !isAdult(

            birthDate.value

        )

    );

    form.addEventListener(

        "submit",

        submitForm

    );

}
document.addEventListener(

    "DOMContentLoaded",

    init

);