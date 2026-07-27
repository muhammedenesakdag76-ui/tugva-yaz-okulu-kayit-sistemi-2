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

        form: document.getElementById("registerForm"),

        submit: document.getElementById("submitButton"),

        reset: document.getElementById("resetButton"),

        loading: document.getElementById("loading"),

        success: document.getElementById("successSection"),

        qr: document.getElementById("qr"),

        pdf: document.getElementById("downloadPdfButton"),

        again: document.getElementById("againButton"),

        remaining: document.getElementById("remainingCapacity"),

        remainingText: document.getElementById("remainingCapacityText"),

        capacityBar: document.getElementById("capacityBar"),

        successName: document.getElementById("successName"),

        successRegisterNumber: document.getElementById("successRegisterNumber"),

        successSeat: document.getElementById("successSeat"),

        registrationInfo: document.getElementById("registrationInfo")

    };

}

function $(id) {

    return document.getElementById(id);

}

function value(id) {

    const element = $(id);

    return element ? element.value.trim() : "";

}

function text(id, value) {

    const element = $(id);

    if (element) {

        element.textContent = value;

    }

}

function html(id, value) {

    const element = $(id);

    if (element) {

        element.innerHTML = value;

    }

}

function show(element) {

    if (!element) return;

    element.style.display = "";

    element.classList.remove("hidden");

}

function hide(element) {

    if (!element) return;

    element.style.display = "none";

    element.classList.add("hidden");

}

function onlyDigits(value) {

    return value.replace(/\D/g, "");

}

function setLoading(status) {

    APP.loading = status;

    if (APP.dom.submit) {

        APP.dom.submit.disabled = status;

    }

    if (APP.dom.reset) {

        APP.dom.reset.disabled = status;

    }

    if (APP.dom.loading) {

        APP.dom.loading.style.display =

            status ? "flex" : "none";

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

    Object.entries(data).forEach(([key, val]) => {

        const input = $(key);

        if (input) {

            input.value = val ?? "";

        }

    });

}

function clearForm() {

    if (APP.dom.form) {

        APP.dom.form.reset();

    }

    APP.registration = null;

}

function saveDraft() {

    try {

        localStorage.setItem(

            "tyo-registration-draft",

            JSON.stringify(getFormData())

        );

    }

    catch (e) {

        console.error(e);

    }

}

function loadDraft() {

    try {

        const draft = localStorage.getItem(

            "tyo-registration-draft"

        );

        if (!draft) {

            return;

        }

        fillForm(JSON.parse(draft));

    }

    catch (e) {

        console.error(e);

    }

}

function clearDraft() {

    localStorage.removeItem(

        "tyo-registration-draft"

    );

}

function saveLastRegistration(registration) {

    sessionStorage.setItem(

        "tyo-last-registration",

        JSON.stringify(registration)

    );

}

function loadLastRegistration() {

    try {

        const json = sessionStorage.getItem(

            "tyo-last-registration"

        );

        if (!json) {

            return null;

        }

        return JSON.parse(json);

    }

    catch (e) {

        return null;

    }

}

function clearLastRegistration() {

    sessionStorage.removeItem(

        "tyo-last-registration"

    );

}

function bindDraftEvents() {

    if (!APP.dom.form) {

        return;

    }

    APP.dom.form

        .querySelectorAll(

            "input,select,textarea"

        )

        .forEach(input => {

            input.addEventListener(

                "input",

                saveDraft

            );

        });

}

function setupInputFormatting() {

    const tc = $("tc");

    if (tc) {

        tc.addEventListener("input", e => {

            e.target.value =

                onlyDigits(

                    e.target.value

                ).slice(0, 11);

        });

    }

    const phone = $("phone");

    if (phone) {

        phone.addEventListener("input", e => {

            e.target.value =

                onlyDigits(

                    e.target.value

                ).slice(0, 10);

        });

    }

    const parentPhone = $("parentPhone");

    if (parentPhone) {

        parentPhone.addEventListener("input", e => {

            e.target.value =

                onlyDigits(

                    e.target.value

                ).slice(0, 10);

        });

    }

}
function clearErrors() {

    document
        .querySelectorAll(".is-invalid")
        .forEach(input => {

            input.classList.remove("is-invalid");

        });

    document
        .querySelectorAll(".invalid-feedback")
        .forEach(error => {

            error.remove();

        });

}

function showErrors(errors) {

    clearErrors();

    Object.entries(errors).forEach(([field, message]) => {

        const input = $(field);

        if (!input) {

            return;

        }

        input.classList.add("is-invalid");

        const feedback = document.createElement("div");

        feedback.className = "invalid-feedback";

        feedback.textContent = message;

        input.insertAdjacentElement(

            "afterend",

            feedback

        );

    });

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

        const percent = Math.min(

            (used / APP.MAX_CAPACITY) * 100,

            100

        );

        if (APP.dom.remaining) {

            APP.dom.remaining.textContent =

                remaining;

        }

        if (APP.dom.remainingText) {

            APP.dom.remainingText.textContent =

                `${used} / ${APP.MAX_CAPACITY}`;

        }

        if (APP.dom.capacityBar) {

            APP.dom.capacityBar.style.width =

                `${percent}%`;

        }

    }

    catch (error) {

        console.error(error);

    }

}

