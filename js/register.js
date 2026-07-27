import {
    createRegistration,
    getRemainingCapacity
} from "./firebase.js";

import {
    downloadPDF
} from "./pdf.js";


// ===============================
// Elements
// ===============================

const form = document.getElementById("registerForm");

const remainingElement =
    document.getElementById("remainingCapacity");

const submitButton =
    document.getElementById("submitButton");


// ===============================
// Remaining Capacity
// ===============================

async function refreshCapacity() {

    if (!remainingElement) return;

    const remaining = await getRemainingCapacity();

    remainingElement.textContent = remaining;

}

refreshCapacity();


// ===============================
// Validators
// ===============================

function onlyNumbers(value) {

    return value.replace(/\D/g, "");

}


function validateTC(tc) {

    tc = onlyNumbers(tc);

    if (tc.length !== 11) return false;

    if (tc[0] === "0") return false;

    let odd = 0;
    let even = 0;

    for (let i = 0; i < 9; i++) {

        if (i % 2 === 0)
            odd += Number(tc[i]);

        else
            even += Number(tc[i]);

    }

    const digit10 =
        ((odd * 7) - even) % 10;

    if (digit10 != tc[9])
        return false;

    let total = 0;

    for (let i = 0; i < 10; i++) {

        total += Number(tc[i]);

    }

    const digit11 = total % 10;

    return digit11 == tc[10];

}


function validatePhone(phone) {

    phone = onlyNumbers(phone);

    return phone.length === 10
        || phone.length === 11;

}


function validateEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}
// ===============================
// Form Submit
// ===============================

if (form) {

    form.addEventListener("submit", submitForm);

}

async function submitForm(e) {

    e.preventDefault();

    submitButton.disabled = true;
    submitButton.textContent = "Kaydediliyor...";

    try {

        const data = getFormData();

        validateForm(data);

        const registration =
            await createRegistration(data);

        showSuccess(registration);

    } catch (error) {

        alert(error.message);

    } finally {

        submitButton.disabled = false;
        submitButton.textContent = "Kaydı Tamamla";

        refreshCapacity();

    }

}


// ===============================
// Read Form
// ===============================

function getFormData() {

    return {

        adSoyad:
            document.getElementById("adSoyad").value.trim(),

        tc:
            onlyNumbers(
                document.getElementById("tc").value
            ),

        telefon:
            onlyNumbers(
                document.getElementById("telefon").value
            ),

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
            onlyNumbers(
                document.getElementById("veliTelefon").value
            ),

        adres:
            document.getElementById("adres").value.trim(),

        not:
            document.getElementById("not").value.trim()

    };

}


// ===============================
// Validation
// ===============================

function validateForm(data) {

    if (!data.adSoyad)
        throw new Error("Ad Soyad zorunludur.");

    if (!validateTC(data.tc))
        throw new Error("TC Kimlik Numarası geçersiz.");

    if (!validatePhone(data.telefon))
        throw new Error("Telefon numarası geçersiz.");

    if (!validateEmail(data.email))
        throw new Error("E-posta adresi geçersiz.");

    if (!data.dogumTarihi)
        throw new Error("Doğum tarihi seçiniz.");

    if (!data.cinsiyet)
        throw new Error("Cinsiyet seçiniz.");

    if (!data.okul)
        throw new Error("Okul bilgisi zorunludur.");

    if (!data.sinif)
        throw new Error("Sınıf bilgisi zorunludur.");

    if (!data.veliAdi)
        throw new Error("Veli adı zorunludur.");

    if (!validatePhone(data.veliTelefon))
        throw new Error("Veli telefonu geçersiz.");

}
// ===============================
// Success Screen
// ===============================

function showSuccess(registration) {

    const formSection =
        document.getElementById("formSection");

    const successCard =
        document.getElementById("successCard");

    if (formSection)
        formSection.style.display = "none";

    if (successCard)
        successCard.style.display = "block";

    const registerNumber =
        document.getElementById("registerNumber");

    if (registerNumber) {

        registerNumber.textContent =
            registration.kayitNo;

    }

    createQRCode(registration.kayitNo);

    preparePDF(registration);

}


// ===============================
// QR Code
// ===============================

function createQRCode(kayitNo) {

    const qrElement =
        document.getElementById("qrcode");

    if (!qrElement) return;

    qrElement.innerHTML = "";

    const qrURL =
        `${window.location.origin}${window.location.pathname.replace("index.html","")}checkin.html?id=${kayitNo}`;

    new QRCode(qrElement, {

        text: qrURL,

        width: 220,

        height: 220,

        correctLevel: QRCode.CorrectLevel.H

    });

}


// ===============================
// Prepare PDF
// ===============================

function preparePDF(registration) {

    window.currentRegistration =
        registration;

}


// ===============================
// New Registration
// ===============================

const newButton =
    document.getElementById("newRegister");

if (newButton) {

    newButton.addEventListener("click", () => {

        location.reload();

    });

}


// ===============================
// PDF Download
// ===============================

const pdfButton =
    document.getElementById("downloadPdf");

if (pdfButton) {

    pdfButton.addEventListener("click", async () => {

        if (!window.currentRegistration)
            return;

        pdfButton.disabled = true;

        pdfButton.innerHTML = "PDF Hazırlanıyor...";

        try {

            await downloadPDF(
                window.currentRegistration
            );

        } catch (err) {

            console.error(err);

            alert("PDF oluşturulamadı.");

        } finally {

            pdfButton.disabled = false;

            pdfButton.innerHTML = "PDF İndir";

        }

    });

}


// ===============================
// Input Masks
// ===============================

const tcInput =
    document.getElementById("tc");

if (tcInput) {

    tcInput.addEventListener("input", () => {

        tcInput.value =
            tcInput.value
                .replace(/\D/g, "")
                .substring(0, 11);

    });

}


const phoneInput =
    document.getElementById("telefon");

if (phoneInput) {

    phoneInput.addEventListener("input", () => {

        phoneInput.value =
            phoneInput.value
                .replace(/\D/g, "")
                .substring(0, 11);

    });

}


const parentPhone =
    document.getElementById("veliTelefon");

if (parentPhone) {

    parentPhone.addEventListener("input", () => {

        parentPhone.value =
            parentPhone.value
                .replace(/\D/g, "")
                .substring(0, 11);

    });

}


// ===============================
// Enter Key
// ===============================

document.addEventListener("keydown", e => {

    if (
        e.key === "Enter" &&
        e.target.tagName !== "TEXTAREA"
    ) {

        e.preventDefault();

    }

});


// ===============================
// Auto Focus
// ===============================

window.addEventListener("load", () => {

    const first =
        document.getElementById("adSoyad");

    if (first)
        first.focus();

});