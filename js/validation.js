// ===============================
// Empty Check
// ===============================

export function isEmpty(value) {

    return value === undefined ||
           value === null ||
           value.toString().trim() === "";

}


// ===============================
// Name Validation
// ===============================

export function validateName(name) {

    if (isEmpty(name))
        return "Ad Soyad boş bırakılamaz.";

    if (name.trim().length < 3)
        return "Ad Soyad en az 3 karakter olmalıdır.";

    return "";

}


// ===============================
// TC Validation
// ===============================

export function validateTC(tc) {

    if (!/^[0-9]{11}$/.test(tc))
        return "TC Kimlik Numarası 11 haneli olmalıdır.";

    if (tc[0] === "0")
        return "TC Kimlik Numarası 0 ile başlayamaz.";

    let odd = 0;
    let even = 0;

    for (let i = 0; i < 9; i++) {

        if (i % 2 === 0)
            odd += Number(tc[i]);
        else
            even += Number(tc[i]);

    }

    const digit10 =
        ((odd * 7) - even) % 10;

    if (digit10 !== Number(tc[9]))
        return "Geçersiz TC Kimlik Numarası.";

    let total = 0;

    for (let i = 0; i < 10; i++)
        total += Number(tc[i]);

    if ((total % 10) !== Number(tc[10]))
        return "Geçersiz TC Kimlik Numarası.";

    return "";

}


// ===============================
// Phone Validation
// ===============================

export function validatePhone(phone) {

    if (!/^0[0-9]{10}$/.test(phone))
        return "Telefon numarası hatalı.";

    return "";

}


// ===============================
// Email Validation
// ===============================

export function validateEmail(email) {

    if (email.trim() === "")
        return "";

    const regex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email))
        return "Geçersiz e-posta adresi.";

    return "";

}
// ===============================
// Birth Date Validation
// ===============================

export function validateBirth(date) {

    if (!date)
        return "Doğum tarihi seçiniz.";

    const birth =
        new Date(date);

    const today =
        new Date();

    let age =
        today.getFullYear() -
        birth.getFullYear();

    const month =
        today.getMonth() -
        birth.getMonth();

    if (
        month < 0 ||
        (month === 0 &&
            today.getDate() < birth.getDate())
    ) {

        age--;

    }

    if (age < 6)
        return "Katılımcı çok küçük.";

    if (age > 18)
        return "Yaş sınırı aşıldı.";

    return "";

}


// ===============================
// Required Validation
// ===============================

export function validateRequired(data) {

    const fields = [

        "adSoyad",

        "tc",

        "telefon",

        "dogumTarihi",

        "cinsiyet",

        "okul",

        "sinif",

        "veliAdi",

        "veliTelefon",

        "adres"

    ];

    for (const field of fields) {

        if (isEmpty(data[field])) {

            return "Lütfen tüm zorunlu alanları doldurunuz.";

        }

    }

    return "";

}


// ===============================
// Form Validation
// ===============================

export function validateForm(data) {

    let error;

    error = validateRequired(data);
    if (error) return error;

    error = validateName(data.adSoyad);
    if (error) return error;

    error = validateTC(data.tc);
    if (error) return error;

    error = validatePhone(data.telefon);
    if (error) return error;

    error = validatePhone(data.veliTelefon);
    if (error) return error;

    error = validateEmail(data.email || "");
    if (error) return error;

    error = validateBirth(data.dogumTarihi);
    if (error) return error;

    return "";

}