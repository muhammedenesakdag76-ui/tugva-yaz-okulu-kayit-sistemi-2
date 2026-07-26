import {
    auth,
    kayitSil,
    checkinYap,
    checkinIptal,
    kayitlariDinle
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const MAX_KONTENJAN = 85;

const loginTime = Number(localStorage.getItem("adminLoginTime"));

if (
    sessionStorage.getItem("admin") !== "true" ||
    !loginTime ||
    Date.now() - loginTime > 1000 * 60 * 60 * 12
) {

    sessionStorage.removeItem("admin");
    localStorage.removeItem("adminLoginTime");

    location.replace("login.html");

}

let kayitlar = [];
let unsubscribe = null;

const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");

const totalCount = document.getElementById("totalCount");
const checkedCount = document.getElementById("checkedCount");
const waitingCount = document.getElementById("waitingCount");
const remainingAdmin = document.getElementById("remainingAdmin");

const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const checkinPage = document.getElementById("checkinPage");

onAuthStateChanged(auth, (user) => {

    if (!user) {

        sessionStorage.removeItem("admin");

        location.replace("login.html");

        return;

    }

    if (unsubscribe) unsubscribe();

    unsubscribe = kayitlariDinle((liste) => {

        kayitlar = liste;

        tabloOlustur(kayitlar);

        istatistikGuncelle();

    });

});

function tabloOlustur(liste) {

    tableBody.innerHTML = "";

    if (!liste.length) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:25px;">
                    Henüz kayıt bulunmuyor.
                </td>
            </tr>
        `;

        return;

    }

    for (const k of liste) {

        tableBody.insertAdjacentHTML("beforeend", `
            <tr>

                <td>${k.kayitNo}</td>

                <td>${k.adSoyad}</td>

                <td>${k.tc}</td>

                <td>${k.telefon}</td>

                <td>${k.cinsiyet}</td>

                <td>
                    <button
                        class="btn"
                        data-check="${k.id}">
                        ${k.checkin ? "✅ Giriş" : "❌ Bekliyor"}
                    </button>
                </td>

                <td>
                    <button
                        class="deleteBtn"
                        data-delete="${k.id}">
                        Sil
                    </button>
                </td>

            </tr>
        `);

    }

}

function istatistikGuncelle() {

    const toplam = kayitlar.length;

    const giren = kayitlar.filter(k => k.checkin).length;

    totalCount.textContent = toplam;

    checkedCount.textContent = giren;

    waitingCount.textContent = toplam - giren;

    remainingAdmin.textContent = Math.max(
        0,
        MAX_KONTENJAN - toplam
    );

}

searchInput.addEventListener("input", (e) => {

    const ara = e.target.value.trim().toLowerCase();

    if (!ara) {

        tabloOlustur(kayitlar);

        return;

    }

    tabloOlustur(

        kayitlar.filter(k =>

            (k.adSoyad || "").toLowerCase().includes(ara) ||
            (k.kayitNo || "").toLowerCase().includes(ara) ||
            (k.tc || "").includes(ara) ||
            (k.telefon || "").includes(ara)

        )

    );

});

tableBody.addEventListener("click", async (e) => {

    const sil = e.target.dataset.delete;

    const check = e.target.dataset.check;

    if (!sil && !check) return;

    const buton = e.target;

    buton.disabled = true;

    try {

        if (sil) {

            if (!confirm("Bu kayıt silinsin mi?")) {

                buton.disabled = false;

                return;

            }

            await kayitSil(sil);

            alert("Kayıt başarıyla silindi.");

            return;

        }

        const kayit = kayitlar.find(x => x.id === check);

        if (!kayit) return;

        if (kayit.checkin) {

            await checkinIptal(check);

        } else {

            await checkinYap(check);

        }

    } catch (err) {

        console.error(err);

        alert("İşlem sırasında hata oluştu.");

    } finally {

        buton.disabled = false;

    }

});

refreshBtn.addEventListener("click", () => {

    searchInput.value = "";

    tabloOlustur(kayitlar);

    istatistikGuncelle();

});

logoutBtn.addEventListener("click", async () => {

    try {

        if (unsubscribe) {

            unsubscribe();

            unsubscribe = null;

        }

        sessionStorage.removeItem("admin");

        localStorage.removeItem("adminLoginTime");

        await signOut(auth);

    } finally {

        location.replace("login.html");

    }

});

checkinPage.addEventListener("click", () => {

    location.href = "checkin.html";

});

window.addEventListener("beforeunload", () => {

    if (unsubscribe) {

        unsubscribe();

    }

});

window.addEventListener("pageshow", () => {

    searchInput.value = "";

    tabloOlustur(kayitlar);

});