import {
    addRegistration,
    getRemainingCapacity,
    isCapacityFull
} from "./firebase.js";

import {
    validateAndNormalize
} from "./validation.js";

import {
    generateQRCode
} from "./qr.js";

import {
    downloadRegistrationPDF
} from "./pdf.js";

const APP = {

    MAX_CAPACITY: 500,

    registration: null,

    loading: false,

    dom: {}

};

function cacheDOM() {

    APP.dom = {

        form: document.getElementById("registrationForm"),

        submit: document.getElementById("submitButton"),

        reset: document.getElementById("resetButton"),

        loading: document.getElementById("loadingOverlay"),

        success: document.getElementById("successModal"),

        qr: document.getElementById("successQr"),

        pdf: document.getElementById("downloadPdf"),

        again: document.getElementById("newRegistration"),

        remaining: document.getElementById("remainingCapacity"),

        remainingText: document.getElementById("remainingCapacityText"),

        capacityBar: document.getElementById("capacityBar")

    };

}

function $(id) {

    return document.getElementById(id);

}

function value(id) {

    const element = $(id);

    return element ? element.value.trim() : "";

}

function setValue(id, value) {

    const element = $(id);

    if (element) {

        element.value = value;

    }

}

function setText(id, text) {

    const element = $(id);

    if (element) {

        element.textContent = text;

    }

}

function show(element) {

    if (element) {

        element.classList.remove("hidden");

    }

}

function hide(element) {

    if (element) {

        element.classList.add("hidden");

    }

}

function setLoading(status) {

    APP.loading = status;

    if (APP.dom.submit) {

        APP.dom.submit.disabled = status;

    }

    if (APP.dom.reset) {

        APP.dom.reset.disabled = status;

    }

    if (status) {

        show(APP.dom.loading);

    } else {

        hide(APP.dom.loading);

    }

}
function getFormData() {

    return {

        name: value("name"),

        tc: value("tc"),

        phone: value("phone"),

        email: value("email"),

        birth: value("birth"),

        gender: value("gender"),

        school: value("school"),

        class: value("class"),

        parent: value("parent"),

        parentPhone: value("parentPhone"),

        address: value("address"),

        note: value("note")

    };

}

function fillForm(data = {}) {

    Object.keys(data).forEach(key => {

        const input = $(key);

        if (input) {

            input.value = data[key] ?? "";

        }

    });

}

function clearForm() {

    APP.dom.form.reset();

    APP.registration = null;

}

function saveDraft() {

    try {

        localStorage.setItem(

            "tyo-registration-draft",

            JSON.stringify(getFormData())

        );

    }

    catch (error) {

        console.error(error);

    }

}

function loadDraft() {

    try {

        const json = localStorage.getItem(

            "tyo-registration-draft"

        );

        if (!json) {

            return;

        }

        fillForm(JSON.parse(json));

    }

    catch (error) {

        console.error(error);

    }

}

function clearDraft() {

    localStorage.removeItem(

        "tyo-registration-draft"

    );

}

function bindDraftEvents() {

    APP.dom.form
        .querySelectorAll(
            "input, select, textarea"
        )
        .forEach(input => {

            input.addEventListener(

                "input",

                saveDraft

            );

        });

}
function clearErrors() {

    document
        .querySelectorAll(".is-invalid")
        .forEach(element => {

            element.classList.remove("is-invalid");

        });

    document
        .querySelectorAll(".invalid-feedback")
        .forEach(element => {

            element.remove();

        });

}

function showErrors(errors) {

    clearErrors();

    Object.entries(errors).forEach(

        ([field, message]) => {

            const input = $(field);

            if (!input) {

                return;

            }

            input.classList.add("is-invalid");

            const div = document.createElement("div");

            div.className = "invalid-feedback";

            div.textContent = message;

            input.insertAdjacentElement(

                "afterend",

                div

            );

        }

    );

}

