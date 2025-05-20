// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZgMqcxw4phWB21pC49hSUxATdd8BUHNo",
  authDomain: "study-buddy-c96a2.firebaseapp.com",
  projectId: "study-buddy-c96a2",
  storageBucket: "study-buddy-c96a2.firebasestorage.app",
  messagingSenderId: "889064039596",
  appId: "1:889064039596:web:f93375d048ebdc3238eb09",
  measurementId: "G-QPRCF3JSSP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);