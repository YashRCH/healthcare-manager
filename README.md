# Healthcare Appointment & Follow-up Manager 🏥

![React](https://img.shields.io/badge/React-19.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg)
![Firebase](https://img.shields.io/badge/Firebase-v11-FFCA28.svg)
![Gemini AI](https://img.shields.io/badge/Google%20Gemini-AI-orange.svg)

A comprehensive, role-based healthcare appointment platform built with a modern React stack. This system solves real-world clinic challenges by preventing double-bookings, handling doctor leave conflicts gracefully, and integrating Google's Gemini AI to generate automated pre-visit symptom summaries and post-visit patient instructions.

---

## 🌟 Key Features

### 1. Role-Based Portals
- **Patient Dashboard:** Patients can search for doctors by specialization, fill out pre-visit symptom forms, and book available time slots securely.
- **Doctor Dashboard:** Doctors can view their daily appointments, review AI-generated symptom summaries *before* the patient walks in, and submit clinical notes after the visit.
- **Admin Dashboard:** Administrators manage the clinic roster, adjust doctor settings, and can mark doctors on leave (which triggers automated conflict resolution).

### 2. Smart Booking & Conflict Resolution
- **Zero Double-Bookings:** Utilizes **Firestore Transactions** in the backend. When two users attempt to book the same slot simultaneously, the transaction guarantees only one succeeds, eliminating race conditions.
- **Automated Leave Handling:** When an Admin marks a doctor on leave, a Firestore Cloud Function (`onDocumentCreated`) automatically triggers to cancel overlapping appointments and queues notifications for affected patients.

### 3. Google Gemini AI Integration
- **Pre-Visit Summaries:** As patients book a slot, Gemini parses their natural-language symptoms and categorizes the urgency level (Low/Medium/High), extracts the chief complaint, and generates 3 suggested questions for the doctor.
- **Post-Visit Summaries:** Doctors type rough clinical notes. Gemini converts these raw notes into a beautifully formatted, patient-friendly summary including a medication schedule and strict follow-up steps.

### 4. Background Cron Jobs
- **Medication Reminders:** A Firebase Cloud Scheduler pub/sub function runs hourly to scan the database for active prescriptions and dispatches email reminders dynamically.

---

## 🏗️ System Architecture & Tech Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS (v4), Lucide React (Icons), React Router v7.
- **Backend:** Firebase Cloud Functions v2 (Node.js/TypeScript).
- **Database:** Firebase Cloud Firestore (NoSQL) with real-time listeners.
- **Authentication:** Firebase Auth (Email/Password) with role-based custom claims.
- **AI & Integrations:** `@google/generative-ai` SDK, `@sendgrid/mail`.

---

## 🚀 Local Setup & Installation

### Prerequisites
1. [Node.js](https://nodejs.org/) (v20 or higher)
2. [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)

### 1. Clone the Repository
```bash
git clone https://github.com/YashRCH/healthcare-manager.git
cd healthcare-manager
```

### 2. Environment Variables
Create a `.env` file in the root directory. You can get these keys by creating a Web App in the [Firebase Console](https://console.firebase.google.com/).

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=1:your_app_id:web:your_web_id
```

*(Note: The frontend is configured to automatically connect to local Firebase Emulators if you are running on `localhost`).*

### 3. Start the Frontend
```bash
npm install
npm run dev
```
The app will be available at `http://localhost:5173`.

### 4. Start the Backend (Firebase Functions)
Open a **second terminal** and navigate to the functions directory:
```bash
cd functions
npm install
```

Set your API secrets (these will be stored securely in Firebase Secret Manager):
```bash
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set SENDGRID_API_KEY
```

Start the local backend emulators:
```bash
npm run serve
```

---

## 🗄️ Database Schema (Firestore)

### `users` Collection
Stores patient, doctor, and admin profiles.
- `email`: String
- `role`: `'patient' | 'doctor' | 'admin'`
- `createdAt`: Timestamp
- *(Doctors Only)* `specialization`: String
- *(Doctors Only)* `workingHours`: String
- *(Doctors Only)* `slotDuration`: Number

### `appointments` Collection
Stores all bookings and associated AI summaries.
- `patientId`: String (reference to `users`)
- `doctorId`: String (reference to `users`)
- `slotTime`: ISO String
- `status`: `'booked' | 'completed' | 'cancelled'`
- `symptoms`: String
- `preVisitSummary`: String *(Generated by Gemini)*
- `postVisitNotes`: String
- `postVisitSummary`: String *(Generated by Gemini)*

### `leaves` Collection
Tracks days off for doctors to handle conflicts.
- `doctorId`: String
- `date`: YYYY-MM-DD
- `createdAt`: Timestamp

---

## 🤖 LLM Prompts (Gemini)

The following strict prompts are utilized by the Cloud Functions to enforce structured outputs:

**1. Pre-Visit Analysis**
> *"Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Symptoms: {symptoms}"*

**2. Post-Visit Instructions**
> *"Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: {notes}"*

---

## 📅 Google Calendar Setup (Optional)
If you wish to enable OAuth 2.0 syncing:
1. Enable the **Google Calendar API** in the Google Cloud Console.
2. Configure the OAuth Consent Screen adding the scope `.../auth/calendar.events`.
3. In Firebase Auth, enable the **Google Sign-In Provider**.
4. Retrieve the `accessToken` upon client login to POST to `https://www.googleapis.com/calendar/v3/calendars/primary/events`.

---

## 📄 License
This project is licensed under the MIT License.
