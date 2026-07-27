// firebaseConfig.example.js
// Parça 1/2

export const firebaseConfig={

apiKey:

"API_KEY",

authDomain:

"PROJECT.firebaseapp.com",

projectId:

"PROJECT",

storageBucket:

"PROJECT.appspot.com",

messagingSenderId:

"000000000",

appId:

"1:000000000:web:xxxxxxxx"

};
// firebaseConfig.example.js
// Parça 2/2

/*

firebase.js içinde

const firebaseConfig

yerine

şunu kullan:

import{

firebaseConfig

}

from "./firebaseConfig.js";

*/