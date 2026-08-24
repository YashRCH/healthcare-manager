import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Search, Calendar, Stethoscope, AlertCircle, Activity, Pill, History } from 'lucide-react';
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
  
  // Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    bloodType: '',
    weight: '',
    height: '',
    allergies: ''
  });
  
  // EHR Data States
  const [profile, setProfile] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchEHRData();
    }
  }, [user]);

  const fetchEHRData = async () => {
    if (!user) return;
    
    // 1. Fetch Profile & Vitals
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setProfile(data);
      if (data.vitals) {
        setEditForm({
          bloodType: data.vitals.bloodType || '',
          weight: data.vitals.weight || '',
          height: data.vitals.height || '',
          allergies: data.vitals.allergies ? data.vitals.allergies.join(', ') : ''
        });
      }
    }

    // 2. Fetch Active Prescriptions
    const rxQ = query(collection(db, `users/${user.uid}/prescriptions`), where('status', '==', 'active'));
    const rxSnap = await getDocs(rxQ);
    setPrescriptions(rxSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    // Fetch all appointments for the patient (requires only one index on patientId)
    const apptsQ = query(collection(db, 'appointments'), where('patientId', '==', user.uid));
    const apptsSnap = await getDocs(apptsQ);
    const allAppts = apptsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // 3. Filter Past Appointments
    setHistory(allAppts.filter((a: any) => a.status === 'completed'));

    // 4. Filter Upcoming Appointments
    setUpcoming(allAppts.filter((a: any) => a.status === 'booked' || a.status === 'rescheduled'));
  };

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
      const generatePreVisit = httpsCallable(functions, 'generatePreVisitSummary');
      const summaryRes: any = await generatePreVisit({ symptoms });
      const preVisitSummary = summaryRes.data.summary;

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
      fetchEHRData(); // Refresh the list to show the new appointment
    } catch (err: any) {
      setMessage(`Booking failed: ${err.message}`);
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        vitals: {
          bloodType: editForm.bloodType,
          weight: editForm.weight,
          height: editForm.height,
          allergies: editForm.allergies.split(',').map(a => a.trim()).filter(a => a)
        }
      });
      setIsEditingProfile(false);
      fetchEHRData(); // Refresh UI
    } catch (err: any) {
      console.error('Failed to update profile:', err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-end">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Patient Dashboard</h1>
        {profile && <p className="text-slate-500 font-medium">Welcome back, {profile.name}</p>}
      </div>
      
      {/* EHR Section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Vitals */}
        <div className="glass-card p-6 relative">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <Activity className="w-5 h-5 text-primary-500" />
              Medical Profile
            </h2>
            <button 
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="text-xs text-primary-600 hover:text-primary-800 font-semibold"
            >
              {isEditingProfile ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditingProfile ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Blood Type</label>
                <input type="text" value={editForm.bloodType} onChange={e => setEditForm({...editForm, bloodType: e.target.value})} className="w-full text-sm p-2 rounded border border-slate-200 mt-1" placeholder="e.g. O+" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold">Weight</label>
                  <input type="text" value={editForm.weight} onChange={e => setEditForm({...editForm, weight: e.target.value})} className="w-full text-sm p-2 rounded border border-slate-200 mt-1" placeholder="e.g. 70kg" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold">Height</label>
                  <input type="text" value={editForm.height} onChange={e => setEditForm({...editForm, height: e.target.value})} className="w-full text-sm p-2 rounded border border-slate-200 mt-1" placeholder="e.g. 175cm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Allergies (comma separated)</label>
                <input type="text" value={editForm.allergies} onChange={e => setEditForm({...editForm, allergies: e.target.value})} className="w-full text-sm p-2 rounded border border-slate-200 mt-1" placeholder="e.g. Peanuts, Penicillin" />
              </div>
              <button onClick={saveProfile} disabled={loading} className="w-full mt-2 bg-primary-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          ) : profile?.vitals ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-xs uppercase tracking-wider font-bold mb-1">Blood Type</span>
                <span className="font-semibold text-slate-800 text-lg">{profile.vitals.bloodType || '-'}</span>
              </div>
              <div className="bg-white/50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-xs uppercase tracking-wider font-bold mb-1">Weight</span>
                <span className="font-semibold text-slate-800 text-lg">{profile.vitals.weight || '-'}</span>
              </div>
              <div className="bg-white/50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-xs uppercase tracking-wider font-bold mb-1">Height</span>
                <span className="font-semibold text-slate-800 text-lg">{profile.vitals.height || '-'}</span>
              </div>
              <div className="bg-white/50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-xs uppercase tracking-wider font-bold mb-1">Allergies</span>
                <span className="font-semibold text-red-500">{(profile.vitals.allergies && profile.vitals.allergies.length > 0) ? profile.vitals.allergies.join(', ') : 'None'}</span>
              </div>
            </div>
          ) : (
             <p className="text-sm text-slate-500">No profile data available. Click Edit to add.</p>
          )}
        </div>

        {/* Prescriptions */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
            <Pill className="w-5 h-5 text-primary-500" />
            Active Prescriptions
          </h2>
          <div className="space-y-3 overflow-y-auto max-h-[200px] pr-2">
            {prescriptions.length > 0 ? prescriptions.map(rx => (
              <div key={rx.id} className="bg-white/60 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900">{rx.medication}</h3>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold uppercase">Active</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{rx.dosage} • {rx.frequency}</p>
                <p className="text-xs text-slate-400 mt-2">Prescribed by {rx.prescribedBy}</p>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No active prescriptions.</p>
            )}
          </div>
        </div>

        {/* History */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
            <History className="w-5 h-5 text-primary-500" />
            Past Visits
          </h2>
          <div className="space-y-3 overflow-y-auto max-h-[200px] pr-2">
            {history.length > 0 ? history.map(appt => (
              <div key={appt.id} className="bg-white/60 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-slate-900">{appt.doctorName || 'Doctor'}</h3>
                  <span className="text-xs text-slate-500">{new Date(appt.slotTime).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">
                  <span className="font-semibold">Note:</span> {appt.postVisitSummary}
                </p>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No past visits.</p>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
            <Calendar className="w-5 h-5 text-primary-500" />
            Upcoming
          </h2>
          <div className="space-y-3 overflow-y-auto max-h-[200px] pr-2">
            {upcoming.length > 0 ? upcoming.map(appt => (
              <div key={appt.id} className="bg-white/60 p-4 rounded-xl border border-primary-200 shadow-sm shadow-primary-500/10">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-slate-900">{appt.doctorName || 'Your Doctor'}</h3>
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-md font-bold uppercase">Booked</span>
                </div>
                <p className="text-sm text-slate-600 font-medium">{new Date(appt.slotTime).toLocaleString()}</p>
                {appt.symptoms && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-1">
                    <span className="font-semibold">Reason:</span> {appt.symptoms}
                  </p>
                )}
                {appt.preVisitSummary && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-primary-100 text-xs text-slate-600">
                    <span className="font-semibold block text-primary-700 mb-1">AI Pre-visit Summary:</span>
                    <p className="whitespace-pre-line leading-relaxed">{appt.preVisitSummary}</p>
                  </div>
                )}
              </div>
            )) : (
              <p className="text-sm text-slate-500">No upcoming appointments.</p>
            )}
          </div>
        </div>

      </div>

      {/* Booking Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-card p-8">
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
              className="flex-1 rounded-xl border border-slate-200 bg-white/50 px-4 py-2.5 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm"
            />
            <button
              onClick={searchDoctors}
              disabled={loading}
              className="premium-btn bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 shadow-md shadow-primary-500/20 hover:-translate-y-0.5"
            >
              Search
            </button>
          </div>

          <div className="space-y-3">
            {doctors.map(doc => (
              <div 
                key={doc.id} 
                onClick={() => setSelectedDoctor(doc)}
                className={`p-5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedDoctor?.id === doc.id ? 'border-primary-500 bg-primary-50/80 ring-2 ring-primary-500/20 scale-[1.02]' : 'border-slate-200 bg-white/60 hover:border-primary-300 hover:scale-[1.01]'}`}
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
          <div className="glass-card p-8 animate-fade-in-up">
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
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Symptoms (Pre-visit Analysis)</label>
                <textarea
                  rows={4}
                  placeholder="Describe your symptoms in detail..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm resize-none"
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
                className="premium-btn w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold px-4 py-3.5 rounded-xl hover:shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50 hover:-translate-y-0.5 mt-2"
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
