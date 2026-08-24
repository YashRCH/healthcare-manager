import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary-500" />
            <span className="text-lg font-bold text-slate-800">CareManager</span>
          </div>
          
          <div className="text-sm text-slate-500 flex gap-6">
            <Link to="/privacy" className="hover:text-primary-600 transition-colors">
              Privacy Policy
            </Link>
            <a href="https://github.com/YashRCH/healthcare-manager" target="_blank" rel="noreferrer" className="hover:text-primary-600 transition-colors">
              GitHub
            </a>
          </div>
          
          <div className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} CareManager. All rights reserved.
          </div>
          
        </div>
      </div>
    </footer>
  );
}
