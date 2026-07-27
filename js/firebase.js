import { db, MAX_CAPACITY } from "./config.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    onSnapshot,
    runTransaction,
    increment
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const REGISTRATION_COLLECTION = "registrations";
const COUNTER_DOCUMENT = "system/registerCounter";

const registrationRef = collection(db, REGISTRATION_COLLECTION);

/* ===========================================================
   KONTENJAN
=========================================================== */

export async function getRegistrationCount() {

    const snap = await getDocs(registrationRef);

    return snap.size;

}

export async function getRemainingCapacity() {

    const count = await getRegistrationCount();

    return Math.max(MAX_CAPACITY - count, 0);

}

export async function isCapacityFull() {

    const remain = await getRemainingCapacity();

    return remain <= 0;

}

/* ===========================================================
   TC KONTROL
=========================================================== */

export async function tcExists(tc) {

    const q = query(
        registrationRef,
        where("tc", "==", tc),
        limit(1)
    );

    const snap = await getDocs(q);

    return !snap.empty;

}

/* ===========================================================
   TELEFON KONTROL
=========================================================== */

export async function phoneExists(phone) {

    const q = query(
        registrationRef,
        where("phone", "==", phone),
        limit(1)
    );

    const snap = await getDocs(q);

    return !snap.empty;

}
/* ===========================================================
   KAYIT NUMARASI (TRANSACTION)
=========================================================== */

async function generateRegisterNumber() {

    const counterRef = doc(db, COUNTER_DOCUMENT);

    const result = await runTransaction(db, async (transaction) => {

        const counterSnap = await transaction.get(counterRef);

        let nextNumber = 1;

        let nextNumber;

if (!counterSnap.exists()) {

    nextNumber = 1;

    transaction.set(counterRef,{
        value:1
    });

}else{

    nextNumber = counterSnap.data().value + 1;

    transaction.update(counterRef,{
        value:nextNumber
    });

}

return nextNumber;

    });

    return `TYO-${String(result).padStart(3, "0")}`;

}

/* ===========================================================
   KAYIT EKLE
=========================================================== */

export async function addRegistration(data) {

    if (await isCapacityFull()) {
        throw new Error("Kontenjan dolmuştur.");
    }

    if (await tcExists(data.tc)) {
        throw new Error("Bu TC Kimlik No ile kayıt bulunmaktadır.");
    }

    if (await phoneExists(data.phone)) {
        throw new Error("Bu telefon numarası ile kayıt bulunmaktadır.");
    }

    const registerNumber = await generateRegisterNumber();

    const document = {

        registerNumber,

        name: data.name.trim(),

        tc: data.tc.trim(),

        phone: data.phone.trim(),

        email: data.email || "",

        birth: data.birth,

        gender: data.gender,

        school: data.school,

        class: data.class,

        parent: data.parent,

        parentPhone: data.parentPhone,

        address: data.address,

        note: data.note || "",

        seat: "",

        checkedIn: false,

        createdAt: serverTimestamp()

    };

    const ref = await addDoc(registrationRef, document);

    return {

        id: ref.id,

        ...document

    };

}
/* ===========================================================
   TÜM KAYITLARI GETİR
=========================================================== */

