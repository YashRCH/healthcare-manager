import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Shield, Plus, CalendarOff } from 'lucide-react';

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [leaveDate, setLeaveDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
    const snapshot = await getDocs(q);
    setDoctors(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const markLeave = async () => {
    if (!selectedDoctor || !leaveDate) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'leaves'), {
        doctorId: selectedDoctor.id,
        date: new Date(leaveDate).toISOString().split('T')[0],
        createdAt: new Date()
      });
      setMessage('Leave marked successfully. Affected appointments will be cancelled and patients notified.');
      setLeaveDate('');
      setSelectedDoctor(null);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-500" />
            Manage Doctors
          </h2>
          
          <div className="space-y-3">
            {doctors.map(doc => (
              <div 
                key={doc.id}
                onClick={() => setSelectedDoctor(doc)}
                className={`p-5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedDoctor?.id === doc.id ? 'border-primary-500 bg-primary-50/80 ring-2 ring-primary-500/20 scale-[1.02]' : 'border-slate-200 bg-white/60 hover:border-primary-300 hover:scale-[1.01]'}`}
              >
                <h3 className="font-bold text-slate-900 text-lg">{doc.name || doc.email}</h3>
                <p className="text-sm text-slate-600 mt-1">{doc.specialization} • Slot: {doc.slotDuration} min</p>
              </div>
            ))}
            {doctors.length === 0 && <p className="text-slate-500">No doctors found.</p>}
          </div>
        </div>

        {selectedDoctor && (
          <div className="glass-card p-8 animate-fade-in-up h-fit">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <CalendarOff className="w-6 h-6 text-red-500" />
              Mark Doctor Leave
            </h2>
            
            <p className="text-sm text-slate-600 mb-4">
              Marking a leave date for <span className="font-semibold">{selectedDoctor.email}</span> will trigger a background function to cancel any conflicting appointments and email the affected patients.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Leave Date</label>
                <input
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all shadow-sm"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {message}
                </div>
              )}

              <button
                onClick={markLeave}
                disabled={loading}
                className="premium-btn w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold px-4 py-3.5 rounded-xl hover:shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:-translate-y-0.5 mt-2"
              >
                <Plus className="w-5 h-5" />
                {loading ? 'Processing...' : 'Confirm Leave'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
