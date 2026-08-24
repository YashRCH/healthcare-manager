import { ShieldCheck, Lock, Eye, Database } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div className="text-center space-y-4 mb-12">
        <div className="bg-primary-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShieldCheck className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          How CareManager collects, uses, and protects your personal and medical data.
        </p>
      </div>

      <div className="glass-card p-8 space-y-8">
        
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-2">
            <Database className="w-5 h-5 text-primary-500" />
            1. Data Collection
          </h2>
          <p className="text-slate-600 leading-relaxed">
            We collect personal identification information (Name, Email) and electronic health records (EHR) such as your blood type, weight, height, allergies, and active prescriptions. This information is provided by you or your healthcare provider during registration and consultation.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-2">
            <Lock className="w-5 h-5 text-primary-500" />
            2. Data Protection & Security
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Your medical data is protected by strict Role-Based Access Control (RBAC) at the database layer. 
            Patients can only access their own records. Doctors can only access records for patients they are treating. 
            Our database rules are strictly enforced server-side to prevent unauthorized reads or modifications.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-2">
            <Eye className="w-5 h-5 text-primary-500" />
            3. Third-Party Integrations
          </h2>
          <p className="text-slate-600 leading-relaxed">
            To provide automated summaries and appointment tracking, CareManager integrates with the following third parties:
          </p>
          <ul className="list-disc list-inside text-slate-600 space-y-2 ml-2">
            <li><strong>Google Gemini AI:</strong> Used to generate pre-visit symptom summaries and post-visit clinical notes. Your symptoms and notes are processed securely via API.</li>
            <li><strong>Google Calendar API:</strong> Used to automatically schedule and cancel appointments on your behalf.</li>
            <li><strong>SendGrid:</strong> Used to send transactional emails (booking confirmations and medication reminders).</li>
          </ul>
        </section>

        <section className="space-y-4 pt-4">
          <p className="text-sm text-slate-400">
            Last updated: August 2026. If you have any questions regarding this policy or your data, please contact your clinic administrator.
          </p>
        </section>

      </div>
    </div>
  );
}
