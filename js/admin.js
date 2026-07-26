import {
    auth,
    kayitSil,
    checkinYap,
    checkinIptal,
    kayitlariDinle,
    MAX_KONTENJAN
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const totalCount = document.getElementById("totalCount");
const checkedCount = document.getElementById("checkedCount");
const waitingCount = document.getElementById("waitingCount");
const remainingAdmin = document.getElementById("remainingAdmin");

const searchInput = document.getElementById("searchInput");
const tableBody = document.getElementById("tableBody");

const excelBtn = document.getElementById("excelBtn");
const refreshBtn = document.getElementById("refreshBtn");
const logoutBtn = document.getElementById("logoutBtn");
const checkinPage = document.getElementById("checkinPage");

let tumKayitlar = [];
let unsubscribe = null;

const loginTime = Number(localStorage.getItem("adminLoginTime"));

if (!loginTime || Date.now() - loginTime > 12 * 60 * 60 * 1000) {

    localStorage.removeItem("adminLoginTime");

    window.location.href = "login.html";

}

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    if (unsubscribe) {

        unsubscribe();

    }

    unsubscribe = kayitlariDinle((liste) => {

        tumKayitlar = liste;

        tabloyuGoster(liste);

        istatistikleriGuncelle(liste);

    });

});

function normalize(text = "") {

    return text
        .toString()
        .toLowerCase()
        .replace(/ç/g, "c")
        .replace(/ğ/g, "g")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ş/g, "s")
        .replace(/ü/g, "u");

}
function istatistikleriGuncelle(liste) {

    const toplam = liste.length;

    const checkin = liste.filter(k => k.checkin).length;

    totalCount.textContent = toplam;

    checkedCount.textContent = checkin;

    waitingCount.textContent = toplam - checkin;

    remainingAdmin.textContent = Math.max(
        0,
        MAX_KONTENJAN - toplam
    );

}

function tabloyuGoster(liste) {

    tableBody.innerHTML = "";

    liste.sort((a, b) =>
        (a.kayitNo || "").localeCompare(b.kayitNo || "")
    );

    liste.forEach(k => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${k.kayitNo || "-"}</td>
            <td>${k.adSoyad || "-"}</td>
            <td>${k.tc || "-"}</td>
            <td>
                <a href="tel:${k.telefon || ""}">
                    ${k.telefon || "-"}
                </a>
            </td>
            <td>${k.dogumTarihi || "-"}</td>
            <td>${k.cinsiyet || "-"}</td>
            <td>
                ${k.acilDurumKisi || "-"}<br>
                <small>${k.acilDurumTelefonu || ""}</small>
            </td>

            <td>
                ${
                    k.checkin
                    ? "✅ Yapıldı"
                    : "⏳ Bekliyor"
                }
            </td>

            <td>

                ${
                    k.checkin
                    ? `<button class="cancelBtn" data-cancel="${k.id}">
                        İptal
                       </button>`
                    : `<button class="checkBtn" data-check="${k.id}">
                        Check-in
                       </button>`
                }

                <button
                    class="deleteBtn"
                    data-delete="${k.id}">
                    Sil
                </button>

            </td>
        `;

        tableBody.appendChild(tr);

    });

}
searchInput.addEventListener("input", () => {

    const ara = normalize(searchInput.value);

    if (!ara) {

        tabloyuGoster(tumKayitlar);

        return;

    }

    const filtreli = tumKayitlar.filter(k => {

        return [

            k.adSoyad,
            k.tc,
            k.telefon,
            k.kayitNo

        ].some(deger =>
            normalize(deger).includes(ara)
        );

    });

    tabloyuGoster(filtreli);

});

tableBody.addEventListener("click", async (e) => {

    const checkId = e.target.dataset.check;
    const cancelId = e.target.dataset.cancel;
    const deleteId = e.target.dataset.delete;

    try {

        if (checkId) {

            await checkinYap(checkId);

            return;

        }

        if (cancelId) {

            await checkinIptal(cancelId);

            return;

        }

        if (deleteId) {

            const onay = confirm(
                "Bu kayıt silinsin mi?"
            );

            if (!onay) return;

            await kayitSil(deleteId);

        }

    } catch (err) {

        console.error(err);

        alert("İşlem sırasında hata oluştu.");

    }

});
excelBtn.addEventListener("click", () => {

    const veri = tumKayitlar.map(k => ({

        "Kayıt No": k.kayitNo,
        "Ad Soyad": k.adSoyad,
        "T.C.": k.tc,
        "Telefon": k.telefon,
        "Doğum Tarihi": k.dogumTarihi,
        "Cinsiyet": k.cinsiyet,
        "E-Posta": k.email,
        "Acil Durum Kişisi": k.acilDurumKisi,
        "Acil Durum Telefonu": k.acilDurumTelefonu,
        "Not": k.not,
        "Check-in": k.checkin ? "Evet" : "Hayır",
        "Check-in Saati": k.checkinSaati?.toDate?.().toLocaleString("tr-TR") || ""

    }));

    const ws = XLSX.utils.json_to_sheet(veri);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Kayıtlar"
    );

    XLSX.writeFile(
        wb,
        "TUGVA_Yaz_Okulu_Kayitlari.xlsx"
    );

});

refreshBtn.addEventListener("click", () => {

    tabloyuGoster(tumKayitlar);

    istatistikleriGuncelle(tumKayitlar);

    searchInput.value = "";

});

checkinPage.addEventListener("click", () => {

    window.location.href = "checkin.html";

});

logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    localStorage.removeItem("adminLoginTime");

    window.location.href = "login.html";

});
window.addEventListener("beforeunload", () => {

    if (unsubscribe) {

        unsubscribe();

    }

});

document.addEventListener("visibilitychange", () => {

    if (document.hidden) {

        return;

    }

    tabloyuGoster(tumKayitlar);

    istatistikleriGuncelle(tumKayitlar);

});

setInterval(() => {

    const loginTime = Number(
        localStorage.getItem("adminLoginTime")
    );

    if (!loginTime) {

        window.location.href = "login.html";
        return;

    }

    const gecenSure = Date.now() - loginTime;

    if (gecenSure > 12 * 60 * 60 * 1000) {

        signOut(auth);

        localStorage.removeItem("adminLoginTime");

        alert("Oturum süreniz doldu.");

        window.location.href = "login.html";

    }

}, 60000);