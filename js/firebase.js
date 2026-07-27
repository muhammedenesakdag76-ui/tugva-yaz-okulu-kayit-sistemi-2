// ===============================
// Firebase Configuration
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ===============================
// Firebase Config
// ===============================

const firebaseConfig = {

    apiKey: "BURAYA_APIKEY",

    authDomain: "BURAYA_AUTHDOMAIN",

    projectId: "BURAYA_PROJECTID",

    storageBucket: "BURAYA_STORAGE",

    messagingSenderId: "BURAYA_SENDER",

    appId: "BURAYA_APPID"

};


// ===============================
// Initialize
// ===============================

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);


// ===============================
// Constants
// ===============================

export const MAX_KONTENJAN = 45;

export const COLLECTION = "kayitlar";


// ===============================
// Registration Number Generator
// ===============================

export async function generateRegisterNumber() {

    const snap = await getDocs(collection(db, COLLECTION));

    const count = snap.size + 1;

    return "TYG26-" + String(count).padStart(4, "0");

}


// ===============================
// Remaining Capacity
// ===============================

export async function getRemainingCapacity() {

    const snap = await getDocs(collection(db, COLLECTION));

    return MAX_KONTENJAN - snap.size;

}


// ===============================
// Total Registrations
// ===============================

export async function getTotalRegistrations() {

    const snap = await getDocs(collection(db, COLLECTION));

    return snap.size;

}


// ===============================
// Registration Full?
// ===============================

export async function isFull() {

    const total = await getTotalRegistrations();

    return total >= MAX_KONTENJAN;

}


// ===============================
// TC Exists?
// ===============================

export async function tcExists(tc) {

    const q = query(
        collection(db, COLLECTION),
        where("tc", "==", tc)
    );

    const snap = await getDocs(q);

    return !snap.empty;

}
// ===============================
// Create Registration
// ===============================

export async function createRegistration(data) {

    if (await isFull()) {
        throw new Error("Kontenjan dolmuştur.");
    }

    if (await tcExists(data.tc)) {
        throw new Error("Bu TC Kimlik Numarası ile daha önce kayıt yapılmış.");
    }

    const kayitNo = await generateRegisterNumber();

    const registration = {
        kayitNo,

        adSoyad: data.adSoyad,
        tc: data.tc,
        telefon: data.telefon,
        email: data.email,

        dogumTarihi: data.dogumTarihi,

        cinsiyet: data.cinsiyet,

        okul: data.okul,

        sinif: data.sinif,

        veliAdi: data.veliAdi,

        veliTelefon: data.veliTelefon,

        adres: data.adres || "",

        not: data.not || "",

        seat: "",

        checkedIn: false,

        checkinTime: null,

        createdAt: serverTimestamp()
    };

    await setDoc(
        doc(db, COLLECTION, kayitNo),
        registration
    );

    return registration;
}


// ===============================
// Get Registration
// ===============================

export async function getRegistration(kayitNo) {

    const ref = doc(db, COLLECTION, kayitNo);

    const snap = await getDoc(ref);

    if (!snap.exists()) {

        return null;

    }

    return snap.data();

}


// ===============================
// Get All Registrations
// ===============================

export async function getAllRegistrations() {

    const q = query(
        collection(db, COLLECTION),
        orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    const list = [];

    snap.forEach((item) => {

        list.push(item.data());

    });

    return list;

}


// ===============================
// Delete Registration
// ===============================

export async function deleteRegistration(kayitNo) {

    await deleteDoc(
        doc(db, COLLECTION, kayitNo)
    );

}


// ===============================
// Seat Assignment
// ===============================

export async function updateSeat(kayitNo, seatNo) {

    await updateDoc(
        doc(db, COLLECTION, kayitNo),
        {

            seat: seatNo

        }
    );

}


// ===============================
// Check In
// ===============================

export async function checkIn(kayitNo) {

    await updateDoc(
        doc(db, COLLECTION, kayitNo),
        {

            checkedIn: true,

            checkinTime: serverTimestamp()

        }
    );

}


// ===============================
// Check Out
// ===============================

export async function checkOut(kayitNo) {

    await updateDoc(
        doc(db, COLLECTION, kayitNo),
        {

            checkedIn: false,

            checkinTime: null

        }
    );

}
// ===============================
// Search Participants
// ===============================

export async function searchParticipants(keyword) {

    const list = await getAllRegistrations();

    if (!keyword || keyword.trim() === "") {
        return list;
    }

    const q = keyword.toLowerCase().trim();

    return list.filter(item => {

        return (
            item.adSoyad?.toLowerCase().includes(q) ||
            item.tc?.includes(q) ||
            item.telefon?.includes(q) ||
            item.kayitNo?.toLowerCase().includes(q)
        );

    });

}


// ===============================
// Statistics
// ===============================

export async function getStatistics() {

    const list = await getAllRegistrations();

    const checked = list.filter(x => x.checkedIn).length;

    const emptySeat = list.filter(x => !x.seat).length;

    return {

        total: list.length,

        checkedIn: checked,

        notCheckedIn: list.length - checked,

        emptySeat,

        remaining: MAX_KONTENJAN - list.length

    };

}


// ===============================
// Live Registration Listener
// ===============================

export function listenRegistrations(callback) {

    return onSnapshot(

        collection(db, COLLECTION),

        (snapshot) => {

            const data = [];

            snapshot.forEach(doc => {

                data.push(doc.data());

            });

            data.sort((a, b) => {

                if (!a.createdAt || !b.createdAt) return 0;

                return (
                    b.createdAt.seconds -
                    a.createdAt.seconds
                );

            });

            callback(data);

        }

    );

}


// ===============================
// Live Statistics
// ===============================

export function listenStatistics(callback) {

    return onSnapshot(

        collection(db, COLLECTION),

        (snapshot) => {

            const registrations = [];

            snapshot.forEach(doc => {

                registrations.push(doc.data());

            });

            const checkedIn = registrations.filter(x => x.checkedIn).length;

            const emptySeat = registrations.filter(x => !x.seat).length;

            callback({

                total: registrations.length,

                checkedIn,

                notCheckedIn:
                    registrations.length - checkedIn,

                emptySeat,

                remaining:
                    MAX_KONTENJAN - registrations.length

            });

        }

    );

}


// ===============================
// Authentication
// ===============================

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

    return onAuthStateChanged(

        auth,

        callback

    );

}


// ===============================
// Participant Exists
// ===============================

export async function registrationExists(kayitNo) {

    const ref = doc(db, COLLECTION, kayitNo);

    const snap = await getDoc(ref);

    return snap.exists();

}


// ===============================
// Get By QR
// ===============================

export async function getByQR(kayitNo) {

    return await getRegistration(kayitNo);

}


// ===============================
// Export Default
// ===============================

export default {

    db,

    auth,

    createRegistration,

    getRegistration,

    getAllRegistrations,

    deleteRegistration,

    updateSeat,

    checkIn,

    checkOut,

    getStatistics,

    listenStatistics,

    listenRegistrations,

    searchParticipants,

    login,

    logout,

    authListener,

    registrationExists,

    getByQR,

    getRemainingCapacity,

    getTotalRegistrations,

    generateRegisterNumber

};