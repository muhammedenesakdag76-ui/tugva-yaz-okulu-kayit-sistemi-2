import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const resultContainer = document.getElementById("scanResult");

function onScanSuccess(decodedText, decodedResult) {
    // Tarama başarılı olduğunda QR içindeki ID ile Firestore'dan çek
    fetchParticipantInfo(decodedText);
}

async function fetchParticipantInfo(docId) {
    try {
        const docRef = doc(db, "registrations", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            resultContainer.innerHTML = `
                <div class="status-card success">
                    <h3>✅ Kayıt Doğrulandı</h3>
                    <p><strong>Ad Soyad:</strong> ${data.fullname}</p>
                    <p><strong>T.C. No:</strong> ${data.tcNo}</p>
                    <p><strong>Telefon:</strong> ${data.phone}</p>
                    <div class="seat-badge">
                        🚌 <strong>Otobüs Koltuk No:</strong> ${data.seatNumber || 'Atanmadı'}
                    </div>
                </div>
            `;
        } else {
            resultContainer.innerHTML = `<div class="status-card error">❌ Geçersiz QR Kod! Kayıt Bulunamadı.</div>`;
        }
    } catch (error) {
        resultContainer.innerHTML = `<div class="status-card error">Hata: ${error.message}</div>`;
    }
}

// html5-qrcode kütüphanesi başlatma
const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", 
    { fps: 10, qrbox: { width: 250, height: 250 } },
    /* verbose= */ false
);
html5QrcodeScanner.render(onScanSuccess);
