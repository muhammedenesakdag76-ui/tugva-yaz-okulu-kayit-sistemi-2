const STORAGE_KEY = "tugva_yaz_okulu_form";

export function $(selector) {

    return document.querySelector(selector);

}

export function $$(selector) {

    return document.querySelectorAll(selector);

}

export function showLoading() {

    $("#loadingScreen").classList.remove("d-none");

}

export function hideLoading() {

    $("#loadingScreen").classList.add("d-none");

}

export function showSuccess(message) {

    alert(message);

}

export function showError(message) {

    alert(message);

}

export function formatPhone(phone) {

    phone = String(phone).replace(/\D/g, "");

    if (phone.length !== 11) return phone;

    return `${phone.substring(0,4)} ${phone.substring(4,7)} ${phone.substring(7,9)} ${phone.substring(9,11)}`;

}

export function formatDate(date) {

    if (!date) return "";

    const d = new Date(date);

    return d.toLocaleDateString("tr-TR");

}

export function saveDraft(form) {

    const data = {};

    [...form.elements].forEach(element => {

        if (!element.id) return;

        if (element.type === "button") return;

        if (element.type === "submit") return;

        data[element.id] = element.value;

    });

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(data)

    );

}

export function restoreDraft(form) {

    const raw = localStorage.getItem(

        STORAGE_KEY

    );

    if (!raw) return;

    const data = JSON.parse(raw);

    Object.keys(data).forEach(key => {

        const input = form.querySelector(

            "#" + key

        );

        if (input) {

            input.value = data[key];

        }

    });

}

export function clearDraft() {

    localStorage.removeItem(

        STORAGE_KEY

    );

}

export function generateQRData(registration) {

    return JSON.stringify({

        id: registration.id,

        registerNumber:

            registration.registerNumber

    });

}

export function calculateAge(date) {

    const birth = new Date(date);

    const today = new Date();

    let age =

        today.getFullYear()

        -

        birth.getFullYear();

    const month =

        today.getMonth()

        -

        birth.getMonth();

    if (

        month < 0 ||

        (

            month === 0 &&

            today.getDate() < birth.getDate()

        )

    ) {

        age--;

    }

    return age;

}

export function toggleStudentFields(form) {

    const age = calculateAge(

        form.birthDate.value

    );

    const fields =

        document.querySelectorAll(

            ".student-field"

        );

    fields.forEach(field => {

        field.classList.toggle(

            "hidden",

            age >= 18

        );

    });

}

export function randomId(length = 8) {

    const chars =

        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let result = "";

    for (

        let i = 0;

        i < length;

        i++

    ) {

        result +=

            chars[

                Math.floor(

                    Math.random()

                    *

                    chars.length

                )

            ];

    }

    return result;

}

export function copy(text) {

    navigator.clipboard.writeText(text);

}

export function sleep(ms) {

    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });

}