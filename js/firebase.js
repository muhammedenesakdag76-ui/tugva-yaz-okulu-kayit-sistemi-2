// ===============================
// Firebase Imports
// ===============================

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
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


// ===============================
// Firebase Config
// ===============================

const firebaseConfig = {

    apiKey: "BURAYA_API_KEY",

    authDomain: "BURAYA.firebaseapp.com",

    projectId: "BURAYA",

    storageBucket: "BURAYA.appspot.com",

    messagingSenderId: "000000000000",

    appId: "1:000000000000:web:xxxxxxxx"

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

export const COLLECTION = "kayitlar";

export const MAX_CAPACITY = 45;

export const PREFIX = "TYG26";


// ===============================
// Collection Reference
// ===============================

const registrationsRef =
    collection(db, COLLECTION);


// ===============================
// Register Number Generator
// ===============================

export async function generateRegisterNumber() {

    const snapshot = await getDocs(
        query(
            registrationsRef,
            orderBy("kayitNo", "desc"),
            limit(1)
        )
    );

    if (snapshot.empty) {

        return `${PREFIX}-0001`;

    }

    const last =
        snapshot.docs[0].data().kayitNo;

    const number =
        parseInt(last.split("-")[1]) + 1;

    return `${PREFIX}-${String(number).padStart(4, "0")}`;

}


// ===============================
// Total Registrations
// ===============================

export async function getTotalRegistrations() {

    const snapshot =
        await getDocs(registrationsRef);

    return snapshot.size;

}


// ===============================
// Remaining Capacity
// ===============================

export async function getRemainingCapacity() {

    const total =
        await getTotalRegistrations();

    return MAX_CAPACITY - total;

}
// ===============================
// Capacity Control
// ===============================

export async function isFull() {

    const remaining = await getRemainingCapacity();

    return remaining <= 0;

}


// ===============================
// TC Exists
// ===============================

export async function tcExists(tc) {

    const q = query(
        registrationsRef,
        where("tc", "==", tc)
    );

    const snapshot = await getDocs(q);

    return !snapshot.empty;

}


// ===============================
// Phone Exists
// ===============================

export async function phoneExists(phone) {

    const q = query(
        registrationsRef,
        where("telefon", "==", phone)
    );

    const snapshot = await getDocs(q);

    return !snapshot.empty;

}


// ===============================
// Email Exists
// ===============================

export async function emailExists(email) {

    if (!email) return false;

    const q = query(
        registrationsRef,
        where("email", "==", email)
    );

    const snapshot = await getDocs(q);

    return !snapshot.empty;

}


// ===============================
// Create Registration
// ===============================

export async function createRegistration(data) {

    if (await isFull()) {

        throw new Error("Kontenjan dolmuştur.");

    }

    if (await tcExists(data.tc)) {

        throw new Error("Bu TC Kimlik Numarası ile kayıt yapılmış.");

    }

    if (await phoneExists(data.telefon)) {

        throw new Error("Bu telefon numarası kayıtlı.");

    }

    if (data.email) {

        if (await emailExists(data.email)) {

            throw new Error("Bu e-posta kayıtlı.");

        }

    }

    const kayitNo = await generateRegisterNumber();

    const registration = {

        kayitNo,

        adSoyad: data.adSoyad,

        tc: data.tc,

        telefon: data.telefon,

        email: data.email || "",

        dogumTarihi: data.dogumTarihi,

        cinsiyet: data.cinsiyet,

        okul: data.okul,

        sinif: data.sinif,

        veliAdi: data.veliAdi,

        veliTelefon: data.veliTelefon,

        adres: data.adres,

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

    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {

        return null;

    }

    return snapshot.data();

}


// ===============================
// Get All Registrations
// ===============================

export async function getAllRegistrations() {

    const snapshot = await getDocs(

        query(

            registrationsRef,

            orderBy("createdAt", "desc")

        )

    );

    return snapshot.docs.map(doc => doc.data());

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

export async function updateSeat(kayitNo, seat) {

    await updateDoc(

        doc(db, COLLECTION, kayitNo),

        {

            seat

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
// Search
// ===============================

export async function searchParticipants(text) {

    const all = await getAllRegistrations();

    const q = text.toLowerCase();

    return all.filter(item =>

        item.adSoyad.toLowerCase().includes(q) ||

        item.kayitNo.toLowerCase().includes(q) ||

        item.tc.includes(q) ||

        item.telefon.includes(q)

    );

}


// ===============================
// Statistics
// ===============================

export async function getStatistics() {

    const list = await getAllRegistrations();

    return {

        total: list.length,

        checkedIn: list.filter(x => x.checkedIn).length,

        remaining: MAX_CAPACITY - list.length

    };

}


// ===============================
// Live Listener
// ===============================

export function listenRegistrations(callback) {

    return onSnapshot(

        registrationsRef,

        snapshot => {

            callback(

                snapshot.docs.map(doc => doc.data())

            );

        }

    );

}


// ===============================
// Login
// ===============================

export async function login(email, password) {

    return await signInWithEmailAndPassword(

        auth,

        email,

        password

    );

}


// ===============================
// Logout
// ===============================

export async function logout() {

    await signOut(auth);

}


// ===============================
// Auth Listener
// ===============================

export function authListener(callback) {

    onAuthStateChanged(auth, callback);

}