function validateForm() {

    const result = validateAndNormalize(

        getFormData()

    );

    if (!result.valid) {

        showErrors(result.errors);

        return null;

    }

    clearErrors();

    return result.data;

}

async function updateCapacity() {

    try {

        const remaining =

            await getRemainingCapacity();

        const used =

            APP.MAX_CAPACITY - remaining;

        const percent =

            Math.min(

                (used / APP.MAX_CAPACITY) * 100,

                100

            );

        APP.dom.remaining.textContent = remaining;

        APP.dom.remainingText.textContent =

            `${used} / ${APP.MAX_CAPACITY}`;

        APP.dom.capacityBar.style.width =

            `${percent}%`;

    }

    catch (error) {

        console.error(error);

    }

}
async function handleSubmit(event) {

    event.preventDefault();

    if (APP.loading) {

        return;

    }

    const full = await isCapacityFull();

    if (full) {

        alert("Kontenjan dolmuştur.");

        await updateCapacity();

        return;

    }

    const registration = validateForm();

    if (!registration) {

        return;

    }

    try {

        setLoading(true);

        const savedRegistration = await addRegistration(

            registration

        );

        APP.registration = savedRegistration;

        clearDraft();

        await updateCapacity();

        await showSuccess(savedRegistration);

    }

    catch (error) {

        console.error(error);

        alert(

            error.message ||

            "Kayıt oluşturulurken hata meydana geldi."

        );

    }

    finally {

        setLoading(false);

    }

}
async function showSuccess(registration) {

    setText(

        "successName",

        registration.name

    );

    setText(

        "successRegisterNumber",

        registration.registerNumber

    );

    setText(

        "successSeat",

        registration.seat || "-"

    );

    if (

        APP.dom.qr &&

        typeof generateQRCode === "function"

    ) {

        await generateQRCode(

            APP.dom.qr,

            registration

        );

    }

    show(APP.dom.success);

}

function hideSuccess() {

    hide(APP.dom.success);

}

async function downloadCurrentPDF() {

    if (!APP.registration) {

        return;

    }

    await downloadRegistrationPDF(

        APP.registration

    );

}

function startNewRegistration() {

    hideSuccess();

    clearErrors();

    clearForm();

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}
function bindEvents() {

    APP.dom.form.addEventListener(

        "submit",

        handleSubmit

    );

    APP.dom.reset.addEventListener(

        "click",

        () => {

            clearErrors();

            clearDraft();

        }

    );

    APP.dom.pdf.addEventListener(

        "click",

        downloadCurrentPDF

    );

    APP.dom.again.addEventListener(

        "click",

        startNewRegistration

    );

    bindDraftEvents();

}
function onlyDigits(value) {

    return value.replace(/\D/g, "");

}

function setupInputFormatting() {

    const tc = $("tc");

    if (tc) {

        tc.addEventListener("input", e => {

            e.target.value = onlyDigits(

                e.target.value

            ).substring(0, 11);

        });

    }

    const phone = $("phone");

    if (phone) {

        phone.addEventListener("input", e => {

            e.target.value = onlyDigits(

                e.target.value

            ).substring(0, 10);

        });

    }

    const parentPhone = $("parentPhone");

    if (parentPhone) {

        parentPhone.addEventListener("input", e => {

            e.target.value = onlyDigits(

                e.target.value

            ).substring(0, 10);

        });

    }

}
function showToast(message, type = "success") {

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.textContent = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {

        toast.classList.add("show");

    });

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);

}
function setupConnectionEvents() {

    window.addEventListener(

        "online",

        () => {

            showToast(

                "İnternet bağlantısı sağlandı."

            );

        }

    );

    window.addEventListener(

        "offline",

        () => {

            showToast(

                "İnternet bağlantısı kesildi.",

                "error"

            );

        }

    );

}
async function init() {

    cacheDOM();

    setupInputFormatting();

    bindEvents();

    loadDraft();

    setupConnectionEvents();

    await updateCapacity();

}

document.addEventListener(

    "DOMContentLoaded",

    init

);
