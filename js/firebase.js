import {

    db,

    REGISTRATION_COLLECTION,

    COUNTER_COLLECTION,

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

    orderBy,

    runTransaction,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const registrationsRef = collection(

    db,

    REGISTRATION_COLLECTION

);

export async function getRegistrationCount(){

    const snapshot = await getDocs(

        registrationsRef

    );

    return snapshot.size;

}

export async function isTcExists(tc){

    const q = query(

        registrationsRef,

        where("tc","==",tc)

    );

    const s = await getDocs(q);

    return !s.empty;

}

export async function isPhoneExists(phone){

    const q = query(

        registrationsRef,

        where("phone","==",phone)

    );

    const s = await getDocs(q);

    return !s.empty;

}

async function generateRegisterNumber(){

    const counterRef = doc(

        db,

        COUNTER_COLLECTION,

        "registrations"

    );

    return await runTransaction(

        db,

        async(transaction)=>{

            const counter = await transaction.get(counterRef);

            let last = 0;

            if(counter.exists()){

                last = counter.data().lastNumber;

            }

            last++;

            transaction.set(

                counterRef,

                {

                    lastNumber:last

                },

                {

                    merge:true

                }

            );

            return `${REGISTER_PREFIX}-${String(last).padStart(4,"0")}`;

        }

    );

}

export async function addRegistration(data){

    const count = await getRegistrationCount();

    if(count>=MAX_CAPACITY){

        throw new Error(

            "Kontenjan dolmuştur."

        );

    }

    if(await isTcExists(data.tc)){

        throw new Error(

            "Bu TC kayıtlı."

        );

    }

    if(await isPhoneExists(data.phone)){

        throw new Error(

            "Bu telefon kayıtlı."

        );

    }

    const registerNumber =

        await generateRegisterNumber();

    const docRef = await addDoc(

        registrationsRef,

        {

            ...data,

            registerNumber,

            seatNumber:"",

            createdAt:serverTimestamp()

        }

    );

    return{

        id:docRef.id,

        registerNumber,

        seatNumber:""

    };

}