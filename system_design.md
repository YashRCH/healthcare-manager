# Healthcare Appointment & Follow-up Manager - System Design

## 1. Double-Booking Prevention & Slot Hold Mechanism
To guarantee robust prevention of double-bookings in a concurrent environment, our system utilizes **Firestore Transactions**. When a patient attempts to book a specific time slot for a doctor, the client invokes a secure Firebase Cloud Function (`bookAppointment`). 
Within this function, a Firestore transaction reads the `appointments` collection to check if an appointment document already exists for the given `doctorId` and `slotTime` with an active status (`'booked'`). 
- If an overlapping appointment is found, the transaction immediately aborts, throwing an error to the user. 
- If the slot is free, the transaction writes the new appointment document and commits.
Because Firestore transactions provide strict ACID properties and optimistic concurrency control, if two patients attempt to book the exact same slot simultaneously, only the first transaction will succeed; the second will retry, detect the newly written appointment, and subsequently fail, entirely eliminating the risk of double-booking.

We do not use temporary "slot holds" (e.g., locking a slot while a user types symptoms) as it can lead to deadlocks or abandoned locks. Instead, patients fill out their symptoms first, and the booking attempt is executed as an atomic operation upon final confirmation.

## 2. Doctor Leave Conflict Handling
Doctors and administrators require the ability to block out days for leave. However, existing bookings on those dates must be handled gracefully. We implement an event-driven architecture using **Firestore Document Triggers**.
When an admin marks a doctor on leave in the Admin Portal, a new document is created in the `leaves` collection containing the `doctorId` and the `date`.
This insertion triggers the `handleDoctorLeave` Firebase Cloud Function (`onDocumentCreated`). 
The function executes the following steps:
1. It queries the `appointments` collection for any document matching the `doctorId` and `slotTime` (falling within the leave date) where the status is `'booked'`.
2. It initiates a Firestore WriteBatch.
3. For each conflicting appointment, it updates the status to `'cancelled'`.
4. It simultaneously dispatches an asynchronous email payload to a designated notification queue, prompting the patient to reschedule.
This server-side trigger ensures that conflicts are resolved immediately and automatically, preventing the patient from showing up to a canceled appointment.

## 3. Notification Failure Handling
Relying on external APIs (like SendGrid or Nodemailer SMTP) for critical notifications introduces the risk of transient network failures or rate limits. If an email fails during the booking or cancellation process, it could break the entire transaction, which is an anti-pattern.
To handle this gracefully:
- **Asynchronous Queuing:** All email notifications are pushed to a `notifications` or `mail` Firestore collection rather than being sent synchronously during the booking HTTP request.
- **Background Dispatcher:** A separate Cloud Function listens for new documents in this collection and attempts to send the email via SendGrid. 
- **Dead-Letter Queue & Retries:** If the SendGrid API call fails, the function catches the error, increments a `retryCount` field on the document, and leaves it in a `'failed'` state. A scheduled CRON job (using Firebase Cloud Scheduler) runs periodically to fetch all `'failed'` notifications and re-attempt delivery with exponential backoff.
This decouples the user experience from the email provider's uptime, ensuring the system never breaks due to notification failures.
