import { db, auth } from "./firebase.js";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Guard: Giriş yapılmamışsa login.html'e yönlendir
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    }
});

const userTableBody = document.getElementById("userTableBody");
const searchInput = document.getElementById("searchInput");
let allRegistrations = [];

// Firestore'dan verileri anlık (realtime) çek
onSnapshot(collection(db, "registrations"), (snapshot) => {
    allRegistrations = [];
    snapshot.forEach((docSnap) => {
        allRegistrations.push({ id: docSnap.id, ...docSnap.data() });
    });
    renderTable(allRegistrations);
});

// Tabloyu Çizdirme
function renderTable(data) {
    userTableBody.innerHTML = "";
    
    if(data.length === 0) {
        userTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Kayıt bulunamadı.</td></tr>`;
        return;
    }

    data.forEach((item) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><code>${item.id}</code></td>
            <td><strong>${item.fullname || '-'}</strong></td>
            <td>${item.phone || '-'}</td>
            <td>${item.tcNo || '-'}</td>
            <td>
                <div style="display:flex; gap:5px;">
                    <input type="text" id="seat-${item.id}" value="${item.seatNumber || ''}" placeholder="Örn: A-12" style="width:70px; padding:4px;" />
                    <button class="btn-save-seat" data-id="${item.id}">Kaydet</button>
                </div>
            </td>
            <td>
                <button class="btn-download-qr" data-id="${item.id}" data-name="${item.fullname}">QR İndir</button>
                <button class="btn-delete danger" data-id="${item.id}">Sil</button>
            </td>
        `;
        userTableBody.appendChild(tr);
    });

    bindEvents();
}

// Buton Etkinlikleri
function bindEvents() {
    // 1. Otobüs Koltuk No Güncelleme (Anlık QR'a yansır)
    document.querySelectorAll(".btn-save-seat").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.dataset.id;
            const newSeat = document.getElementById(`seat-${id}`).value;
            try {
                await updateDoc(doc(db, "registrations", id), { seatNumber: newSeat });
                alert("Koltuk numarası başarıyla güncellendi!");
            } catch (err) {
                alert("Güncelleme hatası: " + err.message);
            }
        });
    });

    // 2. Manuel QR İndirme
    document.querySelectorAll(".btn-download-qr").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.dataset.id;
            const name = e.target.dataset.name;
            downloadManualQR(id, name);
        });
    });

    // 3. Kullanıcı Silme
    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            if (confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
                const id = e.target.dataset.id;
                await deleteDoc(doc(db, "registrations", id));
            }
        });
    });
}

// Arama Filtresi
searchInput?.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allRegistrations.filter(r => 
        (r.fullname && r.fullname.toLowerCase().includes(term)) ||
        (r.tcNo && r.tcNo.includes(term)) ||
        (r.id && r.id.toLowerCase().includes(term))
    );
    renderTable(filtered);
});

// Manuel QR Üretip İndirme Helper
function downloadManualQR(id, name) {
    const tempDiv = document.createElement("div");
    new QRCode(tempDiv, { text: id, width: 256, height: 256 });
    
    setTimeout(() => {
        const img = tempDiv.querySelector("img");
        if(img) {
            const a = document.createElement("a");
            a.href = img.src;
            a.download = `TUGVA_QR_${name.replace(/\s+/g, '_')}.png`;
            a.click();
        }
    }, 300);
}

// Çıkış Yap
document.getElementById("logoutBtn")?.addEventListener("click", () => signOut(auth));
