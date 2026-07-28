import {
    db,
    COLLECTIONS,
    REGISTER_PREFIX,
    MAX_CAPACITY
} from "./config.js";

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
    limit,
    orderBy,
    serverTimestamp,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const registrationsRef = collection(
    db,
    COLLECTIONS.registrations
);

const countersRef = collection(
    db,
    COLLECTIONS.counters
);

/* ---------------------------------- */
/* Kayıt Sayısı */
/* ---------------------------------- */

export async function getRegistrationCount() {

    const snapshot = await getDocs(registrationsRef);

    return snapshot.size;

}

/* ---------------------------------- */
/* Kapasite Kontrolü */
/* ---------------------------------- */

export async function hasCapacity() {

    const count = await getRegistrationCount();

    return count < MAX_CAPACITY;

}

/* ---------------------------------- */
/* TC Kontrolü */
/* ---------------------------------- */

export async function tcExists(tc) {

    const q = query(
        registrationsRef,
        where("tc", "==", tc),
        limit(1)
    );

    const snapshot = await getDocs(q);

    return !snapshot.empty;

}

/* ---------------------------------- */
/* Telefon Kontrolü */
/* ---------------------------------- */

export async function phoneExists(phone) {

    const q = query(
        registrationsRef,
        where("phone", "==", phone),
        limit(1)
    );

    const snapshot = await getDocs(q);

    return !snapshot.empty;

}

/* ---------------------------------- */
/* Son Kayıt Numarası */
/* ---------------------------------- */

async function nextRegisterNumber() {

    const counterDoc = doc(
        db,
        COLLECTIONS.counters,
        "registrationCounter"
    );

    return await runTransaction(
        db,
        async (transaction) => {

            const snapshot =
                await transaction.get(counterDoc);

            let nextNumber = 1;

            if (snapshot.exists()) {

                nextNumber =
                    snapshot.data().lastNumber + 1;

            }

            transaction.set(
                counterDoc,
                {
                    lastNumber: nextNumber
                }
            );

            return `${REGISTER_PREFIX}-${String(
                nextNumber
            ).padStart(4, "0")}`;

        }
    );

}

/* ---------------------------------- */
/* Yeni Kayıt */
/* ---------------------------------- */

export async function addRegistration(data) {

    if (!(await hasCapacity())) {

        throw new Error(
            "Kontenjan dolmuştur."
        );

    }

    if (await tcExists(data.tc)) {

        throw new Error(
            "Bu TC ile kayıt bulunmaktadır."
        );

    }

    if (await phoneExists(data.phone)) {

        throw new Error(
            "Bu telefon ile kayıt bulunmaktadır."
        );

    }

    const registerNumber =
        await nextRegisterNumber();

    const payload = {

        ...data,

        registerNumber,

        seatNumber: "",

        createdAt: serverTimestamp()

    };

    const docRef =
        await addDoc(
            registrationsRef,
            payload
        );

    return {

        id: docRef.id,

        ...payload

    };

}
/* ---------------------------------- */
/* Tek Kayıt Getir */
/* ---------------------------------- */

export async function getRegistration(id) {

    const ref = doc(
        db,
        COLLECTIONS.registrations,
        id
    );

    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {

        throw new Error("Kayıt bulunamadı.");

    }

    return {

        id: snapshot.id,

        ...snapshot.data()

    };

}

/* ---------------------------------- */
/* Tüm Kayıtlar */
/* ---------------------------------- */

export async function getAllRegistrations() {

    const q = query(
        registrationsRef,
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data()

    }));

}

/* ---------------------------------- */
/* Kayıt Güncelle */
/* ---------------------------------- */

export async function updateRegistration(
    id,
    data
) {

    const ref = doc(
        db,
        COLLECTIONS.registrations,
        id
    );

    await updateDoc(
        ref,
        data
    );

}

/* ---------------------------------- */
/* Koltuk Ata */
/* ---------------------------------- */

export async function assignSeat(
    id,
    seatNumber
) {

    const ref = doc(
        db,
        COLLECTIONS.registrations,
        id
    );

    await updateDoc(
        ref,
        {

            seatNumber

        }

    );

}

/* ---------------------------------- */
/* Kayıt Sil */
/* ---------------------------------- */

export async function deleteRegistration(id) {

    const ref = doc(
        db,
        COLLECTIONS.registrations,
        id
    );

    await deleteDoc(ref);

}
/* ---------------------------------- */
/* Firestore ID ile Kayıt Getir */
/* QR Okuyucu bunu kullanacak */
/* ---------------------------------- */

export async function getRegistrationById(id) {

    const ref = doc(
        db,
        COLLECTIONS.registrations,
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

/* ---------------------------------- */
/* Kayıt Numarası ile Ara */
/* ---------------------------------- */

export async function findByRegisterNumber(registerNumber) {

    const q = query(
        registrationsRef,
        where("registerNumber", "==", registerNumber),
        limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {

        return null;

    }

    const document = snapshot.docs[0];

    return {

        id: document.id,

        ...document.data()

    };

}

/* ---------------------------------- */
/* Ada Göre Ara */
/* ---------------------------------- */

export async function searchByName(name) {

    const snapshot = await getDocs(registrationsRef);

    const keyword = name.trim().toLocaleLowerCase("tr");

    return snapshot.docs
        .map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
        .filter(item => {

            const fullName =
                `${item.name} ${item.surname}`
                    .toLocaleLowerCase("tr");

            return fullName.includes(keyword);

        });

}

/* ---------------------------------- */
/* İstatistik */
/* ---------------------------------- */

export async function getStatistics() {

    const registrations =
        await getAllRegistrations();

    const total = registrations.length;

    const male =
        registrations.filter(
            x => x.gender === "Erkek"
        ).length;

    const female =
        registrations.filter(
            x => x.gender === "Kadın"
        ).length;

    const seated =
        registrations.filter(
            x => x.seatNumber &&
                 x.seatNumber !== ""
        ).length;

    return {

        total,

        male,

        female,

        seated,

        emptySeat: total - seated,

        remaining:
            MAX_CAPACITY - total

    };

}

/* ---------------------------------- */
/* Varsayılan Dışa Aktarım */
/* ---------------------------------- */

export default {

    addRegistration,

    getRegistration,

    getRegistrationById,

    getAllRegistrations,

    updateRegistration,

    deleteRegistration,

    assignSeat,

    findByTC,

    findByPhone,

    findByRegisterNumber,

    searchByName,

    getStatistics,

    hasCapacity

};