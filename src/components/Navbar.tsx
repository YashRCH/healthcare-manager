import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, HeartPulse } from 'lucide-react';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary-500 p-2 rounded-lg">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
                CareManager
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  to={`/${role}`} 
                  className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="h-8 w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 hidden sm:block">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/login"
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
