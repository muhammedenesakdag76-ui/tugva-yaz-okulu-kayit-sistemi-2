const ONLY_DIGITS = /^\d+$/;

export function cleanText(value) {

    return String(value ?? "").trim();

}

export function cleanPhone(value) {

    return cleanText(value).replace(/\D/g, "");

}

export function calculateAge(birthDate) {

    if (!birthDate) return 0;

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

export function isAdult(birthDate) {

    return calculateAge(birthDate) >= 18;

}

export function validateTC(tc) {

    tc = cleanText(tc);

    if (!ONLY_DIGITS.test(tc)) return false;

    if (tc.length !== 11) return false;

    if (tc[0] === "0") return false;

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

    if (digit10 !== digits[9]) return false;

    const total =
        digits
            .slice(0, 10)
            .reduce((a, b) => a + b, 0);

    return total % 10 === digits[10];

}

export function validatePhone(phone) {

    phone = cleanPhone(phone);

    return /^05\d{9}$/.test(phone);

}

export function validateRequired(value) {

    return cleanText(value).length > 0;

}

export function validateForm(data) {

    if (!validateRequired(data.name))
        throw new Error("Ad zorunludur.");

    if (!validateRequired(data.surname))
        throw new Error("Soyad zorunludur.");

    if (!validateTC(data.tc))
        throw new Error("Geçerli TC Kimlik No giriniz.");

    if (!validatePhone(data.phone))
        throw new Error("Geçerli telefon giriniz.");

    if (!validateRequired(data.birthDate))
        throw new Error("Doğum tarihi seçiniz.");

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
            throw new Error("Geçerli veli telefonu giriniz.");

    }

    return true;

}

export function prepareData(formData) {

    return {

        name: cleanText(formData.name),

        surname: cleanText(formData.surname),

        tc: cleanText(formData.tc),

        phone: cleanPhone(formData.phone),

        birthDate: formData.birthDate,

        age: calculateAge(formData.birthDate),

        gender: formData.gender,

        district: cleanText(formData.district),

        neighborhood: cleanText(formData.neighborhood),

        address: cleanText(formData.address),

        school: cleanText(formData.school),

        className: cleanText(formData.className),

        parentName: cleanText(formData.parentName),

        parentPhone: cleanPhone(formData.parentPhone)

    };

}