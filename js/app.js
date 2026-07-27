import {
    addRegistration,
    generateRegisterNumber,
    registrationExists,
    phoneExists,
    isFull,
    getRemainingCapacity
} from "./firebase.js";

import {
    validateAndPrepare,
    showErrors,
    clearErrors
} from "./validation.js";

import {
    downloadRegistrationPDF
} from "./pdf.js";

const form = document.getElementById("registrationForm");

const submitButton = document.getElementById("submitButton");

const remainingElement = document.getElementById("remainingCapacity");

const successModal = document.getElementById("successModal");

const pdfButton = document.getElementById("downloadPdf");

const newButton = document.getElementById("newRegistration");

let lastRegistration = null;

async function updateCapacity() {

    if (!remainingElement) return;

    const remaining = await getRemainingCapacity();

    remainingElement.textContent = remaining;

}

function getFormData() {

    const formData = new FormData(form);

    return {

        name: formData.get("name"),

        tc: formData.get("tc"),

        phone: formData.get("phone"),

        email: formData.get("email"),

        birth: formData.get("birth"),

        gender: formData.get("gender"),

        school: formData.get("school"),

        class: formData.get("class"),

        parent: formData.get("parent"),

        parentPhone: formData.get("parentPhone"),

        address: formData.get("address"),

        note: formData.get("note")

    };

}

function setLoading(status) {

    submitButton.disabled = status;

    submitButton.textContent = status

        ? "Kaydediliyor..."

        : "Kaydı Tamamla";

}
async function register() {

    clearErrors();

    const rawData = getFormData();

    const result = validateAndPrepare(rawData);

    if (!result.valid) {

        showErrors(result);

        return;

    }

    const data = result.data;

    setLoading(true);

    try {

        if (await isFull()) {

            alert("Kontenjan dolmuştur.");

            return;

        }

        if (await registrationExists(data.tc)) {

            alert("Bu T.C. Kimlik Numarası ile daha önce kayıt yapılmış.");

            return;

        }

        if (await phoneExists(data.phone)) {

            alert("Bu telefon numarası ile daha önce kayıt yapılmış.");

            return;

        }

        data.registerNumber = await generateRegisterNumber();

        const id = await addRegistration(data);

        lastRegistration = {

            id,

            ...data

        };

        showSuccess();

        await updateCapacity();

    }

    catch (error) {

        console.error(error);

        alert("Kayıt sırasında bir hata oluştu.");

    }

    finally {

        setLoading(false);

    }

}
function clearForm() {

    form.reset();

    clearErrors();

}

function showSuccess() {

    if (!successModal) {

        alert("Kayıt başarıyla tamamlandı.");

        return;

    }

    successModal.classList.add("show");

}

function hideSuccess() {

    if (!successModal) return;

    successModal.classList.remove("show");

}

pdfButton?.addEventListener("click", async () => {

    if (!lastRegistration) return;

    try {

        await downloadRegistrationPDF(lastRegistration);

    }

    catch (error) {

        console.error(error);

        alert("PDF oluşturulamadı.");

    }

});

newButton?.addEventListener("click", () => {

    hideSuccess();

    clearForm();

    lastRegistration = null;

});
form?.addEventListener("submit", async (event) => {

    event.preventDefault();

    await register();

});

form?.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        const tag = event.target.tagName;

        if (tag !== "TEXTAREA") {

            event.preventDefault();

            register();

        }

    }

});

document
.querySelector('input[name="tc"]')
?.addEventListener("input", function () {

    this.value = this.value
        .replace(/\D/g, "")
        .slice(0, 11);

});

document
.querySelector('input[name="phone"]')
?.addEventListener("input", function () {

    this.value = this.value
        .replace(/\D/g, "")
        .slice(0, 11);

});

document
.querySelector('input[name="parentPhone"]')
?.addEventListener("input", function () {

    this.value = this.value
        .replace(/\D/g, "")
        .slice(0, 11);

});

[
    'input[name="name"]',
    'input[name="parent"]',
    'input[name="school"]'
].forEach(selector => {

    document.querySelector(selector)
    ?.addEventListener("blur", function () {

        this.value = this.value
            .toLocaleLowerCase("tr-TR")
            .replace(/\b\w/g, c =>
                c.toLocaleUpperCase("tr-TR")
            );

    });

});
function setFieldError(input, message = "") {

    if (!input) return;

    input.classList.toggle("input-error", Boolean(message));

    const error = document.getElementById(`${input.name}Error`);

    if (error) {

        error.textContent = message;

    }

}

