const NAME_REGEX =
/^[A-Za-zÇĞİIÖŞÜçğıöşü\s]{2,100}$/;

const PHONE_REGEX =
/^05\d{9}$/;

const EMAIL_REGEX =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function cleanText(value = "") {

    return value
        .trim()
        .replace(/\s+/g, " ");

}

export function onlyDigits(value = "") {

    return value.replace(/\D/g, "");

}

export function cleanPhone(value = "") {

    return onlyDigits(value).slice(0, 11);

}

export function cleanTc(value = "") {

    return onlyDigits(value).slice(0, 11);

}

export function cleanName(value = "") {

    return cleanText(value);

}

export function cleanEmail(value = "") {

    return value
        .trim()
        .toLowerCase();

}

export function cleanAddress(value = "") {

    return cleanText(value);

}

export function cleanNote(value = "") {

    return value.trim();

}
export function validateName(name) {

    name = cleanName(name);

    if (!name) {
        return "Ad Soyad zorunludur.";
    }

    if (!NAME_REGEX.test(name)) {
        return "Geçerli bir ad soyad giriniz.";
    }

    return "";

}

export function validateTc(tc) {

    tc = cleanTc(tc);

    if (tc.length !== 11) {
        return "TC Kimlik Numarası 11 haneli olmalıdır.";
    }

    if (tc[0] === "0") {
        return "TC Kimlik Numarası 0 ile başlayamaz.";
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

    const digit10 =
        ((odd * 7) - even) % 10;

    if (digit10 !== digits[9]) {
        return "TC Kimlik Numarası geçersiz.";
    }

    const total =
        digits
            .slice(0, 10)
            .reduce((a, b) => a + b, 0);

    if (total % 10 !== digits[10]) {
        return "TC Kimlik Numarası geçersiz.";
    }

    return "";

}

export function validatePhone(phone) {

    phone = cleanPhone(phone);

    if (!PHONE_REGEX.test(phone)) {
        return "Telefon numarası geçersiz.";
    }

    return "";

}

export function validateEmail(email) {

    email = cleanEmail(email);

    if (email && !EMAIL_REGEX.test(email)) {
        return "E-posta adresi geçersiz.";
    }

    return "";

}
export function calculateAge(birth) {

    if (!birth) {
        return -1;
    }

    const today = new Date();

    const birthDate = new Date(birth);

    let age = today.getFullYear() - birthDate.getFullYear();

    const month = today.getMonth() - birthDate.getMonth();

    if (
        month < 0 ||
        (month === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return age;

}

export function validateBirth(birth) {

    if (!birth) {
        return "Doğum tarihi zorunludur.";
    }

    const age = calculateAge(birth);

    if (age < 6) {
        return "Öğrenci yaşı çok küçük.";
    }

    if (age > 18) {
        return "Öğrenci yaşı uygun değil.";
    }

    return "";

}

export function validateGender(gender) {

    if (!gender) {
        return "Cinsiyet seçiniz.";
    }

    if (
        gender !== "Erkek" &&
        gender !== "Kız"
    ) {
        return "Geçersiz cinsiyet.";
    }

    return "";

}

export function validateSchool(school) {

    school = cleanText(school);

    if (!school) {
        return "Okul adı zorunludur.";
    }

    if (school.length < 2) {
        return "Okul adı çok kısa.";
    }

    if (school.length > 120) {
        return "Okul adı çok uzun.";
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
export function calculateAge(birthDate) {

    if (!birthDate) {
        return 0;
    }

    const today = new Date();

    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();

    const month = today.getMonth() - birth.getMonth();

    if (
        month < 0 ||
        (month === 0 && today.getDate() < birth.getDate())
    ) {
        age--;
    }

    return age;

}

export function validateBirth(birth) {

    if (!birth) {
        return "Doğum tarihi zorunludur.";
    }

    const age = calculateAge(birth);

    if (age < 6) {
        return "Yaş en az 6 olmalıdır.";
    }

    if (age > 18) {
        return "Yaş en fazla 18 olabilir.";
    }

    return "";

}

export function validateGender(gender) {

    if (!gender) {
        return "Cinsiyet seçiniz.";
    }

    const validValues = [

        "Erkek",

        "Kız"

    ];

    if (!validValues.includes(gender)) {
        return "Geçersiz cinsiyet.";
    }

    return "";

}

export function validateSchool(school) {

    school = cleanText(school);

    if (!school) {
        return "Okul bilgisi zorunludur.";
    }

    if (school.length < 2) {
        return "Okul adı çok kısa.";
    }

    if (school.length > 100) {
        return "Okul adı çok uzun.";
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

    parent = cleanName(parent);

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
        return "Veli telefon numarası geçersiz.";
    }

    return "";

}

export function validateAddress(address) {

    address = cleanAddress(address);

    if (!address) {
        return "Adres zorunludur.";
    }

    if (address.length < 10) {
        return "Adres çok kısa.";
    }

    if (address.length > 300) {
        return "Adres çok uzun.";
    }

    return "";

}

export function validateNote(note) {

    note = cleanNote(note);

    if (note.length > 500) {
        return "Not en fazla 500 karakter olabilir.";
    }

    return "";

}

export function validateSeat(seat) {

    if (seat === "" || seat === null || seat === undefined) {
        return "";
    }

    const number = Number(seat);

    if (!Number.isInteger(number)) {
        return "Koltuk numarası geçersiz.";
    }

    if (number < 1) {
        return "Koltuk numarası en az 1 olmalıdır.";
    }

    if (number > 9999) {
        return "Koltuk numarası çok büyük.";
    }

    return "";

}

export function validateRegisterNumber(registerNumber) {

    if (!registerNumber) {
        return "";
    }

    const regex = /^TYO\d{5}$/;

    if (!regex.test(registerNumber)) {
        return "Kayıt numarası geçersiz.";
    }

    return "";

}
export function validateRegistration(data) {

    const errors = {

        name: validateName(data.name),

        tc: validateTc(data.tc),

        phone: validatePhone(data.phone),

        email: validateEmail(data.email),

        birth: validateBirth(data.birth),

        gender: validateGender(data.gender),

        school: validateSchool(data.school),

        class: validateClass(data.class),

        parent: validateParent(data.parent),

        parentPhone: validateParentPhone(data.parentPhone),

        address: validateAddress(data.address),

        note: validateNote(data.note),

        seat: validateSeat(data.seat),

        registerNumber: validateRegisterNumber(data.registerNumber)

    };

    return errors;

}

export function hasValidationErrors(errors) {

    return Object.values(errors).some(error => error !== "");

}

export function normalizeRegistration(data) {

    return {

        id: data.id ?? "",

        registerNumber: data.registerNumber ?? "",

        name: cleanName(data.name),

        tc: cleanTc(data.tc),

        phone: cleanPhone(data.phone),

        email: cleanEmail(data.email),

        birth: data.birth ?? "",

        gender: data.gender ?? "",

        school: cleanText(data.school),

        class: cleanText(data.class),

        parent: cleanName(data.parent),

        parentPhone: cleanPhone(data.parentPhone),

        address: cleanAddress(data.address),

        note: cleanNote(data.note),

        seat: data.seat ? String(data.seat).trim() : "",

        checkedIn: Boolean(data.checkedIn),

        createdAt: data.createdAt ?? null

    };

}

export function validateAndNormalize(data) {

    const normalized = normalizeRegistration(data);

    const errors = validateRegistration(normalized);

    return {

        valid: !hasValidationErrors(errors),

        data: normalized,

        errors

    };

}

export default {

    cleanText,

    cleanName,

    cleanPhone,

    cleanTc,

    cleanEmail,

    cleanAddress,

    cleanNote,

    onlyDigits,

    calculateAge,

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

    validateNote,

    validateSeat,

    validateRegisterNumber,

    validateRegistration,

    normalizeRegistration,

    validateAndNormalize,

    hasValidationErrors

};