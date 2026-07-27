const NAME_REGEX =
    /^[a-zA-ZçğıöşüÇĞİÖŞÜ\s]{3,100}$/;

const EMAIL_REGEX =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_REGEX =
    /^5\d{9}$/;

function cleanText(value = "") {

    return String(value)

        .replace(/\s+/g, " ")

        .trim();

}

function onlyDigits(value = "") {

    return String(value)

        .replace(/\D/g, "");

}

function normalizePhone(phone) {

    let value = onlyDigits(phone);

    if (value.startsWith("90")) {

        value = value.substring(2);

    }

    return value.substring(0, 10);

}

function normalizeTC(tc) {

    return onlyDigits(tc)

        .substring(0, 11);

}
export function validateName(name) {

    name = cleanText(name);

    if (!NAME_REGEX.test(name)) {

        return "Ad Soyad geçersiz.";

    }

    return "";

}

export function validatePhone(phone) {

    phone = normalizePhone(phone);

    if (!PHONE_REGEX.test(phone)) {

        return "Telefon numarası geçersiz.";

    }

    return "";

}

export function validateEmail(email) {

    email = cleanText(email);

    if (email === "") {

        return "";

    }

    if (!EMAIL_REGEX.test(email)) {

        return "E-posta adresi geçersiz.";

    }

    return "";

}
export function validateTC(tc) {

    tc = normalizeTC(tc);

    if (tc.length !== 11) {

        return "T.C. Kimlik No 11 haneli olmalıdır.";

    }

    if (tc[0] === "0") {

        return "T.C. Kimlik No geçersiz.";

    }

    const digits = tc

        .split("")

        .map(Number);

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

    if (

        ((odd * 7 - even) % 10)

        !== digits[9]

    ) {

        return "T.C. Kimlik No geçersiz.";

    }

    const total =

        digits

        .slice(0, 10)

        .reduce(

            (a, b) => a + b,

            0

        );

    if (

        total % 10

        !== digits[10]

    ) {

        return "T.C. Kimlik No geçersiz.";

    }

    return "";

}
export function validateBirth(date) {

    if (!date) {

        return "Doğum tarihi zorunludur.";

    }

    const birth = new Date(date);

    const today = new Date();

    let age =

        today.getFullYear()

        - birth.getFullYear();

    if (

        today.getMonth() < birth.getMonth()

        ||

        (

            today.getMonth()

            === birth.getMonth()

            &&

            today.getDate()

            < birth.getDate()

        )

    ) {

        age--;

    }

    if (age < 5) {

        return "Yaş çok küçük.";

    }

    if (age > 25) {

        return "Yaş çok büyük.";

    }

    return "";

}
export function validateAndNormalize(data) {

    const errors = {};

    const normalized = {

        name: cleanText(data.name),

        tc: normalizeTC(data.tc),

        phone: normalizePhone(data.phone),

        email: cleanText(data.email),

        birth: data.birth,

        gender: cleanText(data.gender),

        school: cleanText(data.school),

        class: cleanText(data.class),

        parent: cleanText(data.parent),

        parentPhone: normalizePhone(

            data.parentPhone

        ),

        address: cleanText(data.address),

        note: cleanText(data.note)

    };

    let error;

    if (error = validateName(normalized.name))

        errors.name = error;

    if (error = validateTC(normalized.tc))

        errors.tc = error;

    if (error = validatePhone(normalized.phone))

        errors.phone = error;

    if (error = validateEmail(normalized.email))

        errors.email = error;

    if (error = validateBirth(normalized.birth))

        errors.birth = error;

    if (!normalized.gender)

        errors.gender = "Cinsiyet seçiniz.";

    if (!normalized.school)

        errors.school = "Okul zorunludur.";

    if (!normalized.class)

        errors.class = "Sınıf zorunludur.";

    if (!normalized.parent)

        errors.parent = "Veli adı zorunludur.";

    if (

        error = validatePhone(

            normalized.parentPhone

        )

    )

        errors.parentPhone = error;

    if (!normalized.address)

        errors.address = "Adres zorunludur.";

    return {

        valid:

            Object.keys(errors)

            .length === 0,

        errors,

        data: normalized

    };

}
