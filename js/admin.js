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

    await loadRegistrations();

}

document.addEventListener(

    "DOMContentLoaded",

    init

);