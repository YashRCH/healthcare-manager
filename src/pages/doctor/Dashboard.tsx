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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Doctor Portal</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
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
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedAppt?.id === appt.id ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-slate-200 hover:border-primary-300'}`}
                >
                  <p className="font-semibold text-slate-900">
                    {new Date(appt.slotTime).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                    <span className="font-medium text-slate-800">Pre-visit Summary:</span> {appt.preVisitSummary || 'No summary'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedAppt && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-right-4 flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              Post-Visit Notes
            </h2>
            
            <div className="mb-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
              <span className="font-semibold block mb-1">AI Pre-Visit Assessment:</span>
              {selectedAppt.preVisitSummary}
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-slate-700 mb-1">Clinical Notes & Prescription</label>
              <textarea
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter clinical notes, diagnosis, and prescription details..."
                className="w-full flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none mb-4"
              />
            </div>

            <button
              onClick={submitPostVisit}
              disabled={submitting}
              className="w-full bg-primary-600 text-white font-medium px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
