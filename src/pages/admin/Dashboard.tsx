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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-500" />
            Manage Doctors
          </h2>
          
          <div className="space-y-3">
            {doctors.map(doc => (
              <div 
                key={doc.id}
                onClick={() => setSelectedDoctor(doc)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedDoctor?.id === doc.id ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-slate-200 hover:border-primary-300'}`}
              >
                <h3 className="font-semibold text-slate-900">{doc.email}</h3>
                <p className="text-sm text-slate-500">{doc.specialization} • Slot: {doc.slotDuration} min</p>
              </div>
            ))}
            {doctors.length === 0 && <p className="text-slate-500">No doctors found.</p>}
          </div>
        </div>

        {selectedDoctor && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-right-4 h-fit">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CalendarOff className="w-5 h-5 text-red-500" />
              Mark Doctor Leave
            </h2>
            
            <p className="text-sm text-slate-600 mb-4">
              Marking a leave date for <span className="font-semibold">{selectedDoctor.email}</span> will trigger a background function to cancel any conflicting appointments and email the affected patients.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Date</label>
                <input
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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
                className="w-full bg-red-600 text-white font-medium px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
