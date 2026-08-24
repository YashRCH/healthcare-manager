import { Link } from 'react-router-dom';
import { Calendar, HeartPulse, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[90vh] py-20 text-center overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-primary-300/30 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-secondary-300/30 rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-primary-700 text-sm font-semibold mb-8 shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
          </span>
          Next-Generation Healthcare OS
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 max-w-4xl leading-tight">
          Seamless Care, <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">Smarter Follow-ups.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          CareManager connects patients and doctors with AI-powered summaries, intelligent scheduling, and automated reminders for a frictionless healthcare experience.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 mb-24">
          <Link 
            to="/login"
            className="premium-btn inline-flex justify-center items-center rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-1"
          >
            Get Started
            <HeartPulse className="ml-2 w-5 h-5" />
          </Link>
          <Link 
            to="/login"
            className="premium-btn inline-flex justify-center items-center rounded-2xl glass-card px-10 py-4 text-lg font-semibold text-slate-800 hover:-translate-y-1"
          >
            Portal Login
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
          
          <div className="glass-panel p-8 text-left hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-6 text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-800">Smart Scheduling</h3>
            <p className="text-slate-600 leading-relaxed">Zero double-bookings. Real-time availability with intelligent doctor leave conflict management.</p>
          </div>
          
          <div className="glass-panel p-8 text-left hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center mb-6 text-purple-600 shadow-inner group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-800">AI Summaries</h3>
            <p className="text-slate-600 leading-relaxed">Gemini-powered pre-visit symptom analysis and structured post-visit patient instructions.</p>
          </div>
          
          <div className="glass-panel p-8 text-left hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center mb-6 text-teal-600 shadow-inner group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-800">Automated Reminders</h3>
            <p className="text-slate-600 leading-relaxed">Never miss a pill. Background cron jobs orchestrate dynamic medication reminders seamlessly.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
