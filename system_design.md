# System Design Document: Healthcare Appointment & Follow-up Manager

This document outlines the architectural approach and engineering decisions made to solve the core domain challenges of our healthcare management platform. It specifically covers double-booking prevention, doctor leave handling, slot hold mechanisms, and notification failure handling.

## 1. Problem-Solving Approach for Core Workflows

### Double-Booking Prevention (Transactional Smart-Booking)
In a high-concurrency booking environment (e.g., multiple patients attempting to book the last available 9:00 AM slot for a popular specialist), naive read-then-write operations risk race conditions. To guarantee absolute consistency and prevent double-booking, the booking process is engineered entirely on the backend utilizing strict **Firestore Transactions**.

When the `bookAppointment` Cloud Function is invoked, it locks the relevant document space and executes an atomic transaction. It queries the `appointments` collection for any document matching the requested `doctorId` and `slotTime` with a status of `booked`. If an intersecting record is found, the transaction aborts and returns an `already-exists` HttpsError to the client. If the time is clear, the transaction writes the new appointment document and commits. Because transactions retry automatically and execute atomically, this mechanism is mathematically guaranteed to prevent double-booking regardless of simultaneous concurrent requests.

### Doctor Leave Management (Event-Driven Conflict Handling)
Handling doctor leaves poses a distributed state problem: what happens to appointments that were booked prior to the doctor submitting a leave request?

Rather than requiring the doctor to manually cancel appointments or building a complex synchronous checking mechanism at the UI level, the system relies on an **Event-Driven Architecture** via Firestore background triggers (`onDocumentCreated`). 

When an administrator or doctor marks a leave day, a new document is inserted into the `leaves` collection. This insertion immediately fires the `handleDoctorLeave` Cloud Function in the background. The function crawls the `appointments` collection for any `booked` appointments matching the doctor's ID and the exact date. It uses a Firestore `WriteBatch` to atomically flip all intersecting appointments to `status: "cancelled"`. During this batch process, it queues targeted email cancellation notifications (via SendGrid) and executes a deletion payload to the Google Calendar API, ensuring the schedule is instantly sanitized without blocking the user interface.

### Slot Hold Mechanism
While the strict transaction layer prevents ultimate double-booking, it can lead to frustrating UX if a user spends 5 minutes filling out a detailed symptom questionnaire only to find the slot taken upon submission. 

To resolve this, the system can employ a soft "Slot Hold" mechanism. When a user selects a time, a temporary document is created in a `held_slots` collection with a strict TTL (Time-To-Live) of 5 minutes. The frontend queries both `appointments` and `held_slots` when rendering available times, masking the held slot from other users. If the booking transaction successfully completes, the `held_slot` is deleted. If the user abandons the form, Firestore TTL policies automatically purge the held slot document after 5 minutes, freeing the time back to the public pool.

## 2. Notification Reliability & Failure Handling

### Notification Failure Handling
Third-party notification layers (SendGrid for Email, Google API for Calendar) are prone to transient network failures, rate-limiting, and downtime. If an email fails to send during the `bookAppointment` transaction, it should not roll back the successful booking of the medical slot.

To achieve robust fault tolerance, notifications are detached from the primary synchronous path. When a booking occurs, the system writes the appointment to the database and returns a success response to the client immediately. A background Firestore `onDocumentCreated` trigger listens to the `appointments` collection. This background worker attempts the HTTP calls to SendGrid and Google Calendar. 

If a third-party API fails, the Cloud Function catches the error, logs it, and can leverage Google Cloud Pub/Sub with exponential backoff retries to guarantee eventual delivery of the email and calendar invite. This ensures the core database remains resilient even if the email provider suffers an outage.

## 3. LLM Prompt Quality and Failure Handling

The application leverages Google Gemini 1.5 Flash for critical clinical analysis tasks:
1. **Pre-visit Triage:** `Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Symptoms: <symptoms>`
2. **Post-visit Summarization:** `Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: <notes>`

**Failure Handling:** Large Language Models are inherently non-deterministic and prone to latency spikes or quota exhaustion. To protect the application flow, LLM calls are wrapped in aggressive `try/catch` blocks within the Cloud Functions. If the LLM times out or returns a malformed response, the function does not crash. Instead, it falls back to a deterministic string: `"Summary unavailable at this time. Please proceed with standard protocols."` This graceful degradation ensures the booking or post-visit note submission succeeds regardless of AI availability.

## 4. Database Schema Design (NoSQL)

The Firestore schema is denormalized and read-optimized for rapid dashboard rendering:

- `users` (Collection): Stores patient, doctor, and admin profiles. Includes sub-collections like `users/{id}/prescriptions` for fast medical record retrieval.
- `appointments` (Collection): The central source of truth for scheduling. Contains `doctorId`, `patientId`, `slotTime`, `status`, `symptoms`, `preVisitSummary`, and `postVisitNotes`.
- `leaves` (Collection): Stores doctor unavailability. Used primarily to trigger the background conflict resolution worker.
- `active_medications` (Collection): Dedicated collection tailored specifically for the cron job to rapidly query and send hourly medication reminders.

## 5. Third-Party Integrations

- **Google Calendar API:** Integrated via OAuth 2.0. Service credentials authenticate server-to-server calls to generate Calendar event payloads that invite both the patient and doctor emails simultaneously.
- **SendGrid API:** Handles transactional email delivery for booking confirmations, reminders, and cancellations, keeping all parties informed asynchronously.
