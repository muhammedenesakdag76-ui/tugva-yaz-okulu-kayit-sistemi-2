/* ===========================================
   utils.js
=========================================== */

/* ---------- DOM ---------- */

export function $(selector) {

    return document.querySelector(selector);

}

export function $$(selector) {

    return document.querySelectorAll(selector);

}

/* ---------- Loading ---------- */

export function showLoading() {

    $("#loadingOverlay")
        ?.classList
        .remove("d-none");

}

export function hideLoading() {

    $("#loadingOverlay")
        ?.classList
        .add("d-none");

}

/* ---------- Toast ---------- */

export function showToast(
    message,
    type = "success"
) {

    const toast = document.createElement("div");

    toast.className =
        `toast-message toast-${type}`;

    toast.innerText = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {

        toast.classList.add("show");

    });

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        },300);

    },3000);

}

/* ---------- Telefon ---------- */

export function formatPhone(phone="") {

    phone =
        phone.replace(/\D/g,"");

    if(phone.length!==11)
        return phone;

    return `${phone.substring(0,4)} ${phone.substring(4,7)} ${phone.substring(7,9)} ${phone.substring(9)}`;

}

/* ---------- Tarih ---------- */

export function formatDate(dateString){

    if(!dateString)
        return "";

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        "tr-TR"
    );

}

/* ---------- Büyük Harf ---------- */

export function capitalizeWords(text=""){

    return text

        .toLocaleLowerCase("tr")

        .replace(/\b\w/g,function(letter){

            return letter.toLocaleUpperCase("tr");

        });

}
/* ---------- Draft ---------- */

const DRAFT_KEY =
    "tugva_registration_draft";

export function saveDraft(data){

    localStorage.setItem(

        DRAFT_KEY,

        JSON.stringify(data)

    );

}

export function restoreDraft(){

    const draft =
        localStorage.getItem(
            DRAFT_KEY
        );

    if(!draft)
        return null;

    try{

        return JSON.parse(draft);

    }

    catch{

        return null;

    }

}

export function clearDraft(){

    localStorage.removeItem(
        DRAFT_KEY
    );

}

/* ---------- Form ---------- */

export function clearForm(form){

    form.reset();

}

export function toggleStudentFields(show){

    document

        .querySelectorAll(
            ".student-field"
        )

        .forEach(field=>{

            field.style.display =
                show
                ? ""
                : "none";

        });

}

/* ---------- QR ---------- */

export function createQRPayload(id){

    return JSON.stringify({

        id

    });

}

/* ---------- Random ---------- */

export function randomId(){

    return Math.random()

        .toString(36)

        .substring(2,10);

}

/* ---------- Clipboard ---------- */

export async function copy(text){

    await navigator.clipboard.writeText(
        text
    );

}

/* ---------- Sleep ---------- */

export function sleep(ms){

    return new Promise(resolve=>{

        setTimeout(resolve,ms);

    });

}