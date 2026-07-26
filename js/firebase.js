import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp,
    deleteDoc,
    doc,
    updateDoc,
    getDoc,
    limit,
    onSnapshot,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {

    apiKey:"AIzaSyDPdueIsK1w16jTZeZOQkr29hkrU_tQV0w",

    authDomain:"tugva-yaz-okulu.firebaseapp.com",

    projectId:"tugva-yaz-okulu",

    storageBucket:"tugva-yaz-okulu.firebasestorage.app",

    messagingSenderId:"302099112919",

    appId:"1:302099112919:web:cddfbb1a71db0db90fe192"

};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

export const COLLECTION = "kayitlar";

export const MAX_KONTENJAN = 40;

export const ETKINLIK_BILGISI = {

    ad:"TÜGVA Yaz Okulu Finali ve İstanbul Gezisi",

    tarih:"31 Temmuz 2026",

    kontenjan:40

};

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

    const q=query(

        collection(db,COLLECTION),

        orderBy("kayitNo")

    );

    const sonuc=await getDocs(q);

    return sonuc.docs.map(doc=>({

        id:doc.id,

        ...doc.data()

    }));

}

export async function kayitOlustur(veri){

    return await addDoc(

        collection(db,COLLECTION),

        {

            ...veri,

            checkin:false,

            checkinSaati:null,

            olusturmaTarihi:serverTimestamp(),

            guncellenmeTarihi:serverTimestamp()

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

            checkinSaati:serverTimestamp(),

            guncellenmeTarihi:serverTimestamp()

        }

    );

}

export async function checkinIptal(id){

    await updateDoc(

        doc(db,COLLECTION,id),

        {

            checkin:false,

            checkinSaati:null,

            guncellenmeTarihi:serverTimestamp()

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

export function kayitlariDinle(callback){

    const q=query(

        collection(db,COLLECTION),

        orderBy("kayitNo")

    );

    return onSnapshot(q,(snapshot)=>{

        const liste=[];

        snapshot.forEach(doc=>{

            liste.push({

                id:doc.id,

                ...doc.data()

            });

        });

        callback(liste);

    });

}
