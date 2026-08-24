import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const doctors = [
  { email: 'cardio@hospital.com', name: 'Dr. Cardio', spec: 'Cardiology', hours: '9-5', duration: 30 },
  { email: 'neuro@hospital.com', name: 'Dr. Neuro', spec: 'Neurology', hours: '10-6', duration: 45 },
  { email: 'general@hospital.com', name: 'Dr. General', spec: 'General Practice', hours: '8-4', duration: 15 }
];

async function seed() {
  console.log("Starting database seed...");
  for (const docInfo of doctors) {
    try {
      console.log(`Creating user for ${docInfo.name}...`);
      const cred = await createUserWithEmailAndPassword(auth, docInfo.email, 'password123');
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: docInfo.email,
        role: 'doctor',
        name: docInfo.name,
        specialization: docInfo.spec,
        workingHours: docInfo.hours,
        slotDuration: docInfo.duration,
        createdAt: new Date()
      });
      console.log(`Created doctor: ${docInfo.name} (${docInfo.email})`);
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        console.log(`Doctor ${docInfo.name} already exists. Skipping.`);
      } else {
        console.error("Error creating doctor:", e.message);
      }
    }
  }
  console.log("Seeding complete! Exiting...");
  process.exit(0);
}

seed();
