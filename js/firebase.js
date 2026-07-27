import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
    getFirestore,
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
    serverTimestamp,
    limit
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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

export const registrationsRef = collection(
    db,
    "kayitlar"
);

export const MAX_CAPACITY = 500;

export const REGISTER_PREFIX = "TYO";

export const REGISTER_DIGITS = 5;
function pad(number) {

    return String(number).padStart(

        REGISTER_DIGITS,

        "0"

    );

}

export async function generateRegisterNumber() {

    const q = query(

        registrationsRef,

        orderBy("registerNumber", "desc"),

        limit(1)

    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {

        return REGISTER_PREFIX + pad(1);

    }

    const last = snapshot.docs[0].data();

    const current = Number(

        last.registerNumber.replace(

            REGISTER_PREFIX,

            ""

        )

    );

    return REGISTER_PREFIX +

        pad(current + 1);

}
export async function getRemainingCapacity() {

    const snapshot = await getDocs(

        registrationsRef

    );

    return MAX_CAPACITY -

        snapshot.size;

}

export async function isCapacityFull() {

    const remaining =

        await getRemainingCapacity();

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

    if (await registrationExists(data.tc)) {

        throw new Error("Bu T.C. Kimlik Numarası ile kayıt bulunmaktadır.");

    }

    if (await phoneExists(data.phone)) {

        throw new Error("Bu telefon numarası ile kayıt bulunmaktadır.");

    }

    if (await isCapacityFull()) {

        throw new Error("Kontenjan dolmuştur.");

    }

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

        seat: "",

        checkedIn: false,

        createdAt: serverTimestamp()

    };

    const ref = await addDoc(

        registrationsRef,

        registration

    );

    return {

        id: ref.id,

        ...registration

    };

}
export async function getRegistration(id) {

    const snapshot = await getDoc(

        doc(db, "kayitlar", id)

    );

    if (!snapshot.exists()) {

        return null;

    }

    return {

        id: snapshot.id,

        ...snapshot.data()

    };

}

export async function getAllRegistrations() {

    const q = query(

        registrationsRef,

        orderBy("registerNumber")

    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(item => ({

        id: item.id,

        ...item.data()

    }));

}
export async function updateRegistration(

    id,

    data

) {

    const ref = doc(

        db,

        "kayitlar",

        id

    );

    await updateDoc(

        ref,

        data

    );

}

export async function deleteRegistration(id) {

    await deleteDoc(

        doc(

            db,

            "kayitlar",

            id

        )

    );

}
export async function updateSeat(

    id,

    seat

) {

    await updateDoc(

        doc(db, "kayitlar", id),

        {

            seat

        }

    );

}

export async function updateCheckIn(

    id,

    checkedIn

) {

    await updateDoc(

        doc(db, "kayitlar", id),

        {

            checkedIn

        }

    );

}
export async function searchRegistrations(searchText = "") {

    const registrations =

        await getAllRegistrations();

    if (!searchText.trim()) {

        return registrations;

    }

    const text =

        searchText
            .toLocaleLowerCase("tr");

    return registrations.filter(item => {

        return [

            item.registerNumber,

            item.name,

            item.tc,

            item.phone,

            item.parent,

            item.school,

            item.class,

            item.seat

        ]

        .join(" ")

        .toLocaleLowerCase("tr")

        .includes(text);

    });

}
export async function getStatistics() {

    const registrations =

        await getAllRegistrations();

    return {

        total:

            registrations.length,

        remaining:

            MAX_CAPACITY -

            registrations.length,

        checkedIn:

            registrations.filter(

                x => x.checkedIn

            ).length,

        absent:

            registrations.filter(

                x => !x.checkedIn

            ).length,

        assignedSeat:

            registrations.filter(

                x => x.seat

            ).length,

        unassignedSeat:

            registrations.filter(

                x => !x.seat

            ).length

    };

}
export async function updateManySeats(

    updates

) {

    for (const item of updates) {

        await updateSeat(

            item.id,

            item.seat

        );

    }

}

export async function updateManyCheckIn(

    updates

) {

    for (const item of updates) {

        await updateCheckIn(

            item.id,

            item.checkedIn

        );

    }

}
export async function exportRegistrations() {

    return await getAllRegistrations();

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
export default {

    db,

    registrationsRef,

    MAX_CAPACITY,

    generateRegisterNumber,

    getRemainingCapacity,

    isCapacityFull,

    registrationExists,

    phoneExists,

    addRegistration,

    getRegistration,

    getAllRegistrations,

    updateRegistration,

    deleteRegistration,

    updateSeat,

    updateCheckIn,

    searchRegistrations,

    getStatistics,

    updateManySeats,

    updateManyCheckIn,

    exportRegistrations,

    createEmptyRegistration

};
import {
    onSnapshot
} from "firebase/firestore";

export function subscribeRegistrations(callback) {

    return onSnapshot(

        registrationsRef,

        snapshot => {

            const data = [];

            snapshot.forEach(doc => {

                data.push({

                    id: doc.id,

                    ...doc.data()

                });

            });

            callback(data);

        }

    );

}