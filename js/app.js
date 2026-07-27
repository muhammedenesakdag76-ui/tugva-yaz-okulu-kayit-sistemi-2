// ===============================
// app.js
// TÜGVA İstanbul Final Gezisi
// Bölüm 1
// ===============================

import {
    createParticipant,
    uploadParticipantPhoto,
    generateRegistrationCode
} from "./firebase.js";

import {
    calculateAge,
    isAdult,
    validateForm,
    capitalizeWords,
    onlyNumber,
    showToast,
    showLoading,
    hideLoading
} from "./validation.js";

import {
    generateQRCode
} from "./qr.js";

import {
    downloadParticipantPDF
} from "./pdf.js";

// ===============================
// ELEMENTLER
// ===============================

const form = document.getElementById("registerForm");

const successPage = document.getElementById("successPage");

const parentCard = document.getElementById("parentCard");

const birthDate = document.getElementById("birthDate");

const ageInput = document.getElementById("age");

const tcInput = document.getElementById("tc");

const phoneInput = document.getElementById("phone");

const parentPhoneInput = document.getElementById("parentPhone");

const firstNameInput = document.getElementById("firstName");

const lastNameInput = document.getElementById("lastName");

const parentNameInput = document.getElementById("parentName");

const photoInput = document.getElementById("photo");

const pdfButton = document.getElementById("downloadPdf");

const newButton = document.getElementById("newRegister");

let createdParticipant = null;

// ===============================
// SAYFA BAŞLANGICI
// ===============================

window.addEventListener("load", () => {

    hideLoading();

});

// ===============================
// SADECE RAKAM
// ===============================

tcInput.addEventListener("input", onlyNumber);

phoneInput.addEventListener("input", onlyNumber);

if(parentPhoneInput){

    parentPhoneInput.addEventListener("input", onlyNumber);

}

// ===============================
// İSİMLERİ DÜZELT
// ===============================

firstNameInput.addEventListener("blur", () => {

    firstNameInput.value = capitalizeWords(

        firstNameInput.value

    );

});

lastNameInput.addEventListener("blur", () => {

    lastNameInput.value = capitalizeWords(

        lastNameInput.value

    );

});

parentNameInput.addEventListener("blur", () => {

    parentNameInput.value = capitalizeWords(

        parentNameInput.value

    );

});

// ===============================
// YAŞ HESABI
// ===============================

birthDate.addEventListener("change", () => {

    const age = calculateAge(

        birthDate.value

    );

    ageInput.value = age;

    if(isAdult(age)){

        parentCard.classList.add("hidden");

        parentNameInput.required = false;

        parentPhoneInput.required = false;

    }

    else{

        parentCard.classList.remove("hidden");

        parentNameInput.required = true;

        parentPhoneInput.required = true;

    }

});

// ===============================
// FOTOĞRAF ÖNİZLEME
// ===============================

photoInput.addEventListener("change", () => {

    const file = photoInput.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = e => {

        let preview = document.getElementById("photoPreview");

        if(!preview){

            preview = document.createElement("img");

            preview.id = "photoPreview";

            preview.style.width = "180px";

            preview.style.marginTop = "20px";

            preview.style.borderRadius = "12px";

            photoInput.after(preview);

        }

        preview.src = e.target.result;

    };

    reader.readAsDataURL(file);

});

// ===============================
// VERİYİ TOPLA
// ===============================

function collectData(){

    return{

        registrationCode:generateRegistrationCode(),

        firstName:firstNameInput.value.trim(),

        lastName:lastNameInput.value.trim(),

        tc:tcInput.value.trim(),

        birthDate:birthDate.value,

        age:Number(ageInput.value),

        phone:phoneInput.value.trim(),

        parentName:parentNameInput.value.trim(),

        parentPhone:parentPhoneInput.value.trim(),

        health:document.getElementById("health").value.trim(),

        kvkk:document.getElementById("kvkk").checked,

        tripApproval:document.getElementById("tripApproval").checked,

        accuracy:document.getElementById("accuracy").checked

    };

}
// ===============================
// app.js
// TÜGVA İstanbul Final Gezisi
// Bölüm 2
// ===============================

// ===============================
// FORM GÖNDER
// ===============================

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    showLoading();

    try {

        const participant = collectData();

        const validation = validateForm(participant);

        if (!validation.valid) {

            hideLoading();

            showToast(validation.errors[0], "error");

            return;

        }

        // ---------------------------
        // Firestore Kaydı
        // ---------------------------

        const documentRef = await createParticipant(participant);

        participant.id = documentRef.id;

        // ---------------------------
        // Fotoğraf
        // ---------------------------

        if (photoInput.files.length > 0) {

            const url = await uploadParticipantPhoto(

                photoInput.files[0],

                documentRef.id

            );

            participant.photo = url;

        }

        // ---------------------------
        // QR
        // ---------------------------

        await generateQRCode(

            documentRef.id,

            "qrArea"

        );

        createdParticipant = participant;

        // ---------------------------
        // Form Gizle
        // ---------------------------

        form.classList.add("hidden");

        successPage.classList.remove("hidden");

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

        showToast(

            "Başvurunuz başarıyla kaydedildi."

        );

    }

    catch (error) {

        console.error(error);

        showToast(

            "Kayıt sırasında hata oluştu.",

            "error"

        );

    }

    finally {

        hideLoading();

    }

});

// ===============================
// PDF İNDİR
// ===============================

pdfButton.addEventListener(

    "click",

    async () => {

        if (!createdParticipant) return;

        await downloadParticipantPDF(

            createdParticipant

        );

    }

);

// ===============================
// YENİ BAŞVURU
// ===============================

newButton.addEventListener(

    "click",

    () => {

        form.reset();

        form.classList.remove("hidden");

        successPage.classList.add("hidden");

        createdParticipant = null;

        ageInput.value = "";

        parentCard.classList.remove("hidden");

        const preview = document.getElementById(

            "photoPreview"

        );

        if (preview) {

            preview.remove();

        }

        const qrArea = document.getElementById(

            "qrArea"

        );

        qrArea.innerHTML = "";

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

);

// ===============================
// T.C. UZUNLUK KONTROLÜ
// ===============================

tcInput.addEventListener(

    "input",

    () => {

        if (tcInput.value.length > 11) {

            tcInput.value = tcInput.value.substring(

                0,

                11

            );

        }

    }

);

// ===============================
// TELEFON UZUNLUK
// ===============================

phoneInput.addEventListener(

    "input",

    () => {

        if (phoneInput.value.length > 11) {

            phoneInput.value = phoneInput.value.substring(

                0,

                11

            );

        }

    }

);

if (parentPhoneInput) {

    parentPhoneInput.addEventListener(

        "input",

        () => {

            if (parentPhoneInput.value.length > 11) {

                parentPhoneInput.value = parentPhoneInput.value.substring(

                    0,

                    11

                );

            }

        }

    );

}

// ===============================
// ENTER ENGELLE
// ===============================

document.addEventListener(

    "keydown",

    event => {

        if (

            event.key === "Enter" &&

            event.target.tagName !== "TEXTAREA"

        ) {

            event.preventDefault();

        }

    }

);

// ===============================
// SAYFA AYRILMADAN ÖNCE UYARI
// ===============================

window.addEventListener(

    "beforeunload",

    event => {

        if (

            !form.classList.contains("hidden")

        ) {

            event.preventDefault();

            event.returnValue = "";

        }

    }

);

// ===============================
// BİTİŞ
// ===============================
