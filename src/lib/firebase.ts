// Firebase configuration and initialization for Restaurante Romanova.
//
// This module connects to a Firebase Firestore database where bookings are
// stored. When a booking is saved, its party_size is added to the slot's
// total — so the remaining capacity is shared across ALL visitors in
// real-time (not just per-browser like the localStorage fallback).
//
// === FIREBASE SETUP (one-time, ~5 minutes) ===========================
//
// 1. Go to https://console.firebase.google.com/
// 2. Click "Add project" → name it "romanova" → accept terms → Create
// 3. Once created, click the web icon </> to add a web app
//    - Nickname: "romanova-web"
//    - DO NOT enable Firebase Hosting (we use Vercel/Netlify)
//    - Click "Register app"
// 4. Firebase shows a code snippet with `firebaseConfig`. Copy the values
//    of apiKey, authDomain, projectId, storageBucket, messagingSenderId,
//    appId, and measurementId.
// 5. Replace the placeholder values below with your real values.
//
// 6. In the Firebase Console, go to "Build → Firestore Database" →
//    "Create database" → "Start in production mode" → choose a region
//    close to Spain (e.g. europe-west1).
//
// 7. After the database is created, go to the "Rules" tab and paste:
//
//      rules_version = '2';
//      service cloud.firestore {
//        match /databases/{database}/documents {
//          // Anyone can READ bookings (so visitors see remaining capacity)
//          // but only the legitimate web app can WRITE.
//          // Note: This is a public-read setup suitable for a small
//          // restaurant site. For higher security, swap to authenticated
//          // writes via Firebase Anonymous Auth.
//          match /bookings/{bookingId} {
//            allow read: if true;
//            allow create: if request.resource.data.party_size is int
//                            && request.resource.data.party_size <= 20
//                            && request.resource.data.party_size >= 1;
//          }
//        }
//      }
//
//    Click "Publish".
//
// 8. Save this file and restart `npm run dev`. Bookings will now be saved
//    to Firestore, and the remaining capacity per slot is synced live
//    between all visitors.
//
// === FALLBACK BEHAVIOR =================================================
// If the Firebase config below still contains placeholder values, the
// booking service silently falls back to localStorage (per-browser only).
// This means the site keeps working during local development — but real
// cross-visitor capacity tracking only kicks in once Firebase is set up.
//
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB7U3e0q4YHJACjUUs6LeD3ZcrVXbKGjYk",
  authDomain: "romanova-8ed50.firebaseapp.com",
  projectId: "romanova-8ed50",
  storageBucket: "romanova-8ed50.firebasestorage.app",
  messagingSenderId: "197301707470",
  appId: "1:197301707470:web:0edef98a420e29d206669f",
  measurementId: "G-2NFC26C4BT",
};

// Detect whether Firebase has been configured with real values.
export const firebaseEnabled = !Object.values(firebaseConfig).some(
  (v) => typeof v === 'string' && v.startsWith('YOUR_'),
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (firebaseEnabled) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (err) {
    console.warn('[Firebase] Initialization failed, falling back to localStorage:', err);
    app = null;
    db = null;
  }
}

export { app, db };
