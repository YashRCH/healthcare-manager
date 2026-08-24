import { Link } from 'react-router-dom';
import { Calendar, UserPlus, FileText } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
        </span>
        Next-Generation Healthcare
      </div>
      
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-3xl">
        Seamless Care, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">Smarter Follow-ups</span>
      </h1>
      
      <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
        CareManager connects patients and doctors with AI-powered summaries, intelligent scheduling, and automated reminders for a frictionless healthcare experience.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-16">
        <Link 
          to="/login"
          className="inline-flex justify-center items-center rounded-xl bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all hover:scale-105 active:scale-95"
        >
          Get Started
        </Link>
        <Link 
          to="/login"
          className="inline-flex justify-center items-center rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all"
        >
          Portal Login
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow text-left">
          <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-primary-600">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Smart Scheduling</h3>
          <p className="text-slate-600">Zero double-bookings. Real-time availability with doctor leave management.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow text-left">
          <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-purple-600">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">AI Summaries</h3>
          <p className="text-slate-600">Gemini-powered pre-visit symptom analysis and post-visit patient instructions.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow text-left">
          <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-green-600">
            <UserPlus className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Automated Reminders</h3>
          <p className="text-slate-600">Never miss a pill. Background cron jobs send medication reminders seamlessly.</p>
        </div>
      </div>
    </div>
  );
}
