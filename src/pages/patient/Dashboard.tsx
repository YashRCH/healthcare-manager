import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Search, Calendar, Stethoscope, AlertCircle } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialization, setSpecialization] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [slotTime, setSlotTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const searchDoctors = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'doctor'),
        where('specialization', '==', specialization || 'General Practice')
      );
      const snapshot = await getDocs(q);
      setDoctors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const bookSlot = async () => {
    if (!selectedDoctor || !slotTime || !symptoms) {
      setMessage("Please fill all fields.");
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      // 1. Generate Pre-Visit Summary using Cloud Function
      const generatePreVisit = httpsCallable(functions, 'generatePreVisitSummary');
      const summaryRes: any = await generatePreVisit({ symptoms });
      const preVisitSummary = summaryRes.data.summary;

      // 2. Book appointment using transactional Cloud Function to avoid double-booking
      const bookAppointment = httpsCallable(functions, 'bookAppointment');
      await bookAppointment({
        doctorId: selectedDoctor.id,
        patientId: user?.uid,
        slotTime: new Date(slotTime).toISOString(),
        symptoms,
        preVisitSummary
      });

      setMessage('Appointment successfully booked!');
      setSelectedDoctor(null);
      setSymptoms('');
      setSlotTime('');
    } catch (err: any) {
      setMessage(`Booking failed: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Patient Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary-500" />
            Find a Doctor
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="E.g., Cardiology, General Practice"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button
              onClick={searchDoctors}
              disabled={loading}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              Search
            </button>
          </div>

          <div className="space-y-3">
            {doctors.map(doc => (
              <div 
                key={doc.id} 
                onClick={() => setSelectedDoctor(doc)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedDoctor?.id === doc.id ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-slate-200 hover:border-primary-300'}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-slate-900">{doc.email}</h3>
                    <p className="text-sm text-slate-500">{doc.specialization}</p>
                  </div>
                  <Stethoscope className="text-slate-400 w-5 h-5" />
                </div>
              </div>
            ))}
            {doctors.length === 0 && !loading && (
              <p className="text-sm text-slate-500 text-center py-4">Search to find available doctors.</p>
            )}
          </div>
        </div>

        {selectedDoctor && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              Book Appointment
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Time Slot</label>
                <input
                  type="datetime-local"
                  value={slotTime}
                  onChange={(e) => setSlotTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Symptoms (Pre-visit Analysis)</label>
                <textarea
                  rows={4}
                  placeholder="Describe your symptoms in detail..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                />
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Gemini AI will generate a pre-visit summary for your doctor.
                </p>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${message.includes('failed') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {message}
                </div>
              )}

              <button
                onClick={bookSlot}
                disabled={loading}
                className="w-full bg-primary-600 text-white font-medium px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
