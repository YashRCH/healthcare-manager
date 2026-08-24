import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db, functions } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { Calendar, FileText, CheckCircle, User, Activity, Pill } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  
  // EHR States for the selected patient
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [patientPrescriptions, setPatientPrescriptions] = useState<any[]>([]);
  
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user]);

  useEffect(() => {
    if (selectedAppt?.patientId) {
      fetchPatientEHR(selectedAppt.patientId);
    } else {
      setPatientProfile(null);
      setPatientPrescriptions([]);
    }
  }, [selectedAppt]);

  const fetchAppointments = async () => {
    setLoading(true);
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user?.uid),
      where('status', '==', 'booked')
    );
    const snapshot = await getDocs(q);
    setAppointments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const fetchPatientEHR = async (patientId: string) => {
    // 1. Fetch Profile
    const pDoc = await getDoc(doc(db, 'users', patientId));
    if (pDoc.exists()) setPatientProfile(pDoc.data());

    // 2. Fetch Active Prescriptions
    const rxQ = query(collection(db, `users/${patientId}/prescriptions`), where('status', '==', 'active'));
    const rxSnap = await getDocs(rxQ);
    setPatientPrescriptions(rxSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const submitPostVisit = async () => {
    if (!notes || !selectedAppt) return;
    setSubmitting(true);
    try {
      const generatePostVisit = httpsCallable(functions, 'generatePostVisitSummary');
      const res: any = await generatePostVisit({ notes });
      
      await updateDoc(doc(db, 'appointments', selectedAppt.id), {
        postVisitNotes: notes,
        postVisitSummary: res.data.summary,
        status: 'completed'
      });
      
      setSelectedAppt(null);
      setNotes('');
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Doctor Portal</h1>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Appointments List */}
        <div className="lg:col-span-4 glass-card p-6 h-fit max-h-[80vh] flex flex-col">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            Today's Schedule
          </h2>
          
          {loading ? (
            <div className="text-slate-500 text-sm">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-slate-500 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">No upcoming appointments.</div>
          ) : (
            <div className="space-y-3 overflow-y-auto flex-1 pr-2">
              {appointments.map(appt => (
                <div 
                  key={appt.id}
                  onClick={() => setSelectedAppt(appt)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedAppt?.id === appt.id ? 'border-primary-500 bg-primary-50/80 ring-2 ring-primary-500/20 scale-[1.02]' : 'border-slate-200 bg-white/60 hover:border-primary-300 hover:scale-[1.01]'}`}
                >
                  <p className="font-bold text-slate-900">
                    {new Date(appt.slotTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    <span className="font-semibold text-slate-800">Pre-visit Summary:</span> {appt.preVisitSummary || 'No summary provided.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Patient Context & Post-visit Notes */}
        {selectedAppt ? (
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Patient EHR Overview */}
            {patientProfile && (
              <div className="glass-card p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <User className="w-5 h-5 text-primary-500" />
                    Patient Electronic Health Record (EHR)
                  </h2>
                  <span className="text-sm font-semibold text-slate-500">{patientProfile.name}</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Vitals */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      Vitals & Profile
                    </h3>
                    {patientProfile.vitals ? (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-slate-50 p-2 rounded border border-slate-100"><span className="text-slate-400 block text-[10px] uppercase">Blood Type</span><span className="font-semibold">{patientProfile.vitals.bloodType}</span></div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100"><span className="text-slate-400 block text-[10px] uppercase">Weight</span><span className="font-semibold">{patientProfile.vitals.weight}</span></div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100"><span className="text-slate-400 block text-[10px] uppercase">Height</span><span className="font-semibold">{patientProfile.vitals.height}</span></div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100"><span className="text-slate-400 block text-[10px] uppercase">Allergies</span><span className="font-semibold text-red-500">{patientProfile.vitals.allergies.join(', ')}</span></div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No vitals recorded.</p>
                    )}
                  </div>

                  {/* Active Prescriptions */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-indigo-500" />
                      Active Prescriptions
                    </h3>
                    <div className="space-y-2 max-h-[120px] overflow-y-auto">
                      {patientPrescriptions.length > 0 ? patientPrescriptions.map(rx => (
                        <div key={rx.id} className="bg-slate-50 p-2 rounded border border-slate-100 text-sm">
                          <div className="font-semibold text-slate-800">{rx.medication}</div>
                          <div className="text-xs text-slate-500">{rx.dosage} • {rx.frequency}</div>
                        </div>
                      )) : (
                        <p className="text-xs text-slate-500">No active prescriptions.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Notes Entry */}
            <div className="glass-card p-6 animate-fade-in-up flex-1 flex flex-col">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary-500" />
                Consultation Notes
              </h2>
              
              <div className="mb-4 bg-primary-50 p-4 rounded-xl border border-primary-100 text-sm shadow-inner">
                <span className="font-bold block mb-1 text-primary-900">AI Pre-Visit Assessment:</span>
                <p className="text-primary-800 leading-relaxed">{selectedAppt.preVisitSummary}</p>
              </div>

              <div className="flex-1 flex flex-col mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Doctor's Shorthand / Prescription</label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter clinical notes, diagnosis, and prescription details. Gemini AI will convert this into patient-friendly instructions..."
                  className="w-full flex-1 rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm resize-none"
                />
              </div>

              <button
                onClick={submitPostVisit}
                disabled={submitting}
                className="premium-btn w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold px-4 py-3.5 rounded-xl hover:shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:-translate-y-0.5"
              >
                <CheckCircle className="w-5 h-5" />
                {submitting ? 'Generating AI Summary...' : 'Submit & Generate Patient Summary'}
              </button>
            </div>
            
          </div>
        ) : (
          <div className="lg:col-span-8 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/30">
             <div className="text-center p-8">
               <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <p className="text-slate-500 font-medium">Select an appointment to view the patient's EHR and add notes.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