export async function getRegistrations() {

    const q = query(
        registrationRef,
        orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}

/* ===========================================================
   TEK KAYIT
=========================================================== */

export async function getRegistration(id) {

    const ref = doc(db, REGISTRATION_COLLECTION, id);

    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return {
        id: snap.id,
        ...snap.data()
    };

}

/* ===========================================================
   GÜNCELLE
=========================================================== */

export async function updateRegistration(id, data) {

    const ref = doc(db, REGISTRATION_COLLECTION, id);

    await updateDoc(ref, data);

}

/* ===========================================================
   SİL
=========================================================== */

export async function deleteRegistration(id) {

    await deleteDoc(
        doc(db, REGISTRATION_COLLECTION, id)
    );

}

/* ===========================================================
   KOLTUK KONTROLÜ
=========================================================== */

export async function seatExists(seat) {

    const q = query(
        registrationRef,
        where("seat", "==", String(seat)),
        limit(1)
    );

    const snap = await getDocs(q);

    return !snap.empty;

}

/* ===========================================================
   KOLTUK VER
=========================================================== */

export async function assignSeat(id, seat) {

    seat = Number(seat);

    if (seat < 1 || seat > MAX_CAPACITY) {
        throw new Error(`Koltuk numarası 1-${MAX_CAPACITY} arasında olmalıdır.`);
    }

    if (await seatExists(String(seat))) {
        throw new Error("Bu koltuk başka bir öğrenciye verilmiş.");
    }

    await updateDoc(
        doc(db, REGISTRATION_COLLECTION, id),
        {
            seat: String(seat)
        }
    );

}

/* ===========================================================
   QR GİRİŞ
=========================================================== */

export async function toggleCheckIn(id) {

    const ref = doc(db, REGISTRATION_COLLECTION, id);

    const snap = await getDoc(ref);

    if (!snap.exists()) {
        throw new Error("Kayıt bulunamadı.");
    }

    const current = snap.data().checkedIn === true;

    await updateDoc(ref, {
        checkedIn: !current
    });

}
/* ===========================================================
   CANLI DİNLEME
=========================================================== */

export function listenRegistrations(callback) {

    const q = query(
        registrationRef,
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {

        const list = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        callback(list);

    });

}

/* ===========================================================
   ARAMA
=========================================================== */

export async function searchRegistrations(keyword) {

    keyword = keyword.toLowerCase().trim();

    const registrations = await getRegistrations();

    return registrations.filter(item => {

        return (
            (item.name || "").toLowerCase().includes(keyword) ||
            (item.registerNumber || "").toLowerCase().includes(keyword) ||
            (item.tc || "").includes(keyword) ||
            (item.phone || "").includes(keyword) ||
            (item.parent || "").toLowerCase().includes(keyword)
        );

    });

}

/* ===========================================================
   İSTATİSTİKLER
=========================================================== */

export async function getStatistics() {

    const registrations = await getRegistrations();

    const total = registrations.length;

    const checkedIn = registrations.filter(r => r.checkedIn).length;

    const remaining = Math.max(MAX_CAPACITY - total, 0);

    const occupiedSeats = registrations.filter(r => r.seat).length;

    const emptySeats = MAX_CAPACITY - occupiedSeats;

    const male = registrations.filter(r => r.gender === "Erkek").length;

    const female = registrations.filter(r => r.gender === "Kız").length;

    const percent = Number(
        ((total / MAX_CAPACITY) * 100).toFixed(1)
    );

    return {

        total,

        checkedIn,

        remaining,

        occupiedSeats,

        emptySeats,

        male,

        female,

        percent,

        full: total >= MAX_CAPACITY

    };

}

/* ===========================================================
   KAYIT NUMARASI İLE BUL
=========================================================== */

export async function findByRegisterNumber(registerNumber) {

    const q = query(
        registrationRef,
        where("registerNumber", "==", registerNumber),
        limit(1)
    );

    const snap = await getDocs(q);

    if (snap.empty) return null;

    const document = snap.docs[0];

    return {

        id: document.id,

        ...document.data()

    };

}

/* ===========================================================
   ID İLE CHECK-IN
=========================================================== */

export async function checkInByRegisterNumber(registerNumber) {

    const registration = await findByRegisterNumber(registerNumber);

    if (!registration) {
        throw new Error("Kayıt bulunamadı.");
    }

    await updateDoc(
        doc(db, REGISTRATION_COLLECTION, registration.id),
        {
            checkedIn: true
        }
    );

    return registration;

}

/* ===========================================================
   KOLTUK LİSTESİ
=========================================================== */

export async function getUsedSeats() {

    const registrations = await getRegistrations();

    return registrations
        .filter(r => r.seat)
        .map(r => Number(r.seat))
        .sort((a, b) => a - b);

}