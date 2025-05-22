// src/firebase/firebase.js

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth }  from 'firebase/auth'
import { getFirestore }  from 'firebase/firestore'
import { isSupported, getAnalytics } from 'firebase/analytics'  // optional

// 1️ Read config from env vars — never hardcode!
const firebaseConfig = {
  apiKey:               process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:           process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:     process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:                process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId:        process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // optional
}

// 2️ Initialize (or reuse) the Firebase app
const app = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig)

// 3️ Export Auth and Firestore instances
export const auth = getAuth(app)
export const db   = getFirestore(app)

// 4️ (Optional) Initialize Analytics only in the browser if supported
export let analytics = null
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) analytics = getAnalytics(app)
  })
}