async function validateField(input) {

    const data = getFormData();

    const result = validateAndPrepare(data);

    setFieldError(

        input,

        result.errors[input.name] || ""

    );

}

form?.querySelectorAll("input, select, textarea")
.forEach(input => {

    if (input.hasAttribute("required")) {

        input.addEventListener("blur", () => {

            validateField(input);

        });

        input.addEventListener("input", () => {

            if (input.classList.contains("input-error")) {

                validateField(input);

            }

        });

    }

});

window.addEventListener("DOMContentLoaded", async () => {

    await updateCapacity();

    clearErrors();

    form?.querySelectorAll("[required]").forEach(input => {

        input.setAttribute(

            "aria-required",

            "true"

        );

    });

});
function lockForm(lock = true) {

    form?.querySelectorAll(

        "input, select, textarea, button"

    ).forEach(element => {

        if (element.id === "downloadPdf") return;
        if (element.id === "newRegistration") return;

        element.disabled = lock;

    });

}

function unlockForm() {

    lockForm(false);

}

function openSuccessModal() {

    if (!successModal) return;

    successModal.classList.add("show");

    lockForm(true);

}

function closeSuccessModal() {

    if (!successModal) return;

    successModal.classList.remove("show");

}

function startNewRegistration() {

    closeSuccessModal();

    unlockForm();

    clearForm();

    lastRegistration = null;

    document
        .querySelector('input[name="name"]')
        ?.focus();

}

newButton?.addEventListener(

    "click",

    startNewRegistration

);

document.addEventListener(

    "keydown",

    event => {

        if (

            event.key === "Escape" &&

            successModal?.classList.contains("show")

        ) {

            startNewRegistration();

        }

    }

);

successModal?.addEventListener(

    "click",

    event => {

        if (event.target === successModal) {

            startNewRegistration();

        }

    }

);
function formatPhoneInput(value) {

    const digits = value
        .replace(/\D/g, "")
        .slice(0, 11);

    if (digits.length <= 4) return digits;

    if (digits.length <= 7) {
        return `${digits.slice(0,4)} ${digits.slice(4)}`;
    }

    if (digits.length <= 9) {
        return `${digits.slice(0,4)} ${digits.slice(4,7)} ${digits.slice(7)}`;
    }

    return `${digits.slice(0,4)} ${digits.slice(4,7)} ${digits.slice(7,9)} ${digits.slice(9,11)}`;

}

[
    'input[name="phone"]',
    'input[name="parentPhone"]'
].forEach(selector => {

    const input = document.querySelector(selector);

    if (!input) return;

    input.addEventListener("input", function () {

        const cursor = this.selectionStart;

        this.value = formatPhoneInput(this.value);

        this.setSelectionRange(cursor, cursor);

    });

});

const tcInput = document.querySelector('input[name="tc"]');

tcInput?.addEventListener("paste", event => {

    event.preventDefault();

    const pasted = (
        event.clipboardData ||
        window.clipboardData
    )
    .getData("text")
    .replace(/\D/g, "")
    .slice(0, 11);

    tcInput.value = pasted;

});

const birthInput = document.querySelector(
    'input[name="birth"]'
);

if (birthInput) {

    const today = new Date();

    const min = new Date();

    const max = new Date();

    min.setFullYear(today.getFullYear() - 18);

    max.setFullYear(today.getFullYear() - 7);

    birthInput.min = min.toISOString().split("T")[0];

    birthInput.max = max.toISOString().split("T")[0];

}

window.addEventListener("load", () => {

    document
        .querySelector('input[name="name"]')
        ?.focus();

});
async function init() {

    try {

        await updateCapacity();

        clearErrors();

        unlockForm();

        lastRegistration = null;

        const firstInput = document.querySelector(
            'input[name="name"]'
        );

        firstInput?.focus();

        console.log(
            "TÜGVA Yaz Okulu Kayıt Sistemi hazır."
        );

    }

    catch (error) {

        console.error(error);

        alert(
            "Sistem başlatılırken bir hata oluştu."
        );

    }

}

window.addEventListener(

    "DOMContentLoaded",

    init

);

window.addEventListener(

    "error",

    event => {

        console.error(

            "Beklenmeyen Hata:",

            event.error

        );

    }

);

window.addEventListener(

    "unhandledrejection",

    event => {

        console.error(

            "Yakalanmayan Promise:",

            event.reason

        );

    }

);

export {

    register,

    updateCapacity,

    clearForm,

    getFormData,

    startNewRegistration,

    init

};