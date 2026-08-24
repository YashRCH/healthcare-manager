import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, functions } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { Calendar, FileText, CheckCircle } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user]);

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

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            Upcoming Appointments
          </h2>
          
          {loading ? (
            <div className="text-slate-500">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-slate-500">No upcoming appointments.</div>
          ) : (
            <div className="space-y-3">
              {appointments.map(appt => (
                <div 
                  key={appt.id}
                  onClick={() => setSelectedAppt(appt)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedAppt?.id === appt.id ? 'border-primary-500 bg-primary-50/80 ring-2 ring-primary-500/20 scale-[1.02]' : 'border-slate-200 bg-white/60 hover:border-primary-300 hover:scale-[1.01]'}`}
                >
                  <p className="font-bold text-slate-900 text-lg">
                    {new Date(appt.slotTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    <span className="font-semibold text-slate-800">Pre-visit Summary:</span> {appt.preVisitSummary || 'No summary provided.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedAppt && (
          <div className="glass-card p-8 animate-fade-in-up flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary-500" />
              Post-Visit Notes
            </h2>
            
            <div className="mb-6 bg-slate-100/50 p-5 rounded-xl border border-slate-200 text-sm shadow-inner">
              <span className="font-bold block mb-2 text-slate-800">AI Pre-Visit Assessment:</span>
              <p className="text-slate-600 leading-relaxed">{selectedAppt.preVisitSummary}</p>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Clinical Notes & Prescription</label>
              <textarea
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter clinical notes, diagnosis, and prescription details..."
                className="w-full flex-1 rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm resize-none mb-6"
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
        )}
      </div>
    </div>
  );
}
