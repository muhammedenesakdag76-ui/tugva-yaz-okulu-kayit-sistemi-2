import {

    getRegistrations,
    getStatistics,
    updateSeat,
    updateCheckIn,
    deleteRegistration,
    searchRegistrations

} from "./firebase.js";

const ADMIN = {

    registrations: [],

    filtered: []

};

const $ = selector => document.querySelector(selector);

const $$ = selector => document.querySelectorAll(selector);

function text(id, value) {

    const element = document.getElementById(id);

    if (element) {

        element.textContent = value;

    }

}

function html(id, value) {

    const element = document.getElementById(id);

    if (element) {

        element.innerHTML = value;

    }

}

function showLoading() {

    const loading = $("#loading");

    if (loading) {

        loading.style.display = "flex";

    }

}

function hideLoading() {

    const loading = $("#loading");

    if (loading) {

        loading.style.display = "none";

    }

}
async function loadStatistics() {

    const stats = await getStatistics();

    text("totalRegistrations", stats.total);

    text("checkedInCount", stats.checkedIn);

    text("remainingCapacity", stats.remaining);

    text("seatCount", stats.seated);

}
async function loadRegistrations() {

    showLoading();

    try {

        ADMIN.registrations =

            await getRegistrations();

        ADMIN.filtered =

            [...ADMIN.registrations];

        renderTable();

        await loadStatistics();

    }

    finally {

        hideLoading();

    }

}
function renderTable() {

    const tbody = document.getElementById(
        "registrationTableBody"
    );

    if (!tbody) return;

    if (ADMIN.filtered.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    Kayıt bulunamadı.
                </td>
            </tr>
        `;

        return;

    }

    tbody.innerHTML = ADMIN.filtered.map(item => `

        <tr>

            <td>${item.registerNumber}</td>

            <td>${item.name}</td>

            <td>${item.phone}</td>

            <td>

                <input
                    type="text"
                    class="form-control seat-input"
                    data-id="${item.id}"
                    value="${item.seat ?? ""}"
                    placeholder="Koltuk">

            </td>

            <td>

                ${
                    item.checkedIn

                        ? '<span class="badge bg-success">Giriş Yaptı</span>'

                        : '<span class="badge bg-secondary">Bekliyor</span>'

                }

            </td>

            <td>

                <button
                    class="btn btn-success btn-sm check-btn"
                    data-id="${item.id}">

                    QR Giriş

                </button>

            </td>

            <td>

                <button
                    class="btn btn-danger btn-sm delete-btn"
                    data-id="${item.id}">

                    Sil

                </button>

            </td>

        </tr>

    `).join("");

    bindTableEvents();

}
function bindTableEvents() {

    document
        .querySelectorAll(".seat-input")
        .forEach(input => {

            input.addEventListener(

                "change",

                async e => {

                    await updateSeat(

                        e.target.dataset.id,

                        e.target.value

                    );

                }

            );

        });

    document
        .querySelectorAll(".check-btn")
        .forEach(button => {

            button.addEventListener(

                "click",

                async () => {

                    await updateCheckIn(

                        button.dataset.id

                    );

                    await loadRegistrations();

                }

            );

        });

    document
        .querySelectorAll(".delete-btn")
        .forEach(button => {

            button.addEventListener(

                "click",

                async () => {

                    const ok = confirm(

                        "Bu kayıt silinsin mi?"

                    );

                    if (!ok) return;

                    await deleteRegistration(

                        button.dataset.id

                    );

                    await loadRegistrations();

                }

            );

        });

}
function setupSearch() {

    const input = document.getElementById(
        "searchInput"
    );

    if (!input) return;

    input.addEventListener(

        "input",

        async e => {

            ADMIN.filtered = await searchRegistrations(

                e.target.value

            );

            renderTable();

        }

    );

}
function setupRefreshButton() {

    const button = document.getElementById(
        "refreshButton"
    );

    if (!button) return;

    button.addEventListener(

        "click",

        async () => {

            await loadRegistrations();

        }

    );

}
async function init() {

    setupSearch();

setupRefreshButton();

setupQrButtons();

autoRefresh();

setupExportButtons();

await loadRegistrations();

}

document.addEventListener(

    "DOMContentLoaded",

    init

);
let qrScanner = null;

async function onQrSuccess(decodedText) {

    if (qrScanner) {

        await qrScanner.stop();

    }

    try {

        const data = JSON.parse(decodedText);

        if (!data.id) {

            alert("Geçersiz QR kod.");

            return;

        }

        await updateCheckIn(data.id, true);

        alert("Giriş başarıyla kaydedildi.");

        await loadRegistrations();

    }

    catch (error) {

        console.error(error);

        alert("QR kod okunamadı.");

    }

}

function startQrScanner() {

    const reader = document.getElementById("qr-reader");

    if (!reader) return;

    qrScanner = new Html5Qrcode("qr-reader");

    qrScanner.start(

        { facingMode: "environment" },

        {

            fps: 10,

            qrbox: 250

        },

        onQrSuccess,

        () => {}

    );

}

async function stopQrScanner() {

    if (!qrScanner) return;

    try {

        await qrScanner.stop();

        await qrScanner.clear();

    }

    catch (e) {

        console.error(e);

    }

    qrScanner = null;

}
function setupQrButtons() {

    const openButton = document.getElementById("startQrButton");

    const closeButton = document.getElementById("stopQrButton");

    if (openButton) {

        openButton.addEventListener(

            "click",

            startQrScanner

        );

    }

    if (closeButton) {

        closeButton.addEventListener(

            "click",

            stopQrScanner

        );

    }

}
function showToast(message, type = "success") {

    const toast = document.getElementById("adminToast");

    if (!toast) {

        alert(message);

        return;

    }

    toast.className =
        `toast align-items-center text-bg-${type}`;

    toast.querySelector(".toast-body").textContent =
        message;

    const bsToast =
        bootstrap.Toast.getOrCreateInstance(toast);

    bsToast.show();

}
function exportCSV() {

    const rows = [

        [
            "Kayıt No",
            "Ad Soyad",
            "Telefon",
            "TC",
            "Koltuk",
            "Durum"
        ]

    ];

    ADMIN.registrations.forEach(item => {

        rows.push([

            item.registerNumber,

            item.name,

            item.phone,

            item.tc,

            item.seat ?? "",

            item.checkedIn
                ? "Giriş Yaptı"
                : "Bekliyor"

        ]);

    });

    const csv = rows
        .map(r => r.join(";"))
        .join("\n");

    const blob = new Blob(

        [csv],

        {

            type: "text/csv;charset=utf-8;"

        }

    );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        "kayitlar.csv";

    a.click();

    URL.revokeObjectURL(url);

}
function printTable() {

    window.print();

}
function autoRefresh() {

    setInterval(

        async () => {

            await loadRegistrations();

        },

        30000

    );

}
function setupExportButtons() {

    const csvButton =
        document.getElementById("exportCsvButton");

    const pdfButton =
        document.getElementById("printButton");

    if (csvButton) {

        csvButton.addEventListener(

            "click",

            exportCSV

        );

    }

    if (pdfButton) {

        pdfButton.addEventListener(

            "click",

            printTable

        );

    }

}