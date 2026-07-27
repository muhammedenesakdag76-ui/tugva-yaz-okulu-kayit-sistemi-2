import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    writeBatch
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {

    apiKey: "API_KEY",

    authDomain: "PROJECT_ID.firebaseapp.com",

    projectId: "PROJECT_ID",

    storageBucket: "PROJECT_ID.appspot.com",

    messagingSenderId: "SENDER_ID",

    appId: "APP_ID"

};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

export const registrationsRef = collection(db, "registrations");

export const SYSTEM = {

    MAX_CAPACITY: 500,

    REGISTER_PREFIX: "TYO",

    REGISTER_DIGITS: 5

};
export async function generateRegisterNumber() {

    const q = query(
        registrationsRef,
        orderBy("registerNumber", "desc"),
        limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return `${SYSTEM.REGISTER_PREFIX}${String(1).padStart(SYSTEM.REGISTER_DIGITS, "0")}`;
    }

    const lastNumber = snapshot.docs[0].data().registerNumber || "";

    const numeric = parseInt(
        lastNumber.replace(SYSTEM.REGISTER_PREFIX, ""),
        10
    );

    const nextNumber = (isNaN(numeric) ? 1 : numeric + 1);

    return `${SYSTEM.REGISTER_PREFIX}${String(nextNumber).padStart(SYSTEM.REGISTER_DIGITS, "0")}`;

}

export async function getRegistrationCount() {

    const snapshot = await getDocs(registrationsRef);

    return snapshot.size;

}

export async function getRemainingCapacity() {

    const count = await getRegistrationCount();

    return Math.max(0, SYSTEM.MAX_CAPACITY - count);

}

export async function isCapacityFull() {

    const remaining = await getRemainingCapacity();

    return remaining <= 0;

}

export async function registrationExists(tc) {

    const q = query(
        registrationsRef,
        where("tc", "==", tc)
    );

    const snapshot = await getDocs(q);

    return !snapshot.empty;

}

export async function phoneExists(phone) {

    const q = query(
        registrationsRef,
        where("phone", "==", phone)
    );

    const snapshot = await getDocs(q);

    return !snapshot.empty;

}
export async function addRegistration(data) {

    if (await isCapacityFull()) {
        throw new Error("Kontenjan dolmuştur.");
    }

    if (await registrationExists(data.tc)) {
        throw new Error("Bu TC Kimlik Numarası ile kayıt bulunmaktadır.");
    }

    if (await phoneExists(data.phone)) {
        throw new Error("Bu telefon numarası ile kayıt bulunmaktadır.");
    }

    const registerNumber = await generateRegisterNumber();

    const registration = {

        registerNumber,

        name: data.name.trim(),

        tc: data.tc.trim(),

        phone: data.phone.trim(),

        email: data.email.trim(),

        birth: data.birth,

        gender: data.gender,

        school: data.school.trim(),

        class: data.class.trim(),

        parent: data.parent.trim(),

        parentPhone: data.parentPhone.trim(),

        address: data.address.trim(),

        note: data.note.trim(),

        seat: "",

        checkedIn: false,

        createdAt: serverTimestamp()

    };

    const docRef = await addDoc(
        registrationsRef,
        registration
    );

    await updateDoc(docRef, {

        id: docRef.id

    });

    return {

        id: docRef.id,

        ...registration

    };

}

export async function getRegistration(id) {

    const documentRef = doc(
        db,
        "registrations",
        id
    );

    const snapshot = await getDoc(documentRef);

    if (!snapshot.exists()) {

        throw new Error("Kayıt bulunamadı.");

    }

    return {

        id: snapshot.id,

        ...snapshot.data()

    };

}
export async function getAllRegistrations() {

    const q = query(
        registrationsRef,
        orderBy("registerNumber", "asc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(document => ({

        id: document.id,

        ...document.data()

    }));

}

export async function updateRegistration(id, data) {

    const documentRef = doc(
        db,
        "registrations",
        id
    );

    const payload = {

        name: data.name.trim(),

        tc: data.tc.trim(),

        phone: data.phone.trim(),

        email: data.email.trim(),

        birth: data.birth,

        gender: data.gender,

        school: data.school.trim(),

        class: data.class.trim(),

        parent: data.parent.trim(),

        parentPhone: data.parentPhone.trim(),

        address: data.address.trim(),

        note: data.note.trim(),

        seat: data.seat ?? "",

        checkedIn: Boolean(data.checkedIn)

    };

    await updateDoc(documentRef, payload);

    return true;

}

export async function updateSeat(id, seat) {

    const documentRef = doc(
        db,
        "registrations",
        id
    );

    await updateDoc(documentRef, {

        seat: seat.trim()

    });

}

export async function updateCheckIn(id, checkedIn) {

    const documentRef = doc(
        db,
        "registrations",
        id
    );

    await updateDoc(documentRef, {

        checkedIn: Boolean(checkedIn)

    });

}

export async function deleteRegistration(id) {

    const documentRef = doc(
        db,
        "registrations",
        id
    );

    await deleteDoc(documentRef);

    return true;

}
export async function searchRegistrations(searchText = "") {

    const records = await getAllRegistrations();

    const keyword = searchText
        .trim()
        .toLocaleLowerCase("tr-TR");

    if (!keyword) {
        return records;
    }

    return records.filter(record => {

        return (

            (record.registerNumber ?? "")
                .toLocaleLowerCase("tr-TR")
                .includes(keyword)

            ||

            (record.name ?? "")
                .toLocaleLowerCase("tr-TR")
                .includes(keyword)

            ||

            (record.tc ?? "")
                .toLocaleLowerCase("tr-TR")
                .includes(keyword)

            ||

            (record.phone ?? "")
                .toLocaleLowerCase("tr-TR")
                .includes(keyword)

            ||

            (record.parent ?? "")
                .toLocaleLowerCase("tr-TR")
                .includes(keyword)

            ||

            (record.parentPhone ?? "")
                .toLocaleLowerCase("tr-TR")
                .includes(keyword)

            ||

            (record.school ?? "")
                .toLocaleLowerCase("tr-TR")
                .includes(keyword)

            ||

            (record.class ?? "")
                .toLocaleLowerCase("tr-TR")
                .includes(keyword)

            ||

            (record.seat ?? "")
                .toLocaleLowerCase("tr-TR")
                .includes(keyword);

    });

}

export async function getStatistics() {

    const registrations = await getAllRegistrations();

    const total = registrations.length;

    const checkedIn = registrations.filter(item =>
        item.checkedIn === true
    ).length;

    const notCheckedIn = total - checkedIn;

    const seated = registrations.filter(item =>
        item.seat && item.seat.trim() !== ""
    ).length;

    const withoutSeat = total - seated;

    const remaining = Math.max(
        0,
        SYSTEM.MAX_CAPACITY - total
    );

    return {

        total,

        checkedIn,

        notCheckedIn,

        seated,

        withoutSeat,

        remaining,

        capacity: SYSTEM.MAX_CAPACITY

    };

}
export async function assignSeat(id, seatNumber) {

    const seat = String(seatNumber).trim();

    if (!seat) {
        throw new Error("Koltuk numarası boş olamaz.");
    }

    const registrations = await getAllRegistrations();

    const duplicate = registrations.find(item => {

        return item.id !== id &&
               (item.seat ?? "").trim() === seat;

    });

    if (duplicate) {
        throw new Error("Bu koltuk numarası başka bir öğrenciye atanmış.");
    }

    const documentRef = doc(
        db,
        "registrations",
        id
    );

    await updateDoc(documentRef, {

        seat

    });

    return true;

}

export async function removeSeat(id) {

    const documentRef = doc(
        db,
        "registrations",
        id
    );

    await updateDoc(documentRef, {

        seat: ""

    });

    return true;

}

export async function setCheckIn(id, value) {

    const documentRef = doc(
        db,
        "registrations",
        id
    );

    await updateDoc(documentRef, {

        checkedIn: Boolean(value)

    });

    return true;

}

export async function toggleCheckIn(id) {

    const registration = await getRegistration(id);

    const newValue = !registration.checkedIn;

    await setCheckIn(id, newValue);

    return newValue;

}
export async function deleteMany(ids = []) {

    if (!Array.isArray(ids) || ids.length === 0) {
        return;
    }

    const batch = writeBatch(db);

    ids.forEach(id => {

        const documentRef = doc(
            db,
            "registrations",
            id
        );

        batch.delete(documentRef);

    });

    await batch.commit();

}

export async function updateManySeats(seatMap = []) {

    if (!Array.isArray(seatMap) || seatMap.length === 0) {
        return;
    }

    const registrations = await getAllRegistrations();

    const usedSeats = new Set();

    registrations.forEach(item => {

        if (item.seat) {

            usedSeats.add(item.seat.trim());

        }

    });

    for (const item of seatMap) {

        const seat = String(item.seat).trim();

        const current = registrations.find(r => r.id === item.id);

        if (
            usedSeats.has(seat) &&
            current?.seat !== seat
        ) {

            throw new Error(`Koltuk ${seat} zaten kullanılıyor.`);

        }

        usedSeats.add(seat);

    }

    const batch = writeBatch(db);

    seatMap.forEach(item => {

        const documentRef = doc(
            db,
            "registrations",
            item.id
        );

        batch.update(documentRef, {

            seat: String(item.seat).trim()

        });

    });

    await batch.commit();

}

export async function setManyCheckIn(ids = [], value = true) {

    if (!Array.isArray(ids) || ids.length === 0) {
        return;
    }

    const batch = writeBatch(db);

    ids.forEach(id => {

        const documentRef = doc(
            db,
            "registrations",
            id
        );

        batch.update(documentRef, {

            checkedIn: Boolean(value)

        });

    });

    await batch.commit();

}
export async function exportRegistrations() {

    const registrations = await getAllRegistrations();

    return JSON.stringify(registrations, null, 2);

}

export async function importRegistrations(registrations = []) {

    if (!Array.isArray(registrations)) {
        throw new Error("Geçersiz veri.");
    }

    const batch = writeBatch(db);

    for (const item of registrations) {

        const documentRef = doc(registrationsRef);

        batch.set(documentRef, {

            registerNumber: item.registerNumber ?? "",

            name: item.name ?? "",

            tc: item.tc ?? "",

            phone: item.phone ?? "",

            email: item.email ?? "",

            birth: item.birth ?? "",

            gender: item.gender ?? "",

            school: item.school ?? "",

            class: item.class ?? "",

            parent: item.parent ?? "",

            parentPhone: item.parentPhone ?? "",

            address: item.address ?? "",

            note: item.note ?? "",

            seat: item.seat ?? "",

            checkedIn: Boolean(item.checkedIn),

            createdAt: serverTimestamp()

        });

    }

    await batch.commit();

}

export async function login(email, password) {

    return await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

}

export async function logout() {

    await signOut(auth);

}

export function authListener(callback) {

    return onAuthStateChanged(auth, callback);

}

export function createEmptyRegistration() {

    return {

        id: "",

        registerNumber: "",

        name: "",

        tc: "",

        phone: "",

        email: "",

        birth: "",

        gender: "",

        school: "",

        class: "",

        parent: "",

        parentPhone: "",

        address: "",

        note: "",

        seat: "",

        checkedIn: false,

        createdAt: null

    };

}
export function formatRegistration(record = {}) {

    return {

        id: record.id ?? "",

        registerNumber: record.registerNumber ?? "",

        name: record.name ?? "",

        tc: record.tc ?? "",

        phone: record.phone ?? "",

        email: record.email ?? "",

        birth: record.birth ?? "",

        gender: record.gender ?? "",

        school: record.school ?? "",

        class: record.class ?? "",

        parent: record.parent ?? "",

        parentPhone: record.parentPhone ?? "",

        address: record.address ?? "",

        note: record.note ?? "",

        seat: record.seat ?? "",

        checkedIn: Boolean(record.checkedIn),

        createdAt: record.createdAt ?? null

    };

}

export function sortByRegisterNumber(records = []) {

    return [...records].sort((a, b) => {

        const first = Number(
            String(a.registerNumber)
                .replace(SYSTEM.REGISTER_PREFIX, "")
        );

        const second = Number(
            String(b.registerNumber)
                .replace(SYSTEM.REGISTER_PREFIX, "")
        );

        return first - second;

    });

}

export function sortBySeat(records = []) {

    return [...records].sort((a, b) => {

        const first = Number(a.seat || 99999);

        const second = Number(b.seat || 99999);

        return first - second;

    });

}

export function sortByName(records = []) {

    return [...records].sort((a, b) =>

        a.name.localeCompare(
            b.name,
            "tr"
        )

    );

}

export default {

    db,

    auth,

    registrationsRef,

    SYSTEM,

    generateRegisterNumber,

    getRegistrationCount,

    getRemainingCapacity,

    isCapacityFull,

    registrationExists,

    phoneExists,

    addRegistration,

    getRegistration,

    getAllRegistrations,

    updateRegistration,

    updateSeat,

    updateCheckIn,

    deleteRegistration,

    searchRegistrations,

    getStatistics,

    assignSeat,

    removeSeat,

    setCheckIn,

    toggleCheckIn,

    deleteMany,

    updateManySeats,

    setManyCheckIn,

    exportRegistrations,

    importRegistrations,

    login,

    logout,

    authListener,

    createEmptyRegistration,

    formatRegistration,

    sortByRegisterNumber,

    sortBySeat,

    sortByName

};