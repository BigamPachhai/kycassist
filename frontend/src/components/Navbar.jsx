import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, User, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/notifications')
        .then(res => setUnread(res.data.unreadCount || 0))
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const kycStatusColor = {
    not_started: 'bg-slate-200 text-slate-600',
    in_progress: 'bg-blue-100 text-blue-700',
    submitted: 'bg-teal-100 text-teal-700',
    under_review: 'bg-amber-100 text-amber-700',
    verified: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    action_required: 'bg-orange-100 text-orange-700',
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center">
            <Shield size={15} color="white" />
          </div>
          <span className="text-white font-bold text-base">KYCAssist</span>
          <span className="text-slate-500 text-xs hidden sm:block">· eSewa</span>
        </Link>

        {/* Desktop nav */}
        {user && (
          <div className="hidden sm:flex items-center gap-4">
            {user.role !== 'admin' && (
              <>
                <Link to="/dashboard" className={`text-sm transition-colors ${location.pathname === '/dashboard' ? 'text-teal-400' : 'text-slate-300 hover:text-white'}`}>
                  Dashboard
                </Link>
                <Link to="/kyc" className={`text-sm transition-colors ${location.pathname.startsWith('/kyc') ? 'text-teal-400' : 'text-slate-300 hover:text-white'}`}>
                  KYC Form
                </Link>

                {/* KYC status badge */}
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${kycStatusColor[user.kycStatus] || kycStatusColor.not_started}`}>
                  {user.kycStatus?.replace(/_/g, ' ') || 'not started'}
                </span>
              </>
            )}

            {user.role === 'admin' && (
              <Link to="/admin" className={`text-sm transition-colors flex items-center gap-1 ${location.pathname.startsWith('/admin') ? 'text-teal-400' : 'text-slate-300 hover:text-white'}`}>
                <Shield size={14} /> Admin
              </Link>
            )}

            {/* Notifications */}
            <Link to="/notifications" className="relative text-slate-300 hover:text-white transition-colors">
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div className="flex items-center gap-2 text-slate-300">
              <User size={15} />
              <span className="text-sm">{user.fullName?.split(' ')[0]}</span>
            </div>

            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        )}

        {/* Mobile toggle */}
        {user && (
          <button onClick={() => setMobileOpen(o => !o)} className="sm:hidden text-slate-300">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && user && (
        <div className="sm:hidden bg-slate-800 border-t border-slate-700 px-4 py-3 space-y-2">
          {user.role !== 'admin' && (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block text-sm text-slate-300 py-1.5">Dashboard</Link>
              <Link to="/kyc" onClick={() => setMobileOpen(false)} className="block text-sm text-slate-300 py-1.5">KYC Form</Link>
            </>
          )}
          {user.role === 'admin' && (
            <Link to="/admin" onClick={() => setMobileOpen(false)} className="block text-sm text-slate-300 py-1.5">Admin Dashboard</Link>
          )}
          <Link to="/notifications" onClick={() => setMobileOpen(false)} className="block text-sm text-slate-300 py-1.5">
            Notifications {unread > 0 && <span className="ml-1 text-red-400">({unread})</span>}
          </Link>
          <button onClick={handleLogout} className="block text-sm text-red-400 py-1.5">Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
