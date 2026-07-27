const NAME_REGEX =
/^[A-Za-zÇĞİIÖŞÜçğıöşü\s'-]{3,100}$/;

const PHONE_REGEX =
/^05\d{9}$/;

const TC_REGEX =
/^\d{11}$/;

const EMAIL_REGEX =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function cleanText(text = "") {

    return String(text)
        .trim()
        .replace(/\s+/g, " ");

}

export function cleanPhone(phone = "") {

    return String(phone)
        .replace(/\D/g, "")
        .replace(/^90/, "0");

}

export function cleanTc(tc = "") {

    return String(tc)
        .replace(/\D/g, "");

}

export function isEmpty(value) {

    return cleanText(value) === "";

}

export function validateName(name) {

    name = cleanText(name);

    if (isEmpty(name)) {

        return "Ad Soyad zorunludur.";

    }

    if (!NAME_REGEX.test(name)) {

        return "Geçerli bir ad soyad giriniz.";

    }

    return "";

}

export function validatePhone(phone) {

    phone = cleanPhone(phone);

    if (!PHONE_REGEX.test(phone)) {

        return "Telefon numarası hatalı.";

    }

    return "";

}

export function validateEmail(email) {

    email = cleanText(email);

    if (!email) return "";

    if (!EMAIL_REGEX.test(email)) {

        return "E-posta adresi hatalı.";

    }

    return "";

}
const MIN_AGE = 7;
const MAX_AGE = 90;

export function validateTc(tc) {

    tc = cleanTc(tc);

    if (!TC_REGEX.test(tc)) {
        return "T.C. Kimlik Numarası 11 haneli olmalıdır.";
    }

    if (tc[0] === "0") {
        return "T.C. Kimlik Numarası 0 ile başlayamaz.";
    }

    const digits = tc.split("").map(Number);

    const odd =
        digits[0] +
        digits[2] +
        digits[4] +
        digits[6] +
        digits[8];

    const even =
        digits[1] +
        digits[3] +
        digits[5] +
        digits[7];

    const digit10 = ((odd * 7) - even) % 10;

    if (digit10 !== digits[9]) {
        return "Geçersiz T.C. Kimlik Numarası.";
    }

    const total =
        digits.slice(0, 10).reduce((a, b) => a + b, 0);

    if (total % 10 !== digits[10]) {
        return "Geçersiz T.C. Kimlik Numarası.";
    }

    return "";

}

export function calculateAge(birth) {

    const today = new Date();

    const date = new Date(birth);

    let age = today.getFullYear() - date.getFullYear();

    const month = today.getMonth() - date.getMonth();

    if (
        month < 0 ||
        (month === 0 && today.getDate() < date.getDate())
    ) {
        age--;
    }

    return age;

}

export function validateBirth(birth) {

    if (!birth) {
        return "Doğum tarihi zorunludur.";
    }

    const date = new Date(birth);

    if (Number.isNaN(date.getTime())) {
        return "Geçersiz doğum tarihi.";
    }

    const age = calculateAge(birth);

    if (age < MIN_AGE || age > MAX_AGE) {
        return `Yaş ${MIN_AGE}-${MAX_AGE} arasında olmalıdır.`;
    }

    return "";

}

export function validateGender(gender) {

    const allowed = [
        "Erkek",
        "Kız"
    ];

    if (!allowed.includes(gender)) {
        return "Cinsiyet seçiniz.";
    }

    return "";

}
export function validateSchool(school) {

    school = cleanText(school);

    if (!school) {
        return "Okul bilgisi zorunludur.";
    }

    if (school.length < 2) {
        return "Geçerli bir okul adı giriniz.";
    }

    return "";

}

export function validateClass(className) {

    className = cleanText(className);

    if (!className) {
        return "Sınıf bilgisi zorunludur.";
    }

    if (className.length > 20) {
        return "Sınıf bilgisi çok uzun.";
    }

    return "";

}

export function validateParent(parent) {

    parent = cleanText(parent);

    if (!parent) {
        return "Veli adı zorunludur.";
    }

    if (!NAME_REGEX.test(parent)) {
        return "Geçerli bir veli adı giriniz.";
    }

    return "";

}

export function validateParentPhone(phone) {

    phone = cleanPhone(phone);

    if (!PHONE_REGEX.test(phone)) {
        return "Veli telefon numarası hatalı.";
    }

    return "";

}

export function validateAddress(address) {

    address = cleanText(address);

    if (!address) {
        return "Adres zorunludur.";
    }

    if (address.length < 10) {
        return "Adres çok kısa.";
    }

    if (address.length > 500) {
        return "Adres çok uzun.";
    }

    return "";

}

export function validateNote(note) {

    note = cleanText(note);

    if (note.length > 500) {
        return "Not en fazla 500 karakter olabilir.";
    }

    return "";

}
export function validateRegistration(data) {

    const errors = {};

    const nameError = validateName(data.name);
    if (nameError) errors.name = nameError;

    const tcError = validateTc(data.tc);
    if (tcError) errors.tc = tcError;

    const phoneError = validatePhone(data.phone);
    if (phoneError) errors.phone = phoneError;

    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;

    const birthError = validateBirth(data.birth);
    if (birthError) errors.birth = birthError;

    const genderError = validateGender(data.gender);
    if (genderError) errors.gender = genderError;

    const schoolError = validateSchool(data.school);
    if (schoolError) errors.school = schoolError;

    const classError = validateClass(data.class);
    if (classError) errors.class = classError;

    const parentError = validateParent(data.parent);
    if (parentError) errors.parent = parentError;

    const parentPhoneError = validateParentPhone(data.parentPhone);
    if (parentPhoneError) errors.parentPhone = parentPhoneError;

    const addressError = validateAddress(data.address);
    if (addressError) errors.address = addressError;

    const noteError = validateNote(data.note);
    if (noteError) errors.note = noteError;

    return {

        valid: Object.keys(errors).length === 0,

        errors

    };

}

export function hasErrors(result) {

    return !result.valid;

}

export function firstError(result) {

    const key = Object.keys(result.errors)[0];

    return key ? result.errors[key] : "";

}

export function clearErrors() {

    document.querySelectorAll(".input-error").forEach(el => {

        el.classList.remove("input-error");

    });

    document.querySelectorAll(".error-message").forEach(el => {

        el.textContent = "";

    });

}

export function showErrors(result) {

    clearErrors();

    Object.entries(result.errors).forEach(([field, message]) => {

        const input = document.querySelector(`[name="${field}"]`);

        if (input) {

            input.classList.add("input-error");

        }

        const error = document.getElementById(`${field}Error`);

        if (error) {

            error.textContent = message;

        }

    });

}
export function capitalizeName(text = "") {

    return cleanText(text)
        .toLocaleLowerCase("tr-TR")
        .split(" ")
        .map(word => {

            if (!word) return "";

            return word[0].toLocaleUpperCase("tr-TR") + word.slice(1);

        })
        .join(" ");

}

export function normalizeRegistration(data) {

    return {

        registerNumber: data.registerNumber || "",

        name: capitalizeName(data.name),

        tc: cleanTc(data.tc),

        phone: cleanPhone(data.phone),

        email: cleanText(data.email).toLowerCase(),

        birth: data.birth,

        gender: data.gender,

        school: capitalizeName(data.school),

        class: cleanText(data.class).toUpperCase(),

        parent: capitalizeName(data.parent),

        parentPhone: cleanPhone(data.parentPhone),

        address: cleanText(data.address),

        note: cleanText(data.note),

        seat: data.seat || "",

        checkedIn: Boolean(data.checkedIn)

    };

}

export function prepareRegistrationData(data) {

    return normalizeRegistration(data);

}

export function validateAndPrepare(data) {

    const result = validateRegistration(data);

    if (!result.valid) {

        return {

            valid: false,

            errors: result.errors,

            data: null

        };

    }

    return {

        valid: true,

        errors: {},

        data: prepareRegistrationData(data)

    };

}

export default {

    validateRegistration,

    validateAndPrepare,

    prepareRegistrationData,

    normalizeRegistration,

    validateName,

    validateTc,

    validatePhone,

    validateEmail,

    validateBirth,

    validateGender,

    validateSchool,

    validateClass,

    validateParent,

    validateParentPhone,

    validateAddress,

    validateNote

};