async function checkCapacityBeforeSubmit() {

    const full = await isCapacityFull();

    if (!full) {

        return true;

    }

    alert(

        "Üzgünüz, kontenjan dolmuştur."

    );

    await updateCapacity();

    return false;

}
async function handleSubmit(event) {

    event.preventDefault();

    if (APP.loading) {

        return;

    }

    const available =

        await checkCapacityBeforeSubmit();

    if (!available) {

        return;

    }

    const registration = validateForm();

    if (!registration) {

        return;

    }

    try {

        setLoading(true);

        const savedRegistration =

            await addRegistration(

                registration

            );

        APP.registration = savedRegistration;

        clearDraft();

        saveLastRegistration(

            savedRegistration

        );

        await updateCapacity();

        await showSuccess(

            savedRegistration

        );

        showToast(

            "Kayıt başarıyla oluşturuldu."

        );

    }

    catch (error) {

        console.error(error);

        showToast(

            error.message ||

            "Kayıt oluşturulamadı.",

            "error"

        );

    }

    finally {

        setLoading(false);

    }

}

async function showSuccess(registration) {

    APP.registration = registration;

    if (APP.dom.successName) {

        APP.dom.successName.textContent =

            registration.name;

    }

    if (APP.dom.successRegisterNumber) {

        APP.dom.successRegisterNumber.textContent =

            registration.registerNumber;

    }

    if (APP.dom.successSeat) {

        APP.dom.successSeat.textContent =

            registration.seat ||

            "Henüz atanmadı";

    }

    if (APP.dom.registrationInfo) {

        APP.dom.registrationInfo.innerHTML = `

            <div class="success-card">

                <p><strong>Ad Soyad:</strong> ${registration.name}</p>

                <p><strong>Kayıt No:</strong> ${registration.registerNumber}</p>

                <p><strong>Telefon:</strong> ${registration.phone}</p>

                <p><strong>Okul:</strong> ${registration.school}</p>

                <p><strong>Sınıf:</strong> ${registration.class}</p>

                <p><strong>Koltuk:</strong> ${registration.seat || "Henüz atanmadı"}</p>

            </div>

        `;

    }

    if (

        APP.dom.qr &&

        typeof generateQRCode === "function"

    ) {

        APP.dom.qr.innerHTML = "";

        await generateQRCode(

            APP.dom.qr,

            registration

        );

    }

    if (APP.dom.form) {

        APP.dom.form.style.display =

            "none";

    }

    show(APP.dom.success);

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}
async function downloadCurrentPDF() {

    if (!APP.registration) {

        showToast(

            "PDF oluşturulacak kayıt bulunamadı.",

            "error"

        );

        return;

    }

    try {

        await downloadRegistrationPDF(

            APP.registration

        );

    }

    catch (error) {

        console.error(error);

        showToast(

            "PDF oluşturulamadı.",

            "error"

        );

    }

}

function hideSuccess() {

    hide(APP.dom.success);

}

function startNewRegistration() {

    hideSuccess();

    clearErrors();

    clearForm();

    clearLastRegistration();

    if (APP.dom.qr) {

        APP.dom.qr.innerHTML = "";

    }

    if (APP.dom.form) {

        APP.dom.form.style.display = "";

    }

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

async function restoreLastRegistration() {

    const registration =

        loadLastRegistration();

    if (!registration) {

        return;

    }

    APP.registration = registration;

    await showSuccess(registration);

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
function bindEvents() {

    if (APP.dom.form) {

        APP.dom.form.addEventListener(

            "submit",

            handleSubmit

        );

    }

    if (APP.dom.reset) {

        APP.dom.reset.addEventListener(

            "click",

            () => {

                clearErrors();

                clearDraft();

            }

        );

    }

    if (APP.dom.pdf) {

        APP.dom.pdf.addEventListener(

            "click",

            downloadCurrentPDF

        );

    }

    if (APP.dom.again) {

        APP.dom.again.addEventListener(

            "click",

            startNewRegistration

        );

    }

    bindDraftEvents();

}

function setupConnectionEvents() {

    window.addEventListener(

        "online",

        () => {

            showToast(

                "İnternet bağlantısı yeniden sağlandı."

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

    if (!APP.dom.form) {

        console.error(

            "registerForm bulunamadı."

        );

        return;

    }

    setupInputFormatting();

    bindEvents();

    loadDraft();

    setupConnectionEvents();

    await updateCapacity();

    await restoreLastRegistration();

}

document.addEventListener(

    "DOMContentLoaded",

    init

);