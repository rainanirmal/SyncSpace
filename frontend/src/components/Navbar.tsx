import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Bell, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 glass-panel border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-white tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span>Sync<span className="text-indigo-400">Space</span></span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 transition">
          <Bell className="w-5 h-5" />
        </button>

        <div className="h-6 w-px bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-semibold text-sm">
            {user?.username?.[0]?.toUpperCase() || <UserIcon className="w-4 h-4" />}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-slate-200">{user?.fullName || user?.username}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition ml-2"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
