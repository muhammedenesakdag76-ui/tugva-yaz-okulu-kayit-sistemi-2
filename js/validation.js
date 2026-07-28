/* ===========================================
   validation.js
   TÜGVA Yaz Okulu Kayıt Sistemi
=========================================== */

const ONLY_NUMBER_REGEX = /\D/g;

export function cleanText(value = "") {

    return value.trim();

}

export function cleanPhone(value = "") {

    return value.replace(ONLY_NUMBER_REGEX, "");

}

export function calculateAge(birthDate) {

    if (!birthDate) return 0;

    const today = new Date();

    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();

    const month = today.getMonth() - birth.getMonth();

    if (
        month < 0 ||
        (month === 0 &&
            today.getDate() < birth.getDate())
    ) {

        age--;

    }

    return age;

}

export function isAdult(birthDate) {

    return calculateAge(birthDate) >= 18;

}

/* ===========================================
   TC KİMLİK DOĞRULAMA
=========================================== */

export function validateTC(tc) {

    tc = cleanPhone(tc);

    if (tc.length !== 11)
        return false;

    if (!/^[0-9]+$/.test(tc))
        return false;

    if (tc[0] === "0")
        return false;

    const digits =
        tc.split("").map(Number);

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

    if (digit10 !== digits[9])
        return false;

    const total =
        digits
            .slice(0, 10)
            .reduce((a, b) => a + b, 0);

    if (total % 10 !== digits[10])
        return false;

    return true;

}

/* ===========================================
   TELEFON
=========================================== */

export function validatePhone(phone) {

    phone = cleanPhone(phone);

    if (phone.length !== 11)
        return false;

    if (!phone.startsWith("05"))
        return false;

    return true;

}

/* ===========================================
   ZORUNLU ALAN
=========================================== */

export function validateRequired(value) {

    return cleanText(value) !== "";

}

/* ===========================================
   FORM DOĞRULAMA
=========================================== */

export function validateForm(data) {

    if (!validateRequired(data.name))
        throw new Error("Ad zorunludur.");

    if (!validateRequired(data.surname))
        throw new Error("Soyad zorunludur.");

    if (!validateTC(data.tc))
        throw new Error("Geçerli TC Kimlik No giriniz.");

    if (!validatePhone(data.phone))
        throw new Error("Telefon numarası hatalı.");

    if (!validateRequired(data.birthDate))
        throw new Error("Doğum tarihi zorunludur.");

    if (!validateRequired(data.gender))
        throw new Error("Cinsiyet seçiniz.");

    if (!validateRequired(data.district))
        throw new Error("İlçe zorunludur.");

    if (!validateRequired(data.neighborhood))
        throw new Error("Mahalle zorunludur.");

    if (!validateRequired(data.address))
        throw new Error("Adres zorunludur.");

    if (!isAdult(data.birthDate)) {

        if (!validateRequired(data.school))
            throw new Error("Okul zorunludur.");

        if (!validateRequired(data.className))
            throw new Error("Sınıf zorunludur.");

        if (!validateRequired(data.parentName))
            throw new Error("Veli adı zorunludur.");

        if (!validatePhone(data.parentPhone))
            throw new Error("Veli telefonu hatalı.");

    }

    return true;

}

/* ===========================================
   VERİYİ TEMİZLE
=========================================== */

export function prepareData(data) {

    const adult =
        isAdult(data.birthDate);

    return {

        name: cleanText(data.name),

        surname: cleanText(data.surname),

        tc: cleanPhone(data.tc),

        phone: cleanPhone(data.phone),

        birthDate: data.birthDate,

        age: calculateAge(data.birthDate),

        gender: data.gender,

        district: cleanText(data.district),

        neighborhood: cleanText(data.neighborhood),

        address: cleanText(data.address),

        school: adult
            ? ""
            : cleanText(data.school),

        className: adult
            ? ""
            : cleanText(data.className),

        parentName: adult
            ? ""
            : cleanText(data.parentName),

        parentPhone: adult
            ? ""
            : cleanPhone(data.parentPhone)

    };

}