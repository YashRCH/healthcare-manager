import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as sgMail from "@sendgrid/mail";

admin.initializeApp();
const db = admin.firestore();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

// Initialize SendGrid (Optional / Stubbed)
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/**
 * 1. Book Appointment
 * 
 * Callable function to book an appointment.
 * Uses a Firestore Transaction to prevent double-booking for the same doctor at the same slotTime.
 */
export const bookAppointment = onCall(async (request) => {
  const data = request.data;
  const { doctorId, patientId, slotTime, symptoms } = data;

  if (!doctorId || !patientId || !slotTime) {
    throw new HttpsError("invalid-argument", "Missing required fields (doctorId, patientId, slotTime).");
  }

  const appointmentsRef = db.collection("appointments");

  try {
    await db.runTransaction(async (transaction) => {
      // Check for existing booking
      const query = appointmentsRef
        .where("doctorId", "==", doctorId)
        .where("slotTime", "==", slotTime)
        .where("status", "==", "booked");
        
      const querySnapshot = await transaction.get(query);

      if (!querySnapshot.empty) {
        throw new HttpsError(
          "already-exists",
          "An appointment for this doctor at this time is already booked."
        );
      }

      // Create new appointment
      const newAppointmentRef = appointmentsRef.doc();
      transaction.set(newAppointmentRef, {
        doctorId,
        patientId,
        slotTime,
        symptoms: symptoms || "",
        status: "booked",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return { success: true, message: "Appointment booked successfully." };
  } catch (error: any) {
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", error.message);
  }
});

/**
 * 2. Leave Conflict Handler
 * 
 * Triggered when a new document is created in the 'leaves' collection.
 * Cancels any booked appointments for the doctor on that specific date.
 */
export const handleDoctorLeave = onDocumentCreated(
  "leaves/{leaveId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const leaveData = snapshot.data();
    const { doctorId, date } = leaveData;

    if (!doctorId || !date) {
      console.error("Invalid leave data:", leaveData);
      return;
    }

    try {
      const appointmentsRef = db.collection("appointments");
      const conflictingAppointments = await appointmentsRef
        .where("doctorId", "==", doctorId)
        .where("status", "==", "booked")
        .get();

      const batch = db.batch();
      let cancelCount = 0;

      conflictingAppointments.forEach((doc) => {
        const appointment = doc.data();
        
        // Parse the appointment date to check if it matches the leave date.
        // Handles both ISO strings and Firestore Timestamps.
        let appointmentDate = "";
        if (typeof appointment.slotTime === "string") {
            appointmentDate = appointment.slotTime.split("T")[0];
        } else if (appointment.slotTime && typeof appointment.slotTime.toDate === "function") {
            appointmentDate = appointment.slotTime.toDate().toISOString().split("T")[0];
        }

        // If the appointment falls on the leave date, cancel it.
        if (appointmentDate === date || appointment.slotTime === date) {
            batch.update(doc.ref, { status: "cancelled" });
            cancelCount++;
            
            // Simulate queuing an email to reschedule
            console.log(
                `Sending cancellation email to patientId: ${appointment.patientId} for appointment on ${appointment.slotTime} due to doctor leave.`
            );
            
            if (SENDGRID_API_KEY) {
                // sgMail.send({ ... })
            }
        }
      });

      if (cancelCount > 0) {
        await batch.commit();
        console.log(`Cancelled ${cancelCount} appointments for doctor ${doctorId} on ${date}.`);
      } else {
        console.log(`No conflicting appointments found for doctor ${doctorId} on ${date}.`);
      }
    } catch (error) {
      console.error("Error handling doctor leave:", error);
    }
  }
);


/**
 * 3. Gemini AI Summaries
 */
export const generatePreVisitSummary = onCall(async (request) => {
  const data = request.data;
  const { symptoms } = data;

  if (!symptoms) {
    throw new HttpsError("invalid-argument", "Missing symptoms data.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Symptoms: ${symptoms}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return { summary: text };
  } catch (error: any) {
    console.error("Error generating pre-visit summary:", error);
    throw new HttpsError("internal", "Failed to generate summary.");
  }
});

export const generatePostVisitSummary = onCall(async (request) => {
  const data = request.data;
  const { notes } = data;

  if (!notes) {
    throw new HttpsError("invalid-argument", "Missing clinical notes.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: ${notes}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return { summary: text };
  } catch (error: any) {
    console.error("Error generating post-visit summary:", error);
    throw new HttpsError("internal", "Failed to generate summary.");
  }
});

/**
 * 4. Medication Reminders Cron
 */
export const sendMedicationReminders = onSchedule("every 1 hours", async (event) => {
  try {
    const now = new Date();
    const medicationsRef = db.collection("active_medications");
    
    // Check for medications that need reminders right now or earlier
    const snapshot = await medicationsRef
      .where("nextReminderTime", "<=", admin.firestore.Timestamp.fromDate(now))
      .get();

    if (snapshot.empty) {
      console.log("No medication reminders to send at this time.");
      return;
    }

    const batch = db.batch();
    let sentCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const patientEmail = data.patientEmail || "unknown@example.com";
      const medicationName = data.medicationName || "Medication";

      // Log the simulated email sent
      console.log(`[Medication Reminder] Sending email to ${patientEmail} for ${medicationName}.`);

      if (SENDGRID_API_KEY) {
          // sgMail.send({ ... })
      }

      // Update the next reminder time to prevent duplicate reminders (e.g., adding 24 hours for daily medication)
      // For this example, we just mark it as processed if you want to avoid resending, 
      // or set nextReminderTime to the future. Let's just remove the nextReminderTime or set it +1 day.
      const nextDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      batch.update(doc.ref, { nextReminderTime: admin.firestore.Timestamp.fromDate(nextDate) });
      sentCount++;
    });

    await batch.commit();
    console.log(`Processed and updated ${sentCount} medication reminders.`);
  } catch (error) {
    console.error("Error in medication reminders cron:", error);
  }
});
