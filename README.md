# 🏥 CareManager

![CareManager Banner](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

**Live Demo:** [https://unthinkable-7d043.web.app](https://unthinkable-7d043.web.app)

CareManager is an AI-native healthcare management platform designed to streamline clinical workflows, eliminate patient wait times, and drastically reduce administrative burden. Inspired by premium tech aesthetics, it bridges the gap between modern software engineering and healthcare operations.

## ✨ Features

- **🤖 AI-Native Pre-Visit Summaries:** Patients input symptoms naturally. Google Gemini AI processes the data to generate urgency levels, chief complaints, and suggested questions for the doctor before the patient even steps into the clinic.
- **📅 Transactional Smart-Booking:** Advanced scheduling prevents double-booking using Firestore transactions.
- **🔄 Autonomous Conflict Resolution:** If a doctor submits a leave request, all conflicting appointments are automatically canceled and patients are notified.
- **📝 Automated Post-Visit Summaries:** Doctors provide shorthand notes, and the AI translates them into patient-friendly follow-up instructions and medication schedules.
- **⏰ Smart Medication Reminders:** Automated background chron jobs (Firebase Scheduled Functions) process active prescriptions and simulate reminder emails to ensure medical adherence.
- **💎 Premium UX/UI:** A complete glassmorphic design system with a technical grid-background, mesh gradients, and robust responsive interfaces built on React + Tailwind CSS.

## 🏗️ Architecture

- **Frontend:** React, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend:** Firebase Cloud Functions (v2), Node.js
- **Database:** Firebase Firestore (NoSQL) with strict security rules
- **AI Integration:** Google Generative AI (Gemini 1.5 Flash)
- **Hosting:** Firebase Hosting

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YashRCH/healthcare-manager.git
   cd healthcare-manager
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd functions
   npm install
   cd ..
   ```

4. **Run the application locally:**
   ```bash
   npm run dev
   ```

## 🔐 Security

All sensitive credentials (like the `GEMINI_API_KEY`) are managed strictly via environment variables. There are no hardcoded keys inside this repository. `.env` files are added to `.gitignore`.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
