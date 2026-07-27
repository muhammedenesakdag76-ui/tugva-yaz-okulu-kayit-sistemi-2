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