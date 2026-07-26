// admin.js (1/2)
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
const excelBtn = document.getElementById("excelBtn");

function normalize(text = "") {
    return text
        .toLowerCase()
        .replace(/ç/g, "c")
        .replace(/ğ/g, "g")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ş/g, "s")
        .replace(/ü/g, "u")
        .trim();
}

onAuthStateChanged(auth, user => {

    if (!user) {

        sessionStorage.removeItem("admin");
        location.replace("login.html");

        return;
    }

    if (unsubscribe) unsubscribe();

    unsubscribe = kayitlariDinle(liste => {

        kayitlar = [...liste].sort((a, b) =>
            a.kayitNo.localeCompare(b.kayitNo)
        );

        tabloOlustur(kayitlar);

        istatistik();

    });

});

function tabloOlustur(liste) {

    tableBody.innerHTML = "";

    if (!liste.length) {

        tableBody.innerHTML = `
<tr>
<td colspan="8" style="text-align:center;padding:30px;">
Kayıt bulunamadı.
</td>
</tr>`;

        return;

    }

    liste.forEach((k, i) => {

        tableBody.insertAdjacentHTML("beforeend", `

<tr>

<td>${i + 1}</td>

<td>${k.kayitNo}</td>

<td>${k.adSoyad}</td>

<td>${k.tc}</td>

<td>
<a href="tel:${k.telefon}">
${k.telefon}
</a>
</td>

<td>${k.cinsiyet}</td>

<td>

<button
class="btn ${k.checkin ? "success" : "warning"}"
data-check="${k.id}">

${k.checkin ? "✅ Giriş" : "❌ Bekliyor"}

</button>

</td>

<td>

<button
class="deleteBtn"
data-delete="${k.id}">

🗑️ Sil

</button>

</td>

</tr>

`);

    });

}

function istatistik() {

    const toplam = kayitlar.length;

    const giren = kayitlar.filter(x => x.checkin).length;

    totalCount.textContent = toplam;
    checkedCount.textContent = giren;
    waitingCount.textContent = toplam - giren;
    remainingAdmin.textContent =
        Math.max(0, MAX_KONTENJAN - toplam);

}