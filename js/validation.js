// validation.js
// Profesyonel Sürüm
// Parça 1/8

export function isEmpty(value){

return value
===undefined||

value===null||

value.toString().trim()==="";

}

export function validateName(name){

if(isEmpty(name)){

return "Ad Soyad boş bırakılamaz.";

}

const regex=

/^[a-zA-ZÇçĞğİıÖöŞşÜü\s]{3,60}$/;

if(!regex.test(name)){

return "Geçerli bir ad soyad giriniz.";

}

return "";

}
// validation.js
// Parça 2/8

export function validateTC(tc){

if(!/^[0-9]{11}$/.test(tc))

return "TC Kimlik No 11 haneli olmalıdır.";

const digits=

tc.split("").map(Number);

if(digits[0]===0)

return "TC Kimlik No geçersiz.";

let odd=0;

let even=0;

for(let i=0;i<9;i++){

if(i%2===0){

odd+=digits[i];

}else{

even+=digits[i];

}

}

const digit10=

((odd*7)-even)%10;

if(digit10!==digits[9])

return "TC Kimlik No geçersiz.";

const total=

digits.slice(0,10)

.reduce((a,b)=>a+b,0);

if(total%10!==digits[10])

return "TC Kimlik No geçersiz.";

return "";

}
// validation.js
// Parça 3/8

export function validatePhone(phone){

if(!/^0\d{10}$/.test(phone)){

return "Telefon numarası hatalı.";

}

return "";

}

export function validateEmail(email){

if(email==="")

return "";

const regex=

/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(!regex.test(email))

return "E-Posta adresi hatalı.";

return "";

}
// validation.js
// Parça 4/8

export function validateBirth(date){

if(date===""){

return "Doğum tarihi seçiniz.";

}

const birth=

new Date(date);

const today=

new Date();

let age=

today.getFullYear()

-

birth.getFullYear();

const m=

today.getMonth()

-

birth.getMonth();

if(m<0||

(m===0&&today.getDate()<birth.getDate()))

age--;

if(age<6||age>18)

return "Yaş aralığı uygun değil.";

return "";

}
// validation.js
// Parça 5/8

export function validateRequired(form){

const fields=[

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

for(const field of fields){

if(isEmpty(form[field])){

return "Lütfen tüm zorunlu alanları doldurunuz.";

}

}

return "";

}
// validation.js
// Parça 6/8

export function validateCheckboxes(){

const kvkk=

document.getElementById("kvkk");

const parent=

document.getElementById("parent");

if(!kvkk.checked)

return "KVKK onayı gereklidir.";

if(!parent.checked)

return "Veli onayı gereklidir.";

return "";

}
// validation.js
// Parça 7/8

export function validateForm(data){

    let error = "";

    if(isEmpty(data.name)) return "Ad Soyad boş bırakılamaz.";
    if(isEmpty(data.tc)) return "TC Kimlik boş bırakılamaz.";
    if(isEmpty(data.phone)) return "Telefon boş bırakılamaz.";
    if(isEmpty(data.birth)) return "Doğum tarihi seçiniz.";
    if(isEmpty(data.gender)) return "Cinsiyet seçiniz.";
    if(isEmpty(data.school)) return "Okul boş bırakılamaz.";
    if(isEmpty(data.class)) return "Sınıf boş bırakılamaz.";
    if(isEmpty(data.parent)) return "Veli adı boş bırakılamaz.";
    if(isEmpty(data.parentPhone)) return "Veli telefonu boş bırakılamaz.";
    if(isEmpty(data.address)) return "Adres boş bırakılamaz.";

    error = validateName(data.name);
    if(error) return error;

    error = validateTC(data.tc);
    if(error) return error;

    error = validatePhone(data.phone);
    if(error) return error;

    error = validatePhone(data.parentPhone);
    if(error) return error;

    error = validateEmail(data.email);
    if(error) return error;

    error = validateBirth(data.birth);
    if(error) return error;

    error = validateCheckboxes();
    if(error) return error;

    return "";
}
// validation.js
// Parça 8/8 (Son)

export function onlyNumber(event){

const key=

event.key;

if(

!/[0-9]/.test(key)

&&

key!=="Backspace"

&&

key!=="Delete"

&&

key!=="ArrowLeft"

&&

key!=="ArrowRight"

&&

key!=="Tab"

){

event.preventDefault();

}

}