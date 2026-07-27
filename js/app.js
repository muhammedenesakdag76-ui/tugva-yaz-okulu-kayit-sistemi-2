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

const form =
    document.getElementById("registrationForm");

const submitButton =
    document.getElementById("submitButton");

const resetButton =
    document.getElementById("resetButton");

const remainingCapacityElement =
    document.getElementById("remainingCapacity");

const remainingCapacityText =
    document.getElementById("remainingCapacityText");

const capacityBar =
    document.getElementById("capacityBar");

const loadingOverlay =
    document.getElementById("loadingOverlay");

const successModal =
    document.getElementById("successModal");

const downloadPdfButton =
    document.getElementById("downloadPdf");

const newRegistrationButton =
    document.getElementById("newRegistration");

let currentRegistration = null;

function $(id) {

    return document.getElementById(id);

}

function showLoading() {

    loadingOverlay.classList.remove("hidden");

}

function hideLoading() {

    loadingOverlay.classList.add("hidden");

}
async function updateCapacity() {

    const remaining = await getRemainingCapacity();

    remainingCapacityElement.textContent = remaining;

    if (remainingCapacityText) {

        remainingCapacityText.textContent = remaining;

    }

    const percentage =
        ((500 - remaining) / 500) * 100;

    if (capacityBar) {

        capacityBar.style.width = `${percentage}%`;

    }

    if (submitButton) {

        submitButton.disabled = remaining <= 0;

    }

}

function getFormData() {

    return {

        id: "",

        registerNumber: "",

        name: $("name").value,

        tc: $("tc").value,

        phone: $("phone").value,

        email: $("email").value,

        birth: $("birth").value,

        gender: $("gender").value,

        school: $("school").value,

        class: $("class").value,

        parent: $("parent").value,

        parentPhone: $("parentPhone").value,

        address: $("address").value,

        note: $("note").value,

        seat: "",

        checkedIn: false,

        createdAt: null

    };

}

function clearErrors() {

    document.querySelectorAll(".error-text")

        .forEach(element => {

            element.textContent = "";

        });

}

function showErrors(errors) {

    clearErrors();

    Object.entries(errors)

        .forEach(([field, message]) => {

            const errorElement =
                document.getElementById(`${field}Error`);

            if (errorElement) {

                errorElement.textContent = message;

            }

        });

}
async function register(event) {

    event.preventDefault();

    clearErrors();

    const result = validateAndNormalize(

        getFormData()

    );

    if (!result.valid) {

        showErrors(result.errors);

        return;

    }

    if (await isCapacityFull()) {

        alert("Kontenjan dolmuştur.");

        await updateCapacity();

        return;

    }

    try {

        showLoading();

        const registration = await addRegistration(

            result.data

        );

        currentRegistration = registration;

        await generateQRCode(

            registration

        );

        showSuccess(registration);

        await updateCapacity();

    } catch (error) {

        alert(

            error.message ||

            "Kayıt sırasında hata oluştu."

        );

    } finally {

        hideLoading();

    }

}

function clearForm() {

    form.reset();

    clearErrors();

}

function showSuccess(registration) {

    successModal.classList.add("show");

    const number =

        document.getElementById(

            "successRegisterNumber"

        );

    if (number) {

        number.textContent =

            registration.registerNumber;

    }

}

function hideSuccess() {

    successModal.classList.remove("show");

}
function bindEvents() {

    form.addEventListener(

        "submit",

        register

    );

    resetButton.addEventListener(

        "click",

        () => {

            clearForm();

        }

    );

    downloadPdfButton.addEventListener(

        "click",

        async () => {

            if (!currentRegistration) {

                return;

            }

            await downloadRegistrationPDF(

                currentRegistration

            );

        }

    );

    newRegistrationButton.addEventListener(

        "click",

        () => {

            hideSuccess();

            clearForm();

            currentRegistration = null;

            $("name").focus();

        }

    );

}

function setupFormatting() {

    $("tc").addEventListener(

        "input",

        event => {

            event.target.value =

                event.target.value

                    .replace(/\D/g, "")

                    .slice(0, 11);

        }

    );

    $("phone").addEventListener(

        "input",

        event => {

            event.target.value =

                event.target.value

                    .replace(/\D/g, "")

                    .slice(0, 11);

        }

    );

    $("parentPhone").addEventListener(

        "input",

        event => {

            event.target.value =

                event.target.value

                    .replace(/\D/g, "")

                    .slice(0, 11);

        }

    );

}
function setupRealtimeValidation() {

    const validators = {

        name: "nameError",

        tc: "tcError",

        phone: "phoneError",

        email: "emailError",

        birth: "birthError",

        gender: "genderError",

        school: "schoolError",

        class: "classError",

        parent: "parentError",

        parentPhone: "parentPhoneError",

        address: "addressError",

        note: "noteError"

    };

    Object.keys(validators).forEach(field => {

        const element = $(field);

        if (!element) return;

        element.addEventListener("blur", () => {

            const result = validateAndNormalize(

                getFormData()

            );

            const errorElement = $(validators[field]);

            if (errorElement) {

                errorElement.textContent =

                    result.errors[field] || "";

            }

        });

    });

}

