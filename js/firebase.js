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

const firebaseConfig={

apiKey:"",

authDomain:"",

projectId:"",

storageBucket:"",

messagingSenderId:"",

appId:""

};

const app=

initializeApp(firebaseConfig);

export const db=

getFirestore(app);

export const auth=

getAuth(app);

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

return snap.docs.map(doc=>({

...doc.data()

}));

}

export function listenRegistrations(

callback

){

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

snapshot.docs.map(

d=>d.data()

)

);

}

);

}
// firebase.js
// Parça 4/10

export async function getRegistration(id){

const ref=

doc(

db,

COLLECTION,

id

);

const snap=

await getDoc(ref);

if(!snap.exists()){

return null;

}

return snap.data();

}

export async function updateSeat(

id,

seat

){

await updateDoc(

doc(db,COLLECTION,id),

{

seat

}

);

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

return{

total,

checkedIn,

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