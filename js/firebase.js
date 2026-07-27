// firebase.js
// Profesyonel Sürüm
// Parça 1/10

import {
initializeApp
}
from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import{

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

onSnapshot,

serverTimestamp,

writeBatch

}
from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import{

getAuth,

signInWithEmailAndPassword,

signOut,

onAuthStateChanged

}
from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

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

export const COLLECTION=

"kayitlar";

export const LOG_COLLECTION=

"loglar";

export const MAX_CAPACITY=

45;
// firebase.js
// Parça 2/10

export function authListener(callback){

onAuthStateChanged(

auth,

callback

);

}

export function login(

email,

password

){

return signInWithEmailAndPassword(

auth,

email,

password

);

}

export function logout(){

return signOut(auth);

}
// firebase.js
// Parça 3/10

export async function getAllRegistrations(){

const q=query(

collection(db,COLLECTION),

orderBy(

"createdAt",

"desc"

)

);

const snap=

await getDocs(q);

return snap.docs.map(d => ({
  id: d.id,
  ...d.data()
}));

}

export function listenRegistrations(callback){

    const q=query(

        collection(db,COLLECTION),

        orderBy(

            "createdAt",

            "desc"

        )

    );

    return onSnapshot(

        q,

        snapshot=>{

            callback(

                snapshot.docs.map(doc=>({

                    id:doc.id,

                    ...doc.data()

                }))

            );

        }

    );

}
// firebase.js
// Parça 4/10

export async function getRegistration(id){

    const ref=

        doc(db,COLLECTION,id);

    const snap=

        await getDoc(ref);

    if(!snap.exists())

        return null;

    return{

        id:snap.id,

        ...snap.data()

    };

}
// firebase.js
// Parça 5/10

export async function checkIn(id){

await updateDoc(

doc(db,COLLECTION,id),

{

checkedIn:true,

checkinTime:

serverTimestamp()

}

);

await addLog(

"Giriş",

id

);

}

export async function checkOut(id){

await updateDoc(

doc(db,COLLECTION,id),

{

checkedIn:false

}

);

await addLog(

"Çıkış",

id

);

}
// firebase.js
// Parça 6/10

export async function deleteRegistration(id){

await deleteDoc(

doc(db,COLLECTION,id)

);

await addLog(

"Kayıt Silindi",

id

);

}

export async function getStatistics(){

const list=

await getAllRegistrations();

const total=

list.length;

const checkedIn=

list.filter(

x=>x.checkedIn

).length;

const waiting=

total-

checkedIn;

const remaining=

MAX_CAPACITY-

total;

return {
  total,
  checked: checkedIn,
  waiting,
  remaining
};

}
// firebase.js
// Parça 7/10

export async function addLog(

action,

id

){

const ref=

doc(

collection(

db,

LOG_COLLECTION

)

);

await setDoc(

ref,

{

action,

participant:id,

time:

serverTimestamp()

}

);

}
// firebase.js
// Parça 8/10

export async function batchDelete(ids){

    const batch=

        writeBatch(db);

    ids.forEach(id=>{

        batch.delete(

            doc(

                db,

                COLLECTION,

                id

            )

        );

    });

    await batch.commit();

    for(const id of ids){

        await addLog(

            "Toplu Silme",

            id

        );

    }

}
// firebase.js
// Parça 9/10

export async function batchCheckIn(ids){

const batch=

writeBatch(db);

ids.forEach(id=>{

batch.update(

doc(

db,

COLLECTION,

id

),

{

checkedIn:true,

checkinTime:

serverTimestamp()

}

);

});

await batch.commit();

}
// firebase.js
// Parça 10/10 (Son)

export async function batchCheckOut(ids){

const batch=

writeBatch(db);

ids.forEach(id=>{

batch.update(

doc(

db,

COLLECTION,

id

),

{

checkedIn:false

}

);

});

await batch.commit();

}
// firebase.js
// Ek Fonksiyonlar
// Parça 11/15

export async function searchParticipants(keyword){

const list=

await getAllRegistrations();

const text=

keyword

.trim()

.toLowerCase();

return list.filter(item=>{

return(

item.kayitNo

.toLowerCase()

.includes(text)

||

item.adSoyad

.toLowerCase()

.includes(text)

||

item.tc

.includes(text)

||

item.telefon

.includes(text)

||

(item.okul||"")

.toLowerCase()

.includes(text)

);

});

}
// firebase.js
// Parça 12/15

export async function getRemainingCapacity(){

const list=

await getAllRegistrations();

return MAX_CAPACITY-list.length;

}

export async function isFull(){

const remaining=

await getRemainingCapacity();

return remaining<=0;

}
// firebase.js
// Parça 13/15

export async function registrationExists(tc){

const list=

await getAllRegistrations();

return list.some(

item=>item.tc===tc

);

}

export async function phoneExists(phone){

const list=

await getAllRegistrations();

return list.some(

item=>item.telefon===phone

);

}
// firebase.js
// Parça 14/15

export async function createRegistration(data){

await setDoc(

doc(

db,

COLLECTION,

data.kayitNo

),

{

...data,

checkedIn:false,

seat:"",

createdAt:

serverTimestamp()

}

);

await addLog(

"Kayıt Oluşturuldu",

data.kayitNo

);

}
// firebase.js
// Parça 15/15 (Son)

export async function generateRegisterNumber(){

const list=

await getAllRegistrations();

const no=

String(

list.length+1

)

.padStart(

4,

"0"

);

return `TYG26-${no}`;

}
/* ==========================================
YENİ PANEL UYUMLULUĞU
========================================== */

export async function updateRegistration(id,data){

    await updateDoc(

        doc(db,COLLECTION,id),

        data

    );

    await addLog(

        "Kayıt Güncellendi",

        id

    );

}

export async function addRegistration(data){

    const ref=doc(

        collection(db,COLLECTION)

    );

    await setDoc(

        ref,

        {

            ...data,

            checkedIn:false,

            createdAt:serverTimestamp()

        }

    );

    await addLog(

        "Yeni Kayıt",

        ref.id

    );

}
export {

createRegistration as createParticipant,

generateRegisterNumber as generateRegistrationNumber,

checkIn,

checkOut,

batchCheckIn,

batchCheckOut,

deleteRegistration

};