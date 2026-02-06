import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//     apiKey: "AIzaSyDgRcV8HN24S_D8ykm65YUFod3PZgzI9XQ",
//     authDomain: "digital-life-lessons-b2d6b.firebaseapp.com",
//     projectId: "digital-life-lessons-b2d6b",
//     storageBucket: "digital-life-lessons-b2d6b.firebasestorage.app",
//     messagingSenderId: "378088254966",
//     appId: "1:378088254966:web:e6227ec85b811ca7cfebd7"
// };

const firebaseConfig = {
    apiKey: import.meta.env.VITE_apiKey,
    authDomain: import.meta.env.VITE_authDomain,
    projectId: import.meta.env.VITE_projectId,
    storageBucket: import.meta.env.VITE_storageBucket,
    messagingSenderId: import.meta.env.VITE_messagingSenderId,
    appId: import.meta.env.VITE_appId,
};




const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;