async function init() {

    await updateCapacity();

    bindEvents();

    setupFormatting();

    setupRealtimeValidation();

    $("name").focus();

}

document.addEventListener(

    "DOMContentLoaded",

    init

);

window.addEventListener(

    "pageshow",

    () => {

        hideLoading();

    }

);
function setupRealtimeValidation() {

    const validators = {

        name: "nameError",

        tc: "tcError",

        phone: "phoneError",

        email: "emailError",

        birth: "birthError",

        gender: "genderError",

        school: "schoolError",

        class: "classError",

        parent: "parentError",

        parentPhone: "parentPhoneError",

        address: "addressError",

        note: "noteError"

    };

    Object.keys(validators).forEach(field => {

        const input = $(field);

        if (!input) return;

        input.addEventListener("blur", () => {

            const result = validateAndNormalize(

                getFormData()

            );

            const errorElement =

                document.getElementById(

                    validators[field]

                );

            if (!errorElement) return;

            errorElement.textContent =

                result.errors[field] || "";

        });

    });

}

async function initialize() {

    await updateCapacity();

    bindEvents();

    setupFormatting();

    setupRealtimeValidation();

    $("name").focus();

}

document.addEventListener(

    "DOMContentLoaded",

    initialize

);

export {

    initialize,

    register,

    clearForm,

    updateCapacity

};
function setupRealtimeValidation() {

    const fields = [

        "name",

        "tc",

        "phone",

        "email",

        "birth",

        "gender",

        "school",

        "class",

        "parent",

        "parentPhone",

        "address",

        "note"

    ];

    fields.forEach(id => {

        const input = $(id);

        if (!input) {

            return;

        }

        input.addEventListener(

            "input",

            () => {

                const result = validateAndNormalize(

                    getFormData()

                );

                const errorElement = document.getElementById(

                    `${id}Error`

                );

                if (!errorElement) {

                    return;

                }

                errorElement.textContent =

                    result.errors[id] || "";

            }

        );

    });

}

async function initialize() {

    await updateCapacity();

    bindEvents();

    setupFormatting();

    setupRealtimeValidation();

    $("name").focus();

}

document.addEventListener(

    "DOMContentLoaded",

    () => {

        initialize()

            .catch(error => {

                console.error(error);

                alert(

                    "Sistem başlatılamadı."

                );

            });

    }

);
function showToast(message, type = "success") {

    const container = document.getElementById("toastContainer");

    if (!container) {

        return;

    }

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.textContent = message;

    container.appendChild(toast);

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

function setButtonLoading(loading) {

    submitButton.disabled = loading;

    if (loading) {

        submitButton.dataset.originalText = submitButton.textContent;

        submitButton.textContent = "Kaydediliyor...";

    } else {

        submitButton.textContent =
            submitButton.dataset.originalText ||
            "Kaydı Tamamla";

    }

}

window.addEventListener("online", () => {

    showToast(

        "İnternet bağlantısı yeniden kuruldu."

    );

});

window.addEventListener("offline", () => {

    showToast(

        "İnternet bağlantısı kesildi.",

        "error"

    );

});

document.addEventListener("keydown", event => {

    if (

        event.key === "Escape" &&

        successModal.classList.contains("show")

    ) {

        hideSuccess();

    }

});
function fillForm(data) {

    $("name").value = data.name ?? "";

    $("tc").value = data.tc ?? "";

    $("phone").value = data.phone ?? "";

    $("email").value = data.email ?? "";

    $("birth").value = data.birth ?? "";

    $("gender").value = data.gender ?? "";

    $("school").value = data.school ?? "";

    $("class").value = data.class ?? "";

    $("parent").value = data.parent ?? "";

    $("parentPhone").value = data.parentPhone ?? "";

    $("address").value = data.address ?? "";

    $("note").value = data.note ?? "";

}

function setFormEnabled(enabled) {

    const elements = form.querySelectorAll(

        "input, select, textarea, button"

    );

    elements.forEach(element => {

        if (

            element.id === "downloadPdf" ||

            element.id === "newRegistration"

        ) {

            return;

        }

        element.disabled = !enabled;

    });

}

function scrollToFirstError() {

    const firstError = document.querySelector(

        ".error-text:not(:empty)"

    );

    if (!firstError) {

        return;

    }

    firstError.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

}

function resetApplication() {

    currentRegistration = null;

    clearForm();

    hideSuccess();

    setFormEnabled(true);

    $("name").focus();

}
function saveRegistration(registration) {

    try {

        localStorage.setItem(

            "lastRegistration",

            JSON.stringify(registration)

        );

    } catch {

        console.warn(

            "Kayıt yerel depolamaya kaydedilemedi."

        );

    }

}

function loadLastRegistration() {

    try {

        const data = localStorage.getItem(

            "lastRegistration"

        );

        if (!data) {

            return null;

        }

        return JSON.parse(data);

    } catch {

        return null;

    }

}

function clearLastRegistration() {

    localStorage.removeItem(

        "lastRegistration"

    );

}

function disableForm() {

    setFormEnabled(false);

}

function enableForm() {

    setFormEnabled(true);

}

async function afterSuccessfulRegistration(registration) {

    currentRegistration = registration;

    saveRegistration(registration);

    await updateCapacity();

    showSuccess(registration);

    disableForm();

    showToast(

        "Kayıt başarıyla oluşturuldu."

    );

}
function restoreLastRegistration() {

    const registration = loadLastRegistration();

    if (!registration) {

        return;

    }

    currentRegistration = registration;

}

function setupAutoSave() {

    const fields = form.querySelectorAll(

        "input, select, textarea"

    );

    fields.forEach(field => {

        field.addEventListener(

            "change",

            () => {

                const data = getFormData();

                localStorage.setItem(

                    "registrationDraft",

                    JSON.stringify(data)

                );

            }

        );

    });

}

function restoreDraft() {

    const draft = localStorage.getItem(

        "registrationDraft"

    );

    if (!draft) {

        return;

    }

    try {

        fillForm(

            JSON.parse(draft)

        );

    } catch {

        localStorage.removeItem(

            "registrationDraft"

        );

    }

}

function clearDraft() {

    localStorage.removeItem(

        "registrationDraft"

    );

}

async function initializeApplication() {

    await updateCapacity();

    bindEvents();

    setupFormatting();

    setupRealtimeValidation();

    setupAutoSave();

    restoreDraft();

    restoreLastRegistration();

    $("name").focus();

}
function setupCharacterCounters() {

    const configs = [

        {

            field: "address",

            counter: "addressCounter",

            max: 300

        },

        {

            field: "note",

            counter: "noteCounter",

            max: 500

        }

    ];

    configs.forEach(item => {

        const input = $(item.field);

        const counter = $(item.counter);

        if (!input || !counter) {

            return;

        }

        const update = () => {

            counter.textContent =

                `${input.value.length}/${item.max}`;

        };

        input.addEventListener(

            "input",

            update

        );

        update();

    });

}

function clearApplication() {

    clearDraft();

    clearLastRegistration();

    currentRegistration = null;

    clearForm();

    hideSuccess();

    enableForm();

    $("name").focus();

}

newRegistrationButton.addEventListener(

    "click",

    () => {

        clearApplication();

    }

);

downloadPdfButton.addEventListener(

    "click",

    async () => {

        if (!currentRegistration) {

            return;

        }

        await downloadRegistrationPDF(

            currentRegistration

        );

    }

);
function initializeConnectionWatcher() {

    const offlineBanner =
        document.getElementById("offlineBanner");

    const onlineBanner =
        document.getElementById("onlineBanner");

    window.addEventListener("offline", () => {

        if (offlineBanner) {

            offlineBanner.classList.remove("hidden");

        }

        if (onlineBanner) {

            onlineBanner.classList.add("hidden");

        }

    });

    window.addEventListener("online", () => {

        if (offlineBanner) {

            offlineBanner.classList.add("hidden");

        }

        if (onlineBanner) {

            onlineBanner.classList.remove("hidden");

            setTimeout(() => {

                onlineBanner.classList.add("hidden");

            }, 3000);

        }

        updateCapacity();

    });

}

function initializeScrollButton() {

    const button = document.getElementById("pageTop");

    if (!button) {

        return;

    }

    window.addEventListener("scroll", () => {

        if (window.scrollY > 300) {

            button.classList.add("show");

        } else {

            button.classList.remove("show");

        }

    });

    button.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}

async function startApplication() {

    await initializeApplication();

    setupCharacterCounters();

    initializeConnectionWatcher();

    initializeScrollButton();

}

document.addEventListener("DOMContentLoaded", () => {

    startApplication().catch(error => {

        console.error(error);

        alert("Sistem başlatılırken beklenmeyen bir hata oluştu.");

    });

});
function initializeKeyboardShortcuts() {

    document.addEventListener("keydown", event => {

        if (event.ctrlKey && event.key.toLowerCase() === "s") {

            event.preventDefault();

            form.requestSubmit();

        }

        if (event.key === "Escape") {

            hideSuccess();

        }

    });

}

function initializeBeforeUnload() {

    window.addEventListener("beforeunload", event => {

        const data = getFormData();

        const hasData = Object.values(data).some(value => {

            return String(value).trim() !== "";

        });

        if (!hasData) {

            return;

        }

        event.preventDefault();

        event.returnValue = "";

    });

}

function initializeVisibilityEvents() {

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {

            return;

        }

        updateCapacity();

    });

}

function initializeResizeEvents() {

    window.addEventListener("resize", () => {

        document.documentElement.style.setProperty(

            "--window-height",

            `${window.innerHeight}px`

        );

    });

}

async function boot() {

    await startApplication();

    initializeKeyboardShortcuts();

    initializeBeforeUnload();

    initializeVisibilityEvents();

    initializeResizeEvents();

}