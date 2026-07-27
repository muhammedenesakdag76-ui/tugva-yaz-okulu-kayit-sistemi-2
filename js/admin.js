import {
    authListener,
    login,
    logout,
    listenRegistrations,
    deleteRegistration,
    updateRegistration,
    checkIn,
    checkOut,
    getStatistics
} from "./firebase.js";

import {
    downloadRegistrationPDF
} from "./pdf.js";

let registrations = [];

let filteredRegistrations = [];

let selectedRegistration = null;

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const tableBody = document.getElementById("tableBody");

const searchInput = document.getElementById("search");

const filterSelect = document.getElementById("filter");

const totalElement = document.getElementById("statTotal");

const checkedElement = document.getElementById("statChecked");

const waitingElement = document.getElementById("statWaiting");

const remainingElement = document.getElementById("statRemaining");

function setLoading(status) {

    const button = loginForm?.querySelector("button");

    if (!button) return;

    button.disabled = status;

    button.textContent = status

        ? "Giriş Yapılıyor..."

        : "Giriş Yap";

}
async function handleLogin(event) {

    event.preventDefault();

    setLoading(true);

    try {

        await login(

            emailInput.value.trim(),

            passwordInput.value

        );

    }

    catch (error) {

        console.error(error);

        alert("E-posta veya şifre hatalı.");

    }

    finally {

        setLoading(false);

    }

}

async function handleLogout() {

    try {

        await logout();

    }

    catch (error) {

        console.error(error);

        alert("Çıkış yapılırken hata oluştu.");

    }

}

function showLogin() {

    document
        .getElementById("loginPage")
        ?.classList.remove("hidden");

    document
        .getElementById("adminPage")
        ?.classList.add("hidden");

}

function showAdmin() {

    document
        .getElementById("loginPage")
        ?.classList.add("hidden");

    document
        .getElementById("adminPage")
        ?.classList.remove("hidden");

}

authListener(user => {

    if (user) {

        showAdmin();

        loadRegistrations();

    }

    else {

        showLogin();

    }

});

loginForm?.addEventListener(

    "submit",

    handleLogin

);

document

    .getElementById("logoutButton")

    ?.addEventListener(

        "click",

        handleLogout

    );
    function loadRegistrations() {

    listenRegistrations(data => {

        registrations = data;

        applyFilters();

        updateStatistics();

    });

}

function updateStatistics() {

    const total = registrations.length;

    const checked = registrations.filter(item => item.checkedIn).length;

    const waiting = total - checked;

    const remaining = Math.max(0, 45 - total);

    if (totalElement) totalElement.textContent = total;
    if (checkedElement) checkedElement.textContent = checked;
    if (waitingElement) waitingElement.textContent = waiting;
    if (remainingElement) remainingElement.textContent = remaining;

}

function renderTable(list = registrations) {

    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (!list.length) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center">
                    Kayıt bulunamadı.
                </td>
            </tr>
        `;

        return;

    }

    list.forEach(item => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.registerNumber}</td>
            <td>${item.name}</td>
            <td>${item.school}</td>
            <td>${item.class}</td>
            <td>${item.phone}</td>
            <td>
                ${
                    item.checkedIn
                        ? '<span class="badge success">Giriş Yaptı</span>'
                        : '<span class="badge warning">Bekliyor</span>'
                }
            </td>
            <td>
                <button class="btn-view" data-id="${item.id}">
                    Görüntüle
                </button>

                <button class="btn-edit" data-id="${item.id}">
                    Düzenle
                </button>

                <button class="btn-delete" data-id="${item.id}">
                    Sil
                </button>
            </td>
        `;

        tableBody.appendChild(tr);

    });

    attachRowEvents();

}
function applyFilters() {

    const search = (searchInput?.value || "")
        .trim()
        .toLocaleLowerCase("tr-TR");

    const filter = filterSelect?.value || "all";

    filteredRegistrations = registrations.filter(item => {

        const matchesSearch =

            (item.registerNumber || "")
                .toLocaleLowerCase("tr-TR")
                .includes(search)

            ||

            (item.name || "")
                .toLocaleLowerCase("tr-TR")
                .includes(search)

            ||

            (item.tc || "")
                .includes(search)

            ||

            (item.phone || "")
                .includes(search)

            ||

            (item.school || "")
                .toLocaleLowerCase("tr-TR")
                .includes(search);

        let matchesFilter = true;

        switch (filter) {

            case "checked":
                matchesFilter = item.checkedIn;
                break;

            case "waiting":
                matchesFilter = !item.checkedIn;
                break;

            default:
                matchesFilter = true;

        }

        return matchesSearch && matchesFilter;

    });

    renderTable(filteredRegistrations);

}

function attachRowEvents() {

    document.querySelectorAll(".btn-view")
        .forEach(button => {

            button.onclick = () => {

                const id = button.dataset.id;

                selectedRegistration = registrations.find(

                    item => item.id === id

                );

                if (!selectedRegistration) return;

                openDetailModal(selectedRegistration);

            };

        });

    document.querySelectorAll(".btn-edit")
        .forEach(button => {

            button.onclick = () => {

                const id = button.dataset.id;

                selectedRegistration = registrations.find(

                    item => item.id === id

                );

                if (!selectedRegistration) return;

                openEditModal(selectedRegistration);

            };

        });

    document.querySelectorAll(".btn-delete")
        .forEach(button => {

            button.onclick = async () => {

                const id = button.dataset.id;

                const registration = registrations.find(

                    item => item.id === id

                );

                if (!registration) return;

                const confirmed = confirm(

                    `${registration.name} adlı kaydı silmek istiyor musunuz?`

                );

                if (!confirmed) return;

                try {

                    await deleteRegistration(id);

                }

                catch (error) {

                    console.error(error);

                    alert("Kayıt silinemedi.");

                }

            };

        });

}

searchInput?.addEventListener(

    "input",

    applyFilters

);

filterSelect?.addEventListener(

    "change",

    applyFilters

);
const detailModal = document.getElementById("detailModal");
const editModal = document.getElementById("editModal");

function openDetailModal(registration) {

    if (!detailModal) return;

    detailModal.querySelector("[data-name]").textContent = registration.name;
    detailModal.querySelector("[data-register]").textContent = registration.registerNumber;
    detailModal.querySelector("[data-tc]").textContent = registration.tc;
    detailModal.querySelector("[data-phone]").textContent = registration.phone;
    detailModal.querySelector("[data-school]").textContent = registration.school;
    detailModal.querySelector("[data-class]").textContent = registration.class;
    detailModal.querySelector("[data-parent]").textContent = registration.parent;
    detailModal.querySelector("[data-parent-phone]").textContent = registration.parentPhone;
    detailModal.querySelector("[data-address]").textContent = registration.address || "-";
    detailModal.querySelector("[data-note]").textContent = registration.note || "-";

    detailModal.classList.add("show");

}

function closeDetailModal() {

    detailModal?.classList.remove("show");

}

function openEditModal(registration) {

    if (!editModal) return;

    editModal.dataset.id = registration.id;

    editModal.querySelector('[name="name"]').value = registration.name;
    editModal.querySelector('[name="phone"]').value = registration.phone;
    editModal.querySelector('[name="school"]').value = registration.school;
    editModal.querySelector('[name="class"]').value = registration.class;
    editModal.querySelector('[name="parent"]').value = registration.parent;
    editModal.querySelector('[name="parentPhone"]').value = registration.parentPhone;
    editModal.querySelector('[name="address"]').value = registration.address || "";
    editModal.querySelector('[name="note"]').value = registration.note || "";

    editModal.classList.add("show");

}

function closeEditModal() {

    editModal?.classList.remove("show");

}

async function saveRegistration() {

    const id = editModal.dataset.id;

    const data = {

        name: editModal.querySelector('[name="name"]').value,

        phone: editModal.querySelector('[name="phone"]').value,

        school: editModal.querySelector('[name="school"]').value,

        class: editModal.querySelector('[name="class"]').value,

        parent: editModal.querySelector('[name="parent"]').value,

        parentPhone: editModal.querySelector('[name="parentPhone"]').value,

        address: editModal.querySelector('[name="address"]').value,

        note: editModal.querySelector('[name="note"]').value

    };

    try {

        await updateRegistration(id, data);

        closeEditModal();

    }

    catch (error) {

        console.error(error);

        alert("Kayıt güncellenemedi.");

    }

}

async function toggleCheck(registration) {

    try {

        if (registration.checkedIn) {

            await checkOut(registration.id);

        } else {

            await checkIn(registration.id);

        }

    }

    catch (error) {

        console.error(error);

        alert("Yoklama işlemi başarısız.");

    }

}

async function printRegistration(registration) {

    try {

        await downloadRegistrationPDF(registration);

    }

    catch (error) {

        console.error(error);

        alert("PDF oluşturulamadı.");

    }

}
import {
    batchDelete,
    batchCheckIn,
    batchCheckOut
} from "./firebase.js";

let selectedIds = new Set();

function updateSelectedCount() {

    const element = document.getElementById("selectedCount");

    if (element) {

        element.textContent = selectedIds.size;

    }

}

function toggleSelection(id, checked) {

    if (checked) {

        selectedIds.add(id);

    } else {

        selectedIds.delete(id);

    }

    updateSelectedCount();

}

function clearSelection() {

    selectedIds.clear();

    document.querySelectorAll(".row-checkbox").forEach(box => {

        box.checked = false;

    });

    updateSelectedCount();

}

function selectAllRows(checked) {

    document.querySelectorAll(".row-checkbox").forEach(box => {

        box.checked = checked;

        toggleSelection(

            box.dataset.id,

            checked

        );

    });

}

document
.getElementById("selectAll")
?.addEventListener("change", function () {

    clearSelection();

    selectAllRows(this.checked);

});

function attachCheckboxEvents() {

    document.querySelectorAll(".row-checkbox").forEach(box => {

        box.addEventListener("change", function () {

            toggleSelection(

                this.dataset.id,

                this.checked

            );

        });

    });

}

async function deleteSelected() {

    if (selectedIds.size === 0) {

        alert("Kayıt seçiniz.");

        return;

    }

    if (!confirm("Seçilen kayıtlar silinsin mi?")) {

        return;

    }

    try {

        await batchDelete([...selectedIds]);

        clearSelection();

    }

    catch (error) {

        console.error(error);

        alert("Toplu silme başarısız.");

    }

}

async function checkInSelected() {

    if (!selectedIds.size) return;

    try {

        await batchCheckIn([...selectedIds]);

        clearSelection();

    }

    catch (error) {

        console.error(error);

        alert("Toplu giriş başarısız.");

    }

}

async function checkOutSelected() {

    if (!selectedIds.size) return;

    try {

        await batchCheckOut([...selectedIds]);

        clearSelection();

    }

    catch (error) {

        console.error(error);

        alert("Toplu çıkış başarısız.");

    }

}

document
.getElementById("deleteSelected")
?.addEventListener(

    "click",

    deleteSelected

);

document
.getElementById("checkInSelected")
?.addEventListener(

    "click",

    checkInSelected

);

document
.getElementById("checkOutSelected")
?.addEventListener(

    "click",

    checkOutSelected

);
import {
    exportData,
    importData
} from "./firebase.js";

async function exportJson() {

    try {

        const json = await exportData();

        const blob = new Blob(
            [json],
            {
                type: "application/json"
            }
        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download = `tugva-yaz-okulu-${new Date().toISOString().slice(0,10)}.json`;

        a.click();

        URL.revokeObjectURL(url);

    }

    catch (error) {

        console.error(error);

        alert("Yedek oluşturulamadı.");

    }

}

async function importJson(file) {

    try {

        const text = await file.text();

        const data = JSON.parse(text);

        await importData(data);

        alert("Yedek başarıyla geri yüklendi.");

    }

    catch (error) {

        console.error(error);

        alert("Yedek yüklenemedi.");

    }

}

function exportCSV() {

    const rows = [

        [
            "Kayıt No",
            "Ad Soyad",
            "TC",
            "Telefon",
            "Okul",
            "Sınıf",
            "Veli",
            "Veli Telefonu",
            "Durum"
        ]

    ];

    filteredRegistrations.forEach(item => {

        rows.push([

            item.registerNumber,

            item.name,

            item.tc,

            item.phone,

            item.school,

            item.class,

            item.parent,

            item.parentPhone,

            item.checkedIn ? "Giriş Yaptı" : "Bekliyor"

        ]);

    });

    const csv = rows
        .map(row => row.join(";"))
        .join("\n");

    const blob = new Blob(
        [csv],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "kayitlar.csv";

    link.click();

    URL.revokeObjectURL(url);

}

document
.getElementById("exportJson")
?.addEventListener(
    "click",
    exportJson
);

document
.getElementById("exportCsv")
?.addEventListener(
    "click",
    exportCSV
);

document
.getElementById("importJson")
?.addEventListener(
    "change",
    event => {

        const file = event.target.files[0];

        if (file) {

            importJson(file);

        }

    }
);
let currentPage = 1;

let pageSize = 20;

let currentSortField = "registerNumber";

let currentSortDirection = "asc";

function sortRegistrations(list) {

    return [...list].sort((a, b) => {

        let valueA = a[currentSortField] ?? "";

        let valueB = b[currentSortField] ?? "";

        if (typeof valueA === "string") {

            valueA = valueA.toLocaleLowerCase("tr-TR");

            valueB = valueB.toLocaleLowerCase("tr-TR");

        }

        if (valueA < valueB) {

            return currentSortDirection === "asc" ? -1 : 1;

        }

        if (valueA > valueB) {

            return currentSortDirection === "asc" ? 1 : -1;

        }

        return 0;

    });

}

function paginate(list) {

    const start = (currentPage - 1) * pageSize;

    return list.slice(

        start,

        start + pageSize

    );

}

function refreshTable() {

    const sorted = sortRegistrations(

        filteredRegistrations

    );

    renderTable(

        paginate(sorted)

    );

    renderPagination(

        sorted.length

    );

}

function changeSort(field) {

    if (currentSortField === field) {

        currentSortDirection =

            currentSortDirection === "asc"

                ? "desc"

                : "asc";

    } else {

        currentSortField = field;

        currentSortDirection = "asc";

    }

    refreshTable();

}

document.querySelectorAll("[data-sort]")

.forEach(header => {

    header.addEventListener("click", () => {

        changeSort(

            header.dataset.sort

        );

    });

});

document

.getElementById("pageSize")

?.addEventListener("change", event => {

    pageSize = Number(

        event.target.value

    );

    currentPage = 1;

    refreshTable();

});

function renderPagination(totalRows) {

    const container = document.getElementById(

        "pagination"

    );

    if (!container) return;

    container.innerHTML = "";

    const totalPages = Math.max(

        1,

        Math.ceil(totalRows / pageSize)

    );

    for (

        let page = 1;

        page <= totalPages;

        page++

    ) {

        const button = document.createElement(

            "button"

        );

        button.textContent = page;

        button.className =

            page === currentPage

                ? "active"

                : "";

        button.onclick = () => {

            currentPage = page;

            refreshTable();

        };

        container.appendChild(button);

    }

}
function updateDashboard() {

    updateStatistics();

    renderRecentRegistrations();

}

function renderRecentRegistrations(limit = 5) {

    const container = document.getElementById("recentRegistrations");

    if (!container) return;

    container.innerHTML = "";

    registrations
        .slice()
        .sort((a, b) => {

            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;

            return dateB - dateA;

        })
        .slice(0, limit)
        .forEach(item => {

            const div = document.createElement("div");

            div.className = "recent-item";

            div.innerHTML = `
                <strong>${item.name}</strong>
                <div>${item.school} / ${item.class}</div>
                <small>${item.registerNumber}</small>
            `;

            container.appendChild(div);

        });

}

function refreshDashboard() {

    applyFilters();

    updateDashboard();

}

document
.getElementById("refreshButton")
?.addEventListener(
    "click",
    refreshDashboard
);

document.addEventListener("keydown", event => {

    if (event.ctrlKey && event.key.toLowerCase() === "f") {

        event.preventDefault();

        searchInput?.focus();

    }

    if (event.ctrlKey && event.key.toLowerCase() === "r") {

        event.preventDefault();

        refreshDashboard();

    }

    if (event.key === "Escape") {

        closeDetailModal();

        closeEditModal();

    }

});

window.addEventListener("focus", () => {

    refreshDashboard();

});

setInterval(() => {

    updateStatistics();

}, 30000);
function attachGlobalEvents() {

    document
        .querySelectorAll("[data-close-modal]")
        .forEach(button => {

            button.addEventListener("click", () => {

                closeDetailModal();

                closeEditModal();

            });

        });

    detailModal?.addEventListener("click", event => {

        if (event.target === detailModal) {

            closeDetailModal();

        }

    });

    editModal?.addEventListener("click", event => {

        if (event.target === editModal) {

            closeEditModal();

        }

    });

    document
        .getElementById("saveRegistration")
        ?.addEventListener(
            "click",
            saveRegistration
        );

}

async function init() {

    try {

        attachGlobalEvents();

        authListener(user => {

            if (user) {

                showAdmin();

                loadRegistrations();

            } else {

                showLogin();

            }

        });

        console.log(

            "Admin Paneli Hazır."

        );

    }

    catch (error) {

        console.error(error);

        alert(

            "Admin paneli başlatılamadı."

        );

    }

}

window.addEventListener(

    "DOMContentLoaded",

    init

);

window.addEventListener(

    "error",

    event => {

        console.error(

            "Beklenmeyen Hata:",

            event.error

        );

    }

);

window.addEventListener(

    "unhandledrejection",

    event => {

        console.error(

            "Promise Hatası:",

            event.reason

        );

    }

);

export {

    init,

    refreshDashboard,

    loadRegistrations,

    renderTable,

    applyFilters,

    openDetailModal,

    openEditModal,

    saveRegistration,

    deleteSelected,

    checkInSelected,

    checkOutSelected

};