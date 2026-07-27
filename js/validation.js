/* ==========================================
   AD SOYAD
========================================== */

export function validateName(name){

    name = name.trim();

    if(name.length < 3){

        return false;

    }

    return /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/.test(name);

}
/* ==========================================
   TC KİMLİK
========================================== */

export function validateTC(tc){

    tc = tc.replace(/\D/g,"");

    if(tc.length !== 11){

        return false;

    }

    if(tc[0] === "0"){

        return false;

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

    if(digit10 !== digits[9]){

        return false;

    }

    const total =
        digits.slice(0,10)
        .reduce((a,b)=>a+b,0);

    return total % 10 === digits[10];

}
/* ==========================================
   TELEFON
========================================== */

export function validatePhone(phone){

    phone = phone.replace(/\D/g,"");

    return /^5\d{9}$/.test(phone);

}
/* ==========================================
   EMAİL
========================================== */

export function validateEmail(email){

    if(!email){

        return true;

    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}
/* ==========================================
   ZORUNLU ALAN
========================================== */

export function required(value){

    return String(value ?? "").trim().length > 0;

}

/* ==========================================
   METİN TEMİZLEME
========================================== */

export function cleanText(text){

    return String(text ?? "")
        .trim()
        .replace(/\s+/g," ");

}
/* ==========================================
   TELEFON FORMATI
========================================== */

export function formatPhone(phone){

    phone = phone.replace(/\D/g,"");

    if(phone.length !== 10){

        return phone;

    }

    return phone.replace(
        /(\d{3})(\d{3})(\d{2})(\d{2})/,
        "$1 $2 $3 $4"
    );

}
/* ==========================================
   SADECE RAKAM
========================================== */

export function onlyDigits(value){

    return String(value ?? "").replace(/\D/g,"");

}
/* ==========================================
   FORM DOĞRULAMA
========================================== */

export function validateForm(data){

    if(!required(data.name))
        return {
            valid:false,
            message:"Ad Soyad zorunludur."
        };

    if(!validateName(data.name))
        return {
            valid:false,
            message:"Geçerli bir ad soyad giriniz."
        };

    if(!validateTC(data.tc))
        return {
            valid:false,
            message:"Geçersiz T.C. Kimlik Numarası."
        };

    if(!validatePhone(data.phone))
        return {
            valid:false,
            message:"Telefon numarası geçersiz."
        };

    if(data.email && !validateEmail(data.email))
        return {
            valid:false,
            message:"E-posta adresi geçersiz."
        };

    return {

        valid:true,

        message:""

    };

}