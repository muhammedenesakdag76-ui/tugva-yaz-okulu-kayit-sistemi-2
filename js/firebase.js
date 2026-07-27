import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

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
    serverTimestamp,
    runTransaction
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
const firebaseConfig = {

    apiKey: "BURAYA_API_KEY",

    authDomain: "BURAYA_AUTH_DOMAIN",

    projectId: "BURAYA_PROJECT_ID",

    storageBucket: "BURAYA_STORAGE_BUCKET",

    messagingSenderId: "BURAYA_MESSAGING_SENDER_ID",

    appId: "BURAYA_APP_ID"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const registrationsRef = collection(
    db,
    "registrations"
);

export const MAX_CAPACITY = 500;
const counterRef = doc(db, "system", "counter");

async function generateRegisterNumber() {

    return await runTransaction(db, async (transaction) => {

        const counterDoc = await transaction.get(counterRef);

        let lastNumber = 0;

        if (counterDoc.exists()) {

            lastNumber = counterDoc.data().lastNumber || 0;

        }

        const nextNumber = lastNumber + 1;

        transaction.set(
            counterRef,
            { lastNumber: nextNumber },
            { merge: true }
        );

        return `TYO-${String(nextNumber).padStart(6, "0")}`;

    });

}

async function existsByTC(tc) {

    const q = query(

        registrationsRef,

        where("tc", "==", tc),

        limit(1)

    );

    const snapshot = await getDocs(q);

    return !snapshot.empty;

}

async function existsByPhone(phone) {

    const q = query(

        registrationsRef,

        where("phone", "==", phone),

        limit(1)

    );

    const snapshot = await getDocs(q);

    return !snapshot.empty;

}

async function checkDuplicate(data) {

    if (await existsByTC(data.tc)) {

        throw new Error(

            "Bu T.C. Kimlik Numarası ile daha önce kayıt yapılmış."

        );

    }

    if (await existsByPhone(data.phone)) {

        throw new Error(

            "Bu telefon numarası ile daha önce kayıt yapılmış."

        );

    }

}
export async function addRegistration(data) {

    await checkDuplicate(data);

    const registerNumber =

        await generateRegisterNumber();

    const registration = {

        registerNumber,

        name: data.name,

        tc: data.tc,

        phone: data.phone,

        email: data.email,

        birth: data.birth,

        gender: data.gender,

        school: data.school,

        class: data.class,

        parent: data.parent,

        parentPhone: data.parentPhone,

        address: data.address,

        note: data.note,

        seat: null,

        checkedIn: false,

        createdAt: serverTimestamp()

    };

    const docRef = await addDoc(

        registrationsRef,

        registration

    );

    return {

        id: docRef.id,

        ...registration

    };

}
export async function getRegistrationCount() {

    const snapshot = await getDocs(

        registrationsRef

    );

    return snapshot.size;

}
export async function getRemainingCapacity() {

    const count =

        await getRegistrationCount();

    return Math.max(

        0,

        MAX_CAPACITY - count

    );

}
export async function isCapacityFull() {

    const remaining =

        await getRemainingCapacity();

    return remaining <= 0;

}
export async function getRegistrations() {

    const q = query(
        registrationsRef,
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(docItem => ({
        id: docItem.id,
        ...docItem.data()
    }));

}

export async function getRegistration(id) {

    const ref = doc(
        db,
        "registrations",
        id
    );

    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {

        return null;

    }

    return {

        id: snapshot.id,

        ...snapshot.data()

    };

}
export async function updateSeat(id, seat) {

    const ref = doc(
        db,
        "registrations",
        id
    );

    await updateDoc(ref, {

        seat

    });

}
export async function updateCheckIn(id, checkedIn = true) {

    const ref = doc(
        db,
        "registrations",
        id
    );

    await updateDoc(ref, {

        checkedIn

    });

}
export async function deleteRegistration(id) {

    const ref = doc(
        db,
        "registrations",
        id
    );

    await deleteDoc(ref);

}
export async function searchRegistrations(searchText) {

    const registrations = await getRegistrations();

    if (!searchText) {

        return registrations;

    }

    const keyword = searchText
        .toLowerCase()
        .trim();

    return registrations.filter(item => {

        return (

            (item.name || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (item.tc || "")
                .includes(keyword)

            ||

            (item.phone || "")
                .includes(keyword)

            ||

            (item.registerNumber || "")
                .toLowerCase()
                .includes(keyword)

        );

    });

}