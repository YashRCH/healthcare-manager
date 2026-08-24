import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, addDoc, collection } from "firebase/firestore";
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

async function seedEHR() {
  console.log("Starting EHR database seed...");
  
  // 1. Create a dummy patient
  const patientEmail = "patient@ehr.com";
  let patientUid = "";
  try {
    const cred = await createUserWithEmailAndPassword(auth, patientEmail, 'password123');
    patientUid = cred.user.uid;
    console.log("Created test patient:", patientUid);
  } catch (e: any) {
    if (e.code === 'auth/email-already-in-use') {
      const cred = await signInWithEmailAndPassword(auth, patientEmail, 'password123');
      patientUid = cred.user.uid;
      console.log("Logged in existing test patient:", patientUid);
    } else {
      throw e;
    }
  }

  // 2. Set Patient Profile & Vitals
  await setDoc(doc(db, 'users', patientUid), {
    email: patientEmail,
    role: 'patient',
    name: 'John Doe',
    vitals: {
      bloodType: 'O+',
      height: "5'10\"",
      weight: '165 lbs',
      allergies: ['Penicillin', 'Peanuts'],
      chronicConditions: ['Mild Asthma']
    },
    updatedAt: new Date()
  }, { merge: true });
  console.log("Seeded patient profile & vitals.");

  // 3. Create active prescriptions
  const rxRef = collection(db, `users/${patientUid}/prescriptions`);
  await addDoc(rxRef, {
    medication: 'Albuterol Inhaler',
    dosage: '2 puffs',
    frequency: 'As needed for asthma',
    prescribedBy: 'Dr. General',
    status: 'active',
    date: new Date().toISOString()
  });
  await addDoc(rxRef, {
    medication: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    prescribedBy: 'Dr. Cardio',
    status: 'active',
    date: new Date().toISOString()
  });
  console.log("Seeded active prescriptions.");

  // 4. Create past appointment history
  const apptsRef = collection(db, 'appointments');
  await addDoc(apptsRef, {
    patientId: patientUid,
    doctorId: 'test_doctor_id_1',
    doctorName: 'Dr. Cardio',
    status: 'completed',
    slotTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    symptoms: 'Mild chest pain when running',
    preVisitSummary: 'Medium urgency. Chief complaint: Exertional chest pain. Questions for doctor: 1. Is it heart related? 2. Should I stop exercising? 3. Do I need an ECG?',
    postVisitNotes: 'Patient experiencing mild angina during heavy exertion. Prescribed rest and scheduled stress test.',
    postVisitSummary: 'Your chest pain during exercise was noted. Please take it easy this week and do not perform strenuous activities. We have scheduled a stress test for next week. If pain persists while resting, go to the ER immediately.'
  });
  console.log("Seeded past appointment history.");

  console.log("EHR Seeding complete! Exiting...");
  process.exit(0);
}

seedEHR().catch(console.error);
