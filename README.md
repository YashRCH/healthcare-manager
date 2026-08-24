# Healthcare Appointment & Follow-up Manager

A comprehensive, role-based healthcare appointment platform built with React, Vite, TailwindCSS, and Firebase.

## Features

- **Role-Based Portals:** Secure routing and views for Patients, Doctors, and Admins.
- **Smart Booking Engine:** Firestore transactions guarantee zero double-bookings.
- **AI Integrations (Gemini API):** 
  - Generates Pre-Visit summaries from patient symptoms (urgency level, chief complaint, suggested questions).
  - Generates Post-Visit summaries from doctor's clinical notes (patient-friendly instructions and medication schedule).
- **Automated Conflict Resolution:** Serverless functions automatically cancel overlapping appointments and notify patients when a doctor marks a leave day.
- **Cron Jobs:** Scheduled background jobs dispatch medication reminders.
- **Premium UI:** Built with TailwindCSS for a modern, responsive, glassmorphic aesthetic.

---

## Setup Guide

### Prerequisites
- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)

### 1. Environment Variables
Create a `.env` file in the root directory based on `.env.example`:

```env
# .env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Frontend Setup
```bash
npm install
npm run dev
```

### 3. Backend (Firebase Functions) Setup
Navigate to the `functions` directory:
```bash
cd functions
npm install
```
Configure backend API keys (Gemini & SendGrid):
```bash
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set SENDGRID_API_KEY
```
Start the emulators or deploy:
```bash
npm run serve
# Or to deploy:
npm run deploy
```

---

## Database Schema (Firestore NoSQL)

1. **`users` (Collection)**
   - `uid` (Document ID)
   - `email` (String)
   - `role` (String: 'patient' | 'doctor' | 'admin')
   - `specialization` (String, doctors only)
   - `slotDuration` (Number, doctors only)

2. **`appointments` (Collection)**
   - `doctorId` (String, ref to users)
   - `patientId` (String, ref to users)
   - `slotTime` (ISO Date String)
   - `status` (String: 'booked' | 'completed' | 'cancelled')
   - `symptoms` (String)
   - `preVisitSummary` (String - AI Generated)
   - `postVisitNotes` (String)
   - `postVisitSummary` (String - AI Generated)

3. **`leaves` (Collection)**
   - `doctorId` (String)
   - `date` (YYYY-MM-DD String)
   - `createdAt` (Timestamp)

4. **`active_medications` (Collection)**
   - `patientId` (String)
   - `medication` (String)
   - `nextReminderTime` (Timestamp)
   - `frequencyHours` (Number)

---

## LLM Prompts (Gemini)

- **Pre-Visit Summary:** 
  > "Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Symptoms: {symptoms}"

- **Post-Visit Summary:** 
  > "Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: {notes}"

---

## Google Calendar Setup Steps
1. Navigate to Google Cloud Console.
2. Enable the **Google Calendar API**.
3. Configure the OAuth Consent Screen (add scopes for `.../auth/calendar.events`).
4. Create OAuth 2.0 Client IDs.
5. In the frontend, integrate Google Sign-In using the Firebase Auth Google Provider with added scopes.
6. Retrieve the OAuth `accessToken` upon login and use it to POST events to `https://www.googleapis.com/calendar/v3/calendars/primary/events`.
