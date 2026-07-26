import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {

getFirestore,

collection,

addDoc,

getDocs,

getDoc,

doc,

deleteDoc,

updateDoc,

query,

where,

serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig={

apiKey:"",

authDomain:"",

projectId:"",

storageBucket:"",

messagingSenderId:"",

appId:""

};

const app=initializeApp(firebaseConfig);

const db=getFirestore(app);
const auth=getAuth(app);

export{auth};

const COLLECTION="kayitlar";

export{db};

export async function tcVarMi(tc){

const q=query(

collection(db,COLLECTION),

where("tc","==",tc)

);

const sonuc=await getDocs(q);

return !sonuc.empty;

}

export async function toplamKayit(){

const sonuc=await getDocs(

collection(db,COLLECTION)

);

return sonuc.size;

}

export async function tumKayitlar(){

const sonuc=await getDocs(

collection(db,COLLECTION)

);

const liste=[];

sonuc.forEach(docItem=>{

liste.push({

id:docItem.id,

...docItem.data()

});

});

return liste;

}

export async function kayitOlustur(veri){

    return await addDoc(
        collection(db, COLLECTION),
        {
            ...veri,

            checkin: false,

            checkinSaati: null,

            olusturmaTarihi: serverTimestamp(),

            guncellenmeTarihi: serverTimestamp()
        }
    );

}

return await addDoc(

collection(db,COLLECTION),

{

...veri,

checkin:false,

checkinSaati:null,

olusturmaTarihi:serverTimestamp()

}

);

}

export async function kayitSil(id){

await deleteDoc(

doc(db,COLLECTION,id)

);

}

export async function checkinYap(id){

await updateDoc(

doc(db,COLLECTION,id),

{

checkin:true,

checkinSaati:serverTimestamp()

}

);

}

export async function checkinIptal(id){

await updateDoc(

doc(db,COLLECTION,id),

{

checkin:false,

checkinSaati:null

}

);

}

export async function kayitGetir(id){

const belge=await getDoc(

doc(db,COLLECTION,id)

);

if(!belge.exists()){

return null;

}

return{

id:belge.id,

...belge.data()

};

}
import {
...
limit 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
export async function kayitNoIleBul(kayitNo){

const q=query(
collection(db,COLLECTION),
where("kayitNo","==",kayitNo),
limit(1)
);

const sonuc=await getDocs(q);

if(sonuc.empty){
return null;
}

const belge=sonuc.docs[0];

return{
id:belge.id,
...belge.data()
};

}