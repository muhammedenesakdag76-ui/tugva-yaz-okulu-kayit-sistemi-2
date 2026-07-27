// ===============================
// firebase.js
// TÜGVA İstanbul Final Gezisi
// Firebase v11 Modular
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {

    getFirestore,

    collection,

    addDoc,

    doc,

    getDoc,

    getDocs,

    updateDoc,

    deleteDoc,

    onSnapshot,

    query,

    orderBy,

    where,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {

    getStorage,

    ref,

    uploadBytes,

    getDownloadURL,

    deleteObject

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";



// Firebase Config

const firebaseConfig = {

    apiKey: "BURAYA_API_KEY",

    authDomain: "BURAYA_AUTH_DOMAIN",

    projectId: "BURAYA_PROJECT_ID",

    storageBucket: "BURAYA_STORAGE_BUCKET",

    messagingSenderId: "BURAYA_SENDER_ID",

    appId: "BURAYA_APP_ID"

};



// App

export const app = initializeApp(firebaseConfig);



// Services

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);



// Collections

export const participantsCollection = collection(db, "participants");



// ==========================
// Authentication
// ==========================

export async function login(email, password) {

    return await signInWithEmailAndPassword(

        auth,

        email,

        password

    );

}

export async function logout() {

    return await signOut(auth);

}

export function authListener(callback) {

    return onAuthStateChanged(

        auth,

        callback

    );

}



// ==========================
// Participant CRUD
// ==========================

export async function createParticipant(data) {

    data.createdAt = serverTimestamp();

    data.updatedAt = serverTimestamp();

    data.busNumber = "";

    data.seatNumber = "";

    data.checkedIn = false;

    return await addDoc(

        participantsCollection,

        data

    );

}

export async function updateParticipant(id, data) {

    data.updatedAt = serverTimestamp();

    return await updateDoc(

        doc(db, "participants", id),

        data

    );

}

export async function deleteParticipant(id) {

    return await deleteDoc(

        doc(db, "participants", id)

    );

}

export async function getParticipant(id) {

    const snapshot = await getDoc(

        doc(db, "participants", id)

    );

    if (!snapshot.exists()) {

        return null;

    }

    return {

        id: snapshot.id,

        ...snapshot.data()

    };

}

export async function getAllParticipants() {

    const q = query(

        participantsCollection,

        orderBy("createdAt", "desc")

    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(item => ({

        id: item.id,

        ...item.data()

    }));

}

export function realtimeParticipants(callback) {

    const q = query(

        participantsCollection,

        orderBy("createdAt", "desc")

    );

    return onSnapshot(

        q,

        snapshot => {

            const list = snapshot.docs.map(item => ({

                id: item.id,

                ...item.data()

            }));

            callback(list);

        }

    );

}



// ==========================
// Search
// ==========================

export async function searchByTC(tc) {

    const q = query(

        participantsCollection,

        where("tc", "==", tc)

    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(item => ({

        id: item.id,

        ...item.data()

    }));

}



// ==========================
// Photo Upload
// ==========================

export async function uploadParticipantPhoto(file, id) {

    const fileRef = ref(

        storage,

        `participants/${id}.jpg`

    );

    await uploadBytes(

        fileRef,

        file

    );

    return await getDownloadURL(fileRef);

}

export async function removeParticipantPhoto(id) {

    const fileRef = ref(

        storage,

        `participants/${id}.jpg`

    );

    return await deleteObject(fileRef);

}



// ==========================
// Helpers
// ==========================

export function generateRegistrationCode() {

    const random = Math.random()

        .toString(36)

        .substring(2, 8)

        .toUpperCase();

    return `IST-${Date.now()}-${random}`;

}

export function currentUser() {

    return auth.currentUser;

}

export function isLoggedIn() {

    return !!auth.currentUser;

}
// ===============================
// validation.js
// TÜGVA İstanbul Final Gezisi
// ===============================

// ---------- T.C. Kimlik ----------

export function validateTC(tc) {

    tc = tc.replace(/\D/g, "");

    if (tc.length !== 11) return false;

    if (tc[0] === "0") return false;

    const numbers = tc.split("").map(Number);

    let odd = 0;
    let even = 0;

    for (let i = 0; i < 9; i++) {

        if (i % 2 === 0) {
            odd += numbers[i];
        } else {
            even += numbers[i];
        }

    }

    const digit10 = ((odd * 7) - even) % 10;

    if (digit10 !== numbers[9]) {

        return false;

    }

    const total = numbers
        .slice(0, 10)
        .reduce((a, b) => a + b, 0);

    if ((total % 10) !== numbers[10]) {

        return false;

    }

    return true;

}



// ---------- Telefon ----------

export function validatePhone(phone) {

    phone = phone.replace(/\D/g, "");

    return /^05\d{9}$/.test(phone);

}



// ---------- E-Posta ----------

export function validateEmail(email) {

    if (!email) return true;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}



// ---------- Yaş Hesaplama ----------

export function calculateAge(date) {

    if (!date) return 0;

    const birth = new Date(date);

    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const month = today.getMonth() - birth.getMonth();

    if (

        month < 0 ||

        (month === 0 && today.getDate() < birth.getDate())

    ) {

        age--;

    }

    return age;

}



// ---------- Reşit Kontrolü ----------

export function isAdult(age) {

    return age >= 18;

}



// ---------- Ad Soyad ----------

export function validateName(name) {

    return /^[A-Za-zÇĞİÖŞÜçğıöşü\s]{2,60}$/.test(

        name.trim()

    );

}



// ---------- Sağlık Bilgisi ----------

export function sanitizeText(text) {

    return text

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .trim();

}



// ---------- Büyük Harf ----------

export function capitalizeWords(text) {

    return text

        .toLocaleLowerCase("tr")

        .replace(/\b\w/g, letter =>

            letter.toLocaleUpperCase("tr")

        );

}



// ---------- Telefon Formatı ----------

export function formatPhone(phone) {

    phone = phone.replace(/\D/g, "");

    if (phone.length !== 11) return phone;

    return `${phone.substring(0,4)} ${phone.substring(4,7)} ${phone.substring(7,9)} ${phone.substring(9,11)}`;

}



// ---------- Input Temizleme ----------

export function onlyNumber(event) {

    event.target.value = event.target.value

        .replace(/\D/g, "");

}



// ---------- Form Kontrolü ----------

export function validateForm(data) {

    const errors = [];

    if (!validateName(data.firstName))

        errors.push("Ad geçersiz.");

    if (!validateName(data.lastName))

        errors.push("Soyad geçersiz.");

    if (!validateTC(data.tc))

        errors.push("T.C. Kimlik No geçersiz.");

    if (!validatePhone(data.phone))

        errors.push("Telefon numarası geçersiz.");

    if (data.email && !validateEmail(data.email))

        errors.push("E-posta adresi geçersiz.");

    if (data.age < 0)

        errors.push("Doğum tarihi geçersiz.");

    if (data.age < 18) {

        if (!validateName(data.parentName))

            errors.push("Veli adı geçersiz.");

        if (!validatePhone(data.parentPhone))

            errors.push("Veli telefonu geçersiz.");

    }

    if (!data.kvkk)

        errors.push("KVKK onayı zorunludur.");

    if (!data.tripApproval)

        errors.push("Gezi onayı zorunludur.");

    if (!data.accuracy)

        errors.push("Bilgi doğruluğu onayı zorunludur.");

    return {

        valid: errors.length === 0,

        errors

    };

}



// ---------- Toast ----------

export function showToast(message, type = "success") {

    const container = document.getElementById("toastContainer");

    if (!container) return;

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3500);

}



// ---------- Loading ----------

export function showLoading() {

    const loading = document.getElementById("loading");

    if (loading)

        loading.style.display = "flex";

}

export function hideLoading() {

    const loading = document.getElementById("loading");

    if (loading)

        loading.style.display = "none";

}
// ===============================
// qr.js
// TÜGVA İstanbul Final Gezisi
// ===============================

import { getParticipant } from "./firebase.js";

let currentQRCode = null;

/* ===========================
   QR İçeriği
=========================== */

export function createQRPayload(documentId) {

    return JSON.stringify({

        id: documentId,
        system: "TUGVA_ISTANBUL_FINAL",
        version: 1

    });

}

/* ===========================
   QR Oluştur
=========================== */

export async function generateQRCode(documentId, elementId = "qrArea") {

    const element = document.getElementById(elementId);

    if (!element) return;

    element.innerHTML = "";

    const canvas = document.createElement("canvas");

    element.appendChild(canvas);

    currentQRCode = canvas;

    await QRCode.toCanvas(

        canvas,

        createQRPayload(documentId),

        {

            width: 240,

            margin: 2,

            color: {

                dark: "#0F4C81",

                light: "#FFFFFF"

            }

        }

    );

}

/* ===========================
   QR Yenile
=========================== */

export async function refreshQRCode(documentId) {

    await generateQRCode(documentId);

}

/* ===========================
   QR İndir
=========================== */

export function downloadQRCode(fileName = "QR.png") {

    if (!currentQRCode) return;

    const link = document.createElement("a");

    link.download = fileName;

    link.href = currentQRCode.toDataURL("image/png");

    link.click();

}

/* ===========================
   QR Görseli
=========================== */

export function getQRCodeImage() {

    if (!currentQRCode) return null;

    return currentQRCode.toDataURL("image/png");

}

/* ===========================
   QR Oku
=========================== */

export function parseQR(text) {

    try {

        return JSON.parse(text);

    }

    catch {

        return null;

    }

}

/* ===========================
   QR Doğrula
=========================== */

export function isValidQR(data) {

    if (!data) return false;

    if (!data.id) return false;

    if (data.system !== "TUGVA_ISTANBUL_FINAL") return false;

    return true;

}

/* ===========================
   QR'dan Kişiyi Getir
=========================== */

export async function getParticipantFromQR(qrText) {

    const payload = parseQR(qrText);

    if (!isValidQR(payload)) {

        return null;

    }

    return await getParticipant(payload.id);

}

/* ===========================
   QR Bilgisi
=========================== */

export async function getQRInformation(qrText) {

    const participant = await getParticipantFromQR(qrText);

    if (!participant) {

        return null;

    }

    return {

        id: participant.id,

        registrationCode: participant.registrationCode,

        firstName: participant.firstName,

        lastName: participant.lastName,

        tc: participant.tc,

        phone: participant.phone,

        busNumber: participant.busNumber || "",

        seatNumber: participant.seatNumber || "",

        checkedIn: participant.checkedIn || false

    };

}

/* ===========================
   Giriş Kontrolü
=========================== */

export function canCheckIn(participant) {

    if (!participant) return false;

    return !participant.checkedIn;

}

/* ===========================
   QR Yazdırma
=========================== */

export function printQRCode() {

    if (!currentQRCode) return;

    const image = currentQRCode.toDataURL();

    const win = window.open("", "_blank");

    win.document.write(`
        <html>
        <head>
            <title>QR Kod</title>
            <style>
                body{
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    height:100vh;
                    margin:0;
                }
                img{
                    width:300px;
                }
            </style>
        </head>
        <body>
            <img src="${image}">
        </body>
        </html>
    `);

    win.document.close();

    win.print();

}
// ===============================
// pdf.js
// TÜGVA İstanbul Final Gezisi
// ===============================

import { getQRCodeImage } from "./qr.js";

const { jsPDF } = window.jspdf;

/* ===========================
   PDF Oluştur
=========================== */

export async function createParticipantPDF(participant) {

    const pdf = new jsPDF({

        orientation: "portrait",
        unit: "mm",
        format: "a4"

    });

    const qrImage = getQRCodeImage();

    // ---------- Başlık ----------

    pdf.setFillColor(15, 76, 129);

    pdf.rect(0, 0, 210, 28, "F");

    pdf.setTextColor(255);

    pdf.setFont("helvetica", "bold");

    pdf.setFontSize(20);

    pdf.text("TÜGVA İSTANBUL FİNAL GEZİSİ", 105, 12, {

        align: "center"

    });

    pdf.setFontSize(12);

    pdf.text("Katılımcı Kayıt Belgesi", 105, 20, {

        align: "center"

    });

    pdf.setTextColor(0);

    // ---------- Bilgiler ----------

    let y = 40;

    write(pdf, "Kayıt Kodu", participant.registrationCode, y);
    y += 10;

    write(pdf, "Ad Soyad", `${participant.firstName} ${participant.lastName}`, y);
    y += 10;

    write(pdf, "T.C. Kimlik No", participant.tc, y);
    y += 10;

    write(pdf, "Telefon", participant.phone, y);
    y += 10;

    write(pdf, "Doğum Tarihi", participant.birthDate, y);
    y += 10;

    write(pdf, "Yaş", String(participant.age), y);
    y += 10;

    if (participant.age < 18) {

        write(pdf, "Veli", participant.parentName, y);
        y += 10;

        write(pdf, "Veli Telefon", participant.parentPhone, y);
        y += 10;

    }

    write(
        pdf,
        "Otobüs",
        participant.busNumber || "Henüz Atanmadı",
        y
    );

    y += 10;

    write(
        pdf,
        "Koltuk",
        participant.seatNumber || "Henüz Atanmadı",
        y
    );

    y += 15;

    // ---------- Sağlık ----------

    pdf.setFont("helvetica", "bold");

    pdf.text("Sağlık Bilgisi", 20, y);

    y += 7;

    pdf.setFont("helvetica", "normal");

    const health = participant.health || "Belirtilmedi.";

    const lines = pdf.splitTextToSize(

        health,

        120

    );

    pdf.text(lines, 20, y);

    // ---------- QR ----------

    if (qrImage) {

        pdf.addImage(

            qrImage,

            "PNG",

            145,

            45,

            45,

            45

        );

    }

    pdf.setDrawColor(220);

    pdf.line(140, 95, 195, 95);

    pdf.setFont("helvetica", "bold");

    pdf.setFontSize(11);

    pdf.text(

        "QR Kod",

        167,

        102,

        {

            align: "center"

        }

    );

    pdf.setFontSize(9);

    pdf.setFont("helvetica", "normal");

    pdf.text(

        "Girişte görevliye gösteriniz.",

        167,

        108,

        {

            align: "center"

        }

    );

    // ---------- Bilgilendirme ----------

    pdf.setFillColor(245, 247, 250);

    pdf.roundedRect(

        15,

        205,

        180,

        55,

        3,

        3,

        "F"

    );

    pdf.setFontSize(11);

    pdf.setFont("helvetica", "bold");

    pdf.text(

        "Bilgilendirme",

        20,

        215

    );

    pdf.setFont("helvetica", "normal");

    pdf.setFontSize(10);

    pdf.text(

        pdf.splitTextToSize(

            "Otobüs ve koltuk numarası yönetici tarafından daha sonra atanacaktır. QR kodunuz değişmez. Giriş sırasında aynı QR kod okutularak güncel bilgileriniz sistemden otomatik alınacaktır.",

            165

        ),

        20,

        223

    );

    return pdf;

}

/* ===========================
   PDF İndir
=========================== */

export async function downloadParticipantPDF(participant) {

    const pdf = await createParticipantPDF(

        participant

    );

    pdf.save(

        `${participant.registrationCode}.pdf`

    );

}

/* ===========================
   PDF Önizleme
=========================== */

export async function previewParticipantPDF(participant) {

    const pdf = await createParticipantPDF(

        participant

    );

    window.open(

        pdf.output("bloburl"),

        "_blank"

    );

}

/* ===========================
   Yazdır
=========================== */

export async function printParticipantPDF(participant) {

    const pdf = await createParticipantPDF(

        participant

    );

    window.open(

        pdf.output("bloburl")

    ).print();

}

/* ===========================
   Ortak Satır
=========================== */

function write(pdf, title, value, y) {

    pdf.setFont("helvetica", "bold");

    pdf.text(`${title}:`, 20, y);

    pdf.setFont("helvetica", "normal");

    pdf.text(String(value), 65, y);

}