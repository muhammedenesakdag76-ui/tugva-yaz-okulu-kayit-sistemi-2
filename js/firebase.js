import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    onSnapshot,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {

    apiKey: "AIzaSyA1PwF_MonQVMQ2zXnCJZbQWYkRgHpxxb8",

    authDomain: "tugva-kayit-sistemi.firebaseapp.com",

    projectId: "tugva-kayit-sistemi",

    storageBucket: "tugva-kayit-sistemi.firebasestorage.app",

    messagingSenderId: "497137562254",

    appId: "1:497137562254:web:0dae95a054ac7e21424fdf"

};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

export const COLLECTION = "kayitlar";

export const LOG_COLLECTION = "loglar";

export const MAX_CAPACITY = 45;
export function authListener(callback) {

    onAuthStateChanged(auth, callback);

}

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

export function registrationCollection() {

    return collection(db, COLLECTION);

}

export function logCollection() {

    return collection(db, LOG_COLLECTION);

}

export async function getAllRegistrations() {

    const q = query(

        registrationCollection(),

        orderBy(
            "createdAt",
            "desc"
        )

    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data()

    }));

}

export function listenRegistrations(callback) {

    const q = query(

        registrationCollection(),

        orderBy(
            "createdAt",
            "desc"
        )

    );

    return onSnapshot(q, snapshot => {

        callback(

            snapshot.docs.map(doc => ({

                id: doc.id,

                ...doc.data()

            }))

        );

    });

}
export async function getRegistration(id) {

    const ref = doc(db, COLLECTION, id);

    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {

        return null;

    }

    return {

        id: snapshot.id,

        ...snapshot.data()

    };

}

export async function registrationExists(tc) {

    const registrations = await getAllRegistrations();

    return registrations.some(item => item.tc === tc);

}

export async function phoneExists(phone) {

    const registrations = await getAllRegistrations();

    return registrations.some(item => item.phone === phone);

}

export async function getRemainingCapacity() {

    const registrations = await getAllRegistrations();

    return MAX_CAPACITY - registrations.length;

}

export async function isFull() {

    const remaining = await getRemainingCapacity();

    return remaining <= 0;

}

export async function getStatistics() {

    const registrations = await getAllRegistrations();

    const total = registrations.length;

    const checked = registrations.filter(item => item.checkedIn).length;

    const waiting = total - checked;

    const remaining = MAX_CAPACITY - total;

    return {

        total,

        checked,

        waiting,

        remaining

    };

}
export async function generateRegisterNumber() {

    const registrations = await getAllRegistrations();

    const nextNumber = registrations.length + 1;

    return `TYG26-${String(nextNumber).padStart(4, "0")}`;

}

export async function addRegistration(data) {

    const ref = doc(registrationCollection());

    await setDoc(ref, {

        ...data,

        checkedIn: false,

        seat: data.seat || "",

        createdAt: serverTimestamp()

    });

    await addLog(

        "Yeni Kayıt",

        ref.id

    );

    return ref.id;

}

export async function updateRegistration(id, data) {

    await updateDoc(

        doc(db, COLLECTION, id),

        {

            ...data

        }

    );

    await addLog(

        "Kayıt Güncellendi",

        id

    );

}

export async function deleteRegistration(id) {

    await deleteDoc(

        doc(db, COLLECTION, id)

    );

    await addLog(

        "Kayıt Silindi",

        id

    );

}

export async function checkIn(id) {

    await updateDoc(

        doc(db, COLLECTION, id),

        {

            checkedIn: true,

            checkInTime: serverTimestamp()

        }

    );

    await addLog(

        "Giriş Yapıldı",

        id

    );

}

export async function checkOut(id) {

    await updateDoc(

        doc(db, COLLECTION, id),

        {

            checkedIn: false,

            checkOutTime: serverTimestamp()

        }

    );

    await addLog(

        "Çıkış Yapıldı",

        id

    );

}
export async function addLog(action, participantId = "") {

    const ref = doc(logCollection());

    await setDoc(ref, {

        action,

        participant: participantId,

        createdAt: serverTimestamp()

    });

}

export async function batchCheckIn(ids) {

    const batch = writeBatch(db);

    ids.forEach(id => {

        batch.update(

            doc(db, COLLECTION, id),

            {

                checkedIn: true,

                checkInTime: serverTimestamp()

            }

        );

    });

    await batch.commit();

    for (const id of ids) {

        await addLog(

            "Toplu Giriş",

            id

        );

    }

}

export async function batchCheckOut(ids) {

    const batch = writeBatch(db);

    ids.forEach(id => {

        batch.update(

            doc(db, COLLECTION, id),

            {

                checkedIn: false,

                checkOutTime: serverTimestamp()

            }

        );

    });

    await batch.commit();

    for (const id of ids) {

        await addLog(

            "Toplu Çıkış",

            id

        );

    }

}

export async function batchDelete(ids) {

    const batch = writeBatch(db);

    ids.forEach(id => {

        batch.delete(

            doc(db, COLLECTION, id)

        );

    });

    await batch.commit();

    for (const id of ids) {

        await addLog(

            "Toplu Silme",

            id

        );

    }

}
export async function searchRegistrations(keyword) {

    const registrations = await getAllRegistrations();

    const text = keyword.trim().toLowerCase();

    if (!text) {

        return registrations;

    }

    return registrations.filter(item => {

        return (

            (item.registerNumber || "")
                .toLowerCase()
                .includes(text)

            ||

            (item.name || "")
                .toLowerCase()
                .includes(text)

            ||

            (item.tc || "")
                .includes(text)

            ||

            (item.phone || "")
                .includes(text)

            ||

            (item.school || "")
                .toLowerCase()
                .includes(text)

            ||

            (item.parent || "")
                .toLowerCase()
                .includes(text)

        );

    });

}

export async function filterRegistrations(filter = "all") {

    const registrations = await getAllRegistrations();

    switch (filter) {

        case "checked":

            return registrations.filter(item => item.checkedIn);

        case "waiting":

            return registrations.filter(item => !item.checkedIn);

        default:

            return registrations;

    }

}

export async function getCheckedInList() {

    return await filterRegistrations("checked");

}

export async function getWaitingList() {

    return await filterRegistrations("waiting");

}

export async function getLogs() {

    const q = query(

        logCollection(),

        orderBy(
            "createdAt",
            "desc"
        )

    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data()

    }));

}
export async function exportData() {

    const registrations = await getAllRegistrations();

    return JSON.stringify(registrations, null, 2);

}

export async function importData(data) {

    if (!Array.isArray(data)) {

        throw new Error("Geçersiz veri formatı.");

    }

    const batch = writeBatch(db);

    data.forEach(item => {

        const ref = doc(registrationCollection());

        batch.set(ref, {

            registerNumber: item.registerNumber || "",

            name: item.name || "",

            tc: item.tc || "",

            phone: item.phone || "",

            email: item.email || "",

            birth: item.birth || "",

            gender: item.gender || "",

            school: item.school || "",

            class: item.class || "",

            parent: item.parent || "",

            parentPhone: item.parentPhone || "",

            address: item.address || "",

            note: item.note || "",

            seat: item.seat || "",

            checkedIn: item.checkedIn || false,

            createdAt: item.createdAt || serverTimestamp()

        });

    });

    await batch.commit();

    await addLog("Veri İçe Aktarıldı");

}

export async function clearDatabase() {

    const registrations = await getAllRegistrations();

    const batch = writeBatch(db);

    registrations.forEach(item => {

        batch.delete(

            doc(db, COLLECTION, item.id)

        );

    });

    await batch.commit();

    await addLog("Veritabanı Temizlendi");

}

export function formatPhone(phone) {

    return String(phone)
        .replace(/\D/g, "");

}

export function normalizeText(text) {

    return String(text)
        .trim()
        .replace(/\s+/g, " ");

}

export function createEmptyRegistration() {

    return {

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

        checkedIn: false

    };

}
export function listenStatistics(callback) {

    return onSnapshot(registrationCollection(), snapshot => {

        const registrations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const total = registrations.length;

        const checked = registrations.filter(item => item.checkedIn).length;

        const waiting = total - checked;

        const remaining = MAX_CAPACITY - total;

        callback({

            total,

            checked,

            waiting,

            remaining

        });

    });

}

export function listenCapacity(callback) {

    return listenStatistics(stats => {

        callback(stats.remaining);

    });

}

export async function countRegistrations() {

    const registrations = await getAllRegistrations();

    return registrations.length;

}

export async function countCheckedIn() {

    const registrations = await getAllRegistrations();

    return registrations.filter(item => item.checkedIn).length;

}

export async function countWaiting() {

    const registrations = await getAllRegistrations();

    return registrations.filter(item => !item.checkedIn).length;

}

export function sortByRegisterNumber(list) {

    return [...list].sort((a, b) =>

        (a.registerNumber || "").localeCompare(

            b.registerNumber || "",

            "tr"

        )

    );

}

export function sortByName(list) {

    return [...list].sort((a, b) =>

        (a.name || "").localeCompare(

            b.name || "",

            "tr"

        )

    );

}
export function sortByDate(list) {

    return [...list].sort((a, b) => {

        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;

        return dateB - dateA;

    });

}

export function sortBySchool(list) {

    return [...list].sort((a, b) =>

        (a.school || "").localeCompare(

            b.school || "",

            "tr"

        )

    );

}

export function sortByClass(list) {

    return [...list].sort((a, b) =>

        (a.class || "").localeCompare(

            b.class || "",

            "tr"

        )

    );

}

export function sortByStatus(list) {

    return [...list].sort((a, b) => {

        if (a.checkedIn === b.checkedIn) return 0;

        return a.checkedIn ? -1 : 1;

    });

}

export function formatDate(timestamp) {

    if (!timestamp) return "";

    const date = timestamp.toDate();

    return date.toLocaleString("tr-TR");

}

export function generateSeatNumber(index) {

    return String(index + 1).padStart(2, "0");

}

export function sanitizeRegistration(data) {

    return {

        registerNumber: data.registerNumber || "",

        name: normalizeText(data.name),

        tc: String(data.tc || "").trim(),

        phone: formatPhone(data.phone),

        email: String(data.email || "").trim(),

        birth: data.birth || "",

        gender: data.gender || "",

        school: normalizeText(data.school),

        class: normalizeText(data.class),

        parent: normalizeText(data.parent),

        parentPhone: formatPhone(data.parentPhone),

        address: normalizeText(data.address),

        note: normalizeText(data.note),

        seat: data.seat || "",

        checkedIn: Boolean(data.checkedIn)

    };

}
export async function downloadBackup() {

    const json = await exportData();

    const blob = new Blob(

        [json],

        {

            type: "application/json"

        }

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `yedek-${new Date().toISOString().slice(0,10)}.json`;

    link.click();

    URL.revokeObjectURL(url);

}

export async function restoreBackup(file) {

    const text = await file.text();

    const data = JSON.parse(text);

    await importData(data);

}

export async function resetSeats() {

    const registrations = await getAllRegistrations();

    const batch = writeBatch(db);

    registrations.forEach(item => {

        batch.update(

            doc(db, COLLECTION, item.id),

            {

                seat: ""

            }

        );

    });

    await batch.commit();

    await addLog("Oturma Düzeni Sıfırlandı");

}

export async function assignSeatsAutomatically() {

    const registrations = sortByRegisterNumber(

        await getAllRegistrations()

    );

    const batch = writeBatch(db);

    registrations.forEach((item, index) => {

        batch.update(

            doc(db, COLLECTION, item.id),

            {

                seat: generateSeatNumber(index)

            }

        );

    });

    await batch.commit();

    await addLog("Oturma Düzeni Otomatik Oluşturuldu");

}
export async function duplicateTc(tc, ignoreId = null) {

    const registrations = await getAllRegistrations();

    return registrations.some(item =>
        item.tc === tc &&
        item.id !== ignoreId
    );

}

export async function duplicatePhone(phone, ignoreId = null) {

    const registrations = await getAllRegistrations();

    const normalized = formatPhone(phone);

    return registrations.some(item =>
        formatPhone(item.phone) === normalized &&
        item.id !== ignoreId
    );

}

export async function duplicateEmail(email, ignoreId = null) {

    if (!email) return false;

    const registrations = await getAllRegistrations();

    const normalized = email.trim().toLowerCase();

    return registrations.some(item =>
        (item.email || "").trim().toLowerCase() === normalized &&
        item.id !== ignoreId
    );

}

export function validateImportData(data) {

    if (!Array.isArray(data)) {

        throw new Error("Yedek dosyası dizi (Array) formatında olmalıdır.");

    }

    data.forEach((item, index) => {

        if (typeof item !== "object" || item === null) {

            throw new Error(
                `${index + 1}. kayıt geçersiz.`
            );

        }

        if (!item.name) {

            throw new Error(
                `${index + 1}. kayıtta Ad Soyad eksik.`
            );

        }

        if (!item.tc) {

            throw new Error(
                `${index + 1}. kayıtta T.C. Kimlik No eksik.`
            );

        }

    });

    return true;

}

export function todayString() {

    return new Date().toLocaleDateString("tr-TR");

}

export function nowString() {

    return new Date().toLocaleString("tr-TR");

}
export function isValidRegistration(data) {

    return (

        data &&

        data.name &&

        data.tc &&

        data.phone &&

        data.birth &&

        data.gender &&

        data.school &&

        data.class &&

        data.parent &&

        data.parentPhone

    );

}

export function createRegistrationId() {

    return crypto.randomUUID();

}

export function cloneRegistration(data) {

    return structuredClone(data);

}

export function registrationSummary(data) {

    return {

        registerNumber: data.registerNumber,

        name: data.name,

        school: data.school,

        class: data.class,

        checkedIn: data.checkedIn

    };

}

export const DEFAULT_REGISTRATION = Object.freeze({

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

    checkedIn: false

});

export function createRegistration(data = {}) {

    return {

        ...DEFAULT_REGISTRATION,

        ...sanitizeRegistration(data)

    };

}
