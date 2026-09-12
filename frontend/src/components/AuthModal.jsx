import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowRight, CheckCircle2, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'admin',
    label: '👑 Admin (Manager)',
    email: 'admin@efoyhotel.com',
    password: 'admin123',
    name: 'Alexander Sterling',
    title: 'General Manager',
    badge: 'Admin Panel',
  },
  {
    role: 'receptionist',
    label: '🔔 Receptionist',
    email: 'reception@efoyhotel.com',
    password: 'recep123',
    name: 'Julian Vance',
    title: 'Head Receptionist',
    badge: 'Front Desk',
  },
  {
    role: 'kitchen',
    label: '👨‍🍳 Kitchen Staff',
    email: 'kitchen@efoyhotel.com',
    password: 'chef123',
    name: 'Chef Marco Bellini',
    title: 'Executive Head Chef',
    badge: 'Live KDS',
  },
  {
    role: 'housekeeping',
    label: '🧹 Housekeeping',
    email: 'housekeeping@efoyhotel.com',
    password: 'clean123',
    name: 'Maria Santos',
    title: 'Senior Housekeeper',
    badge: 'Turnover Hub',
  },
  {
    role: 'guest',
    label: '👤 Customer (Guest)',
    email: 'guest@efoyhotel.com',
    password: 'guest123',
    name: 'Lord Alexander Wright',
    title: 'Privilege Member',
    badge: 'Guest Portal (Must Sign Up First)',
    requiresSignUp: true,
  },
];

const AuthModal = ({ isOpen, onClose, initialMode = 'login', onLoginSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rememberMe: true,
  });
  const [submitted, setSubmitted] = useState(false);
  const [activeRoleInfo, setActiveRoleInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Keep track of registered guest emails in localStorage
  const getRegisteredGuests = () => {
    try {
      const saved = localStorage.getItem('efoy_registered_guests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const registerGuest = (email, name) => {
    const list = getRegisteredGuests();
    if (!list.find((g) => g.email === email)) {
      list.push({ email, name });
      localStorage.setItem('efoy_registered_guests', JSON.stringify(list));
    }
  };

  useEffect(() => {
    setMode(initialMode);
    setSubmitted(false);
    setErrorMessage('');
  }, [initialMode, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const email = formData.email.trim().toLowerCase();

    // Determine role from demo credentials or default logic
    let matchedDemo = DEMO_ACCOUNTS.find((d) => d.email.toLowerCase() === email);

    // If user is logging in as guest, requirement specifies: "in the guest page user first must sign up before logged in"
    if (mode === 'login' && (!matchedDemo || matchedDemo.role === 'guest')) {
      const registered = getRegisteredGuests();
      const hasSignedUp = registered.some((g) => g.email.toLowerCase() === email);

      if (!hasSignedUp) {
        setErrorMessage(
          'Security Requirement: Guests must sign up first before logging in! Please click the "Sign Up" tab above to create your guest account.'
        );
        return;
      }
    }

    let userRole = 'guest';
    let userName = formData.name || 'Alexander Wright';
    let userTitle = 'Horizon Member';

    if (matchedDemo) {
      userRole = matchedDemo.role;
      userName = matchedDemo.name;
      userTitle = matchedDemo.title;
    } else if (email.startsWith('admin@')) {
      userRole = 'admin';
      userName = formData.name || 'Alexander Sterling';
      userTitle = 'General Manager';
    } else if (email.startsWith('reception@') || email.startsWith('frontdesk@')) {
      userRole = 'receptionist';
      userName = formData.name || 'Julian Vance';
      userTitle = 'Receptionist';
    } else if (email.startsWith('kitchen@') || email.startsWith('chef@')) {
      userRole = 'kitchen';
      userName = formData.name || 'Chef Marco Bellini';
      userTitle = 'Kitchen Brigade';
    } else if (email.startsWith('housekeeping@') || email.startsWith('clean@')) {
      userRole = 'housekeeping';
      userName = formData.name || 'Maria Santos';
      userTitle = 'Housekeeper';
    } else {
      userRole = 'guest';
    }

    if (mode === 'signup') {
      registerGuest(email, userName);
    }

    const authUser = {
      name: userName,
      role: userRole,
      email: formData.email,
      title: userTitle,
    };

    setActiveRoleInfo(authUser);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      localStorage.setItem('efoy_hotel_auth', JSON.stringify(authUser));
      if (onLoginSuccess) {
        onLoginSuccess(authUser);
      }
      onClose();
    }, 800);
  };

  const fillDemoAccount = (demo) => {
    setErrorMessage('');
    if (demo.role === 'guest') {
      // Prompt user to sign up as requested by the rule
      setMode('signup');
      setFormData({
        name: demo.name,
        email: demo.email,
        password: demo.password,
        rememberMe: true,
      });
    } else {
      setMode('login');
      setFormData({
        name: demo.name,
        email: demo.email,
        password: demo.password,
        rememberMe: true,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gold bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="p-6 sm:p-8">
          {/* Brand Header */}
          <div className="text-center mb-5">
            <span className="text-[10px] tracking-[0.25em] text-amber-600 uppercase font-bold block mb-1">
              Grand Horizon Hotel & Suites
            </span>
            <h3 className="font-serif text-2xl text-slate-900 font-bold">
              {mode === 'login' ? 'Authentication Portal' : 'Create Guest Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'login'
                ? 'Select a demo persona below or sign in to access your operational console.'
                : 'Guests must sign up first to access the room booking and in-room dining portal.'}
            </p>
          </div>

          {/* Quick Demo Personas Selector */}
          <div className="mb-5 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                ★ 1-Click Demo Accounts (All 5 Roles)
              </span>
              <span className="text-[10px] text-amber-600 font-medium">Click to Auto-Fill</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {DEMO_ACCOUNTS.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => fillDemoAccount(demo)}
                  className="px-2.5 py-1.5 bg-white hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 rounded-lg text-left text-xs transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="font-semibold text-slate-900 text-[11px] group-hover:text-amber-800">
                    {demo.label}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    {demo.email.split('@')[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tabs: Login / Sign Up */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg mb-5 text-sm">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setSubmitted(false);
                setErrorMessage('');
              }}
              className={`py-2 text-center rounded-md font-medium transition-all duration-200 cursor-pointer text-xs ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Log In (Staff & Registered Guests)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setSubmitted(false);
                setErrorMessage('');
              }}
              className={`py-2 text-center rounded-md font-medium transition-all duration-200 cursor-pointer text-xs ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign Up (Guest Registration First)
            </button>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 mb-4 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {submitted ? (
            <div className="py-8 text-center flex flex-col items-center">
              <CheckCircle2 size={48} className="text-amber-600 mb-3 animate-bounce" />
              <h4 className="font-serif text-lg font-bold text-slate-900 mb-1">
                Authorized - Entering {activeRoleInfo?.title || 'Dashboard'}
              </h4>
              <p className="text-xs text-slate-500">
                Welcome, {activeRoleInfo?.name} ({activeRoleInfo?.role.toUpperCase()})
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lord Alexander Wright"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@efoyhotel.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
              >
                <span>{mode === 'login' ? 'Authenticate & Enter Dashboard' : 'Complete Sign-Up & Enter Guest Portal'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
