/* ==========================================
   qr.js
========================================== */

import {
    getRegistrationById
} from "./firebase.js";

let qrInstance = null;

let scanner = null;

/* ---------------------------------------- */
/* QR OLUŞTUR */
/* ---------------------------------------- */

export function createQRCode(
    container,
    firestoreId
) {

    clearQRCode(container);

    qrInstance = new QRCode(

        container,

        {

            text: JSON.stringify({

                id: firestoreId

            }),

            width: 220,

            height: 220,

            colorDark: "#000000",

            colorLight: "#ffffff",

            correctLevel:
                QRCode.CorrectLevel.H

        }

    );

}

/* ---------------------------------------- */
/* QR TEMİZLE */
/* ---------------------------------------- */

export function clearQRCode(container){

    container.innerHTML="";

    qrInstance=null;

}

/* ---------------------------------------- */
/* QR İÇERİĞİNİ AYRIŞTIR */
/* ---------------------------------------- */

export function parseQRCode(text){

    try{

        const data=
            JSON.parse(text);

        if(!data.id){

            return null;

        }

        return data;

    }

    catch{

        return null;

    }

}

/* ---------------------------------------- */
/* FIRESTORE'DAN KAYDI GETİR */
/* ---------------------------------------- */

export async function registrationFromQR(text){

    const payload=

        parseQRCode(text);

    if(!payload){

        throw new Error(

            "Geçersiz QR Kod."

        );

    }

    const registration=

        await getRegistrationById(

            payload.id

        );

    if(!registration){

        throw new Error(

            "Kayıt bulunamadı."

        );

    }

    return registration;

}
/* ---------------------------------------- */
/* QR OKUYUCUYU BAŞLAT */
/* ---------------------------------------- */

export async function startScanner(

    elementId,

    onSuccess

){

    scanner=new Html5Qrcode(

        elementId

    );

    await scanner.start(

        {

            facingMode:"environment"

        },

        {

            fps:10,

            qrbox:250

        },

        async(decodedText)=>{

            try{

                const registration=

                    await registrationFromQR(

                        decodedText

                    );

                await stopScanner();

                onSuccess(

                    registration

                );

            }

            catch(error){

                console.error(error);

            }

        }

    );

}

/* ---------------------------------------- */
/* QR OKUYUCUYU DURDUR */
/* ---------------------------------------- */

export async function stopScanner(){

    if(!scanner)

        return;

    try{

        await scanner.stop();

        await scanner.clear();

    }

    finally{

        scanner=null;

    }

}

/* ---------------------------------------- */
/* HTML TABLOSU */
/* ---------------------------------------- */

export function registrationToHTML(data){

    return `

<table class="table table-bordered">

<tbody>

<tr>

<th>Kayıt No</th>

<td>${data.registerNumber}</td>

</tr>

<tr>

<th>Ad Soyad</th>

<td>${data.name} ${data.surname}</td>

</tr>

<tr>

<th>TC</th>

<td>${data.tc}</td>

</tr>

<tr>

<th>Telefon</th>

<td>${data.phone}</td>

</tr>

<tr>

<th>Yaş</th>

<td>${data.age}</td>

</tr>

<tr>

<th>Cinsiyet</th>

<td>${data.gender}</td>

</tr>

<tr>

<th>İlçe</th>

<td>${data.district}</td>

</tr>

<tr>

<th>Mahalle</th>

<td>${data.neighborhood}</td>

</tr>

<tr>

<th>Adres</th>

<td>${data.address}</td>

</tr>

<tr>

<th>Okul</th>

<td>${data.school||"-"}</td>

</tr>

<tr>

<th>Sınıf</th>

<td>${data.className||"-"}</td>

</tr>

<tr>

<th>Veli</th>

<td>${data.parentName||"-"}</td>

</tr>

<tr>

<th>Veli Telefonu</th>

<td>${data.parentPhone||"-"}</td>

</tr>

<tr>

<th>Koltuk</th>

<td>${data.seatNumber||"Henüz atanmadı"}</td>

</tr>

</tbody>

</table>

`;

}