import { Link, useNavigate } from 'react-router-dom';
import { Calendar, HeartPulse, Sparkles, Search, ChevronRight, X, Check } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/patient');
  };

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden font-sans">
      <div className="grid-bg"></div>
      
      {/* Navbar */}
      <nav className="relative z-10 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-8 w-8 text-primary-600" />
              <span className="font-heading font-bold text-2xl tracking-tight text-slate-900">
                CareManager
              </span>
            </div>
            <div>
              <Link
                to="/login"
                className="premium-btn inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-md text-white bg-slate-900 hover:bg-slate-800 transition-all hover:-translate-y-0.5"
              >
                Sign In / Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-semibold mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
            AI-Native Care Platform
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
            We manage healthcare <span className="hero-title-italic block mt-2">smarter than you thought</span>
            <span className="relative inline-block mt-2">
              possible
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary-500" viewBox="0 0 200 8" fill="none" preserveAspectRatio="none">
                <path d="M2 6C50 2 150 2 198 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round"></path>
              </svg>
            </span>
          </h1>
          
          <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto font-medium">
            Patient scheduling, triage, and care tracking powered by AI-native workflows that compress wait times and reduce clinical burnout.
          </p>

          <div className="mt-12 max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="hero-search-inner group">
              <Sparkles className="w-5 h-5 text-primary-500 mr-3 shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="How are you feeling today? Let's find you a doctor..."
                className="w-full bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400 text-lg outline-none"
              />
              <button type="submit" className="ml-3 p-2 rounded-full bg-slate-900 text-white hover:bg-primary-600 transition-colors shrink-0">
                <Search className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button className="suggestion-pill" onClick={() => navigate('/login')}>
                <Sparkles className="w-4 h-4" /> AI Pre-visit Analysis
              </button>
              <button className="suggestion-pill" onClick={() => navigate('/login')}>
                <HeartPulse className="w-4 h-4" /> Find a Cardiologist
              </button>
              <button className="suggestion-pill" onClick={() => navigate('/login')}>
                <Calendar className="w-4 h-4" /> Book a General Checkup
              </button>
            </div>
          </div>
        </div>
      </main>



      {/* Comparison Section */}
      <section className="relative z-10 py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary-600 font-semibold tracking-wide uppercase text-sm mb-3">The Problem</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Most clinics use software.<br/>
              <span className="text-slate-400 font-medium">Few engineer care around patients.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            <div className="comparison-card typical">
              <h3 className="text-xl font-bold text-slate-500 mb-8 uppercase tracking-widest text-center border-b border-slate-200 pb-4">Typical Healthcare</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 text-slate-600">
                  <X className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <span className="font-medium text-lg">Doctors used as data entry clerks</span>
                </li>
                <li className="flex items-start gap-4 text-slate-600">
                  <X className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <span className="font-medium text-lg">Fragmented, disconnected portals</span>
                </li>
                <li className="flex items-start gap-4 text-slate-600">
                  <X className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <span className="font-medium text-lg">Patients wait weeks for basic follow-ups</span>
                </li>
                <li className="flex items-start gap-4 text-slate-600">
                  <X className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <span className="font-medium text-lg">Quality of care varies wildly</span>
                </li>
              </ul>
            </div>

            <div className="comparison-card unthinkable">
              <h3 className="text-xl font-bold text-primary-600 mb-8 uppercase tracking-widest text-center border-b border-primary-100 pb-4">The CareManager Way</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 text-slate-900">
                  <Check className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-bold text-lg">AI as a core triage and pre-visit layer</span>
                </li>
                <li className="flex items-start gap-4 text-slate-900">
                  <Check className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-bold text-lg">Workflows redesigned around smart-booking</span>
                </li>
                <li className="flex items-start gap-4 text-slate-900">
                  <Check className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-bold text-lg">Automated post-visit patient summaries</span>
                </li>
                <li className="flex items-start gap-4 text-slate-900">
                  <Check className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-bold text-lg">Premium care experience, consistently</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="relative z-10 py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-primary-600 font-semibold tracking-wide uppercase text-sm mb-3">How We Work</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl">
              Deliver care faster without scaling <br/>
              <span className="hero-title-italic">your clinic linearly.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <span className="step-num">01</span>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">AI Assessment</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Patients describe symptoms naturally. Our AI engines synthesize clinical pre-visit summaries before they even step into the clinic.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <span className="step-num">02</span>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Smart Booking</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Transactional slot management ensures zero double-booking. Leaves and conflicts are resolved autonomously in the background.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <span className="step-num">03</span>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Automated Follow-ups</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Doctors dictate shorthand notes; we transform them into patient-friendly instructions and automatically schedule reminder emails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 py-20 bg-slate-900 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8">Ready to experience unthinkable care?</h2>
        <Link
          to="/login"
          className="premium-btn inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl shadow-lg text-slate-900 bg-white hover:bg-slate-50 transition-all hover:-translate-y-1"
        >
          Join CareManager Today <ChevronRight className="ml-2 w-5 h-5" />
        </Link>
      </section>
    </div>
  );
}
