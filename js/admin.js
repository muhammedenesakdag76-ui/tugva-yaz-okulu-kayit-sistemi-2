import {
    auth,
    tumKayitlar,
    kayitSil,
    checkinYap,
    checkinIptal
    kayitlariDinle
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

let kayitlar = [];

const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");

const totalCount = document.getElementById("totalCount");
const checkedCount = document.getElementById("checkedCount");
const waitingCount = document.getElementById("waitingCount");
const remainingAdmin = document.getElementById("remainingAdmin");

const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const checkinPage = document.getElementById("checkinPage");

onAuthStateChanged(auth, user => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    yukle();

});

async function yukle() {

    kayitlar = await tumKayitlar();

    tabloOlustur(kayitlar);

    istatistikGuncelle();

}

function tabloOlustur(liste) {

    tableBody.innerHTML = "";

    liste.forEach(k => {

        const tr = document.createElement("tr");

        tr.innerHTML = `

<td>${k.kayitNo}</td>

<td>${k.adSoyad}</td>

<td>${k.tc}</td>

<td>${k.telefon}</td>

<td>${k.cinsiyet}</td>

<td>

<button class="btn"

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

`;

        tableBody.appendChild(tr);

    });

}

function istatistikGuncelle() {

    totalCount.textContent = kayitlar.length;

    const giren = kayitlar.filter(x => x.checkin).length;

    checkedCount.textContent = giren;

    waitingCount.textContent = kayitlar.length - giren;

    remainingAdmin.textContent = 85 - kayitlar.length;

}

searchInput.addEventListener("input", () => {

    const ara = searchInput.value.toLowerCase();

    const filtre = kayitlar.filter(k =>

        k.adSoyad.toLowerCase().includes(ara) ||

        k.tc.includes(ara) ||

        k.telefon.includes(ara)

    );

    tabloOlustur(filtre);

});

tableBody.addEventListener("click", async e => {

    const sil = e.target.dataset.delete;

    const check = e.target.dataset.check;

    if (sil) {

        if (!confirm("Bu kayıt silinsin mi?")) return;

        await kayitSil(sil);

        yukle();

    }

    if (check) {

        const kayit = kayitlar.find(x => x.id === check);

        if (!kayit) return;

        if (kayit.checkin) {

            await checkinIptal(check);

        } else {

            await checkinYap(check);

        }

        yukle();

    }

});

refreshBtn.addEventListener("click", yukle);

logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "login.html";

});

checkinPage.addEventListener("click", () => {

    window.location.href = "checkin.html";

});
setInterval(yukle,10000);