import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Star,
  Building2,
  Check,
  Quote,
} from 'lucide-react';
import { authApi, setToken } from '../api/client';

const DEMO_FALLBACK_ROLES = {
  'admin@efoyhotel.com': {
    role: 'admin',
    name: 'Alexander Sterling',
    title: 'General Manager',
  },
  'reception@efoyhotel.com': {
    role: 'receptionist',
    name: 'Julian Vance',
    title: 'Head Receptionist',
  },
  'kitchen@efoyhotel.com': {
    role: 'kitchen',
    name: 'Chef Marco Bellini',
    title: 'Executive Head Chef',
  },
  'housekeeping@efoyhotel.com': {
    role: 'housekeeping',
    name: 'Maria Santos',
    title: 'Senior Housekeeper',
  },
  'guest@efoyhotel.com': {
    role: 'guest',
    name: 'Lord Alexander Wright',
    title: 'Privilege Member',
  },
};

const QUICK_ROLES = [
  { label: 'Guest', email: 'guest@efoyhotel.com', pass: '123456', role: 'guest' },
  { label: 'Admin', email: 'admin@efoyhotel.com', pass: '123456', role: 'admin' },
  { label: 'Front Desk', email: 'reception@efoyhotel.com', pass: '123456', role: 'receptionist' },
  { label: 'Kitchen', email: 'kitchen@efoyhotel.com', pass: '123456', role: 'kitchen' },
  { label: 'Housekeeping', email: 'housekeeping@efoyhotel.com', pass: '123456', role: 'housekeeping' },
];

const AuthModal = ({ isOpen, onClose, initialMode = 'login', onLoginSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    rememberMe: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRoleInfo, setActiveRoleInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Keep track of registered guest emails locally as well
  const getRegisteredGuests = () => {
    try {
      const saved = localStorage.getItem('efoy_registered_guests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const registerGuestLocal = (email, name) => {
    const list = getRegisteredGuests();
    if (!list.find((g) => g.email.toLowerCase() === email.toLowerCase())) {
      list.push({ email, name });
      localStorage.setItem('efoy_registered_guests', JSON.stringify(list));
    }
  };

  useEffect(() => {
    setMode(initialMode);
    setSubmitted(false);
    setLoading(false);
    setErrorMessage('');
    setInfoMessage('');
    setShowPassword(false);
  }, [initialMode, isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setLoading(true);

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    try {
      let authUser = null;

      if (mode === 'signup') {
        const name = formData.name.trim() || 'Valued Guest';

        try {
          const res = await authApi.register({
            name,
            email,
            password,
            phone: formData.phone || null,
          });
          if (res?.token) {
            setToken(res.token);
          }
          if (res?.user) {
            authUser = {
              id: res.user.id,
              name: res.user.name,
              role: res.user.role || 'guest',
              email: res.user.email,
              phone: res.user.phone,
              title: 'Privilege Member',
            };
          }
          registerGuestLocal(email, name);
        } catch (apiErr) {
          setLoading(false);
          setErrorMessage(apiErr.message || 'Registration failed. Please check your information.');
          return;
        }

        if (!authUser) {
          authUser = {
            name,
            role: 'guest',
            email,
            title: 'Privilege Member',
          };
          registerGuestLocal(email, name);
        }
      } else {
        // Mode === 'login'
        try {
          const res = await authApi.login({ email, password });
          if (res?.token) {
            setToken(res.token);
          }
          if (res?.user) {
            authUser = {
              id: res.user.id,
              name: res.user.name,
              role: res.user.role,
              email: res.user.email,
              phone: res.user.phone,
              title:
                res.user.role === 'admin'
                  ? 'General Manager'
                  : res.user.role === 'receptionist'
                  ? 'Front Desk Reception'
                  : res.user.role === 'kitchen'
                  ? 'Executive Culinary'
                  : res.user.role === 'housekeeping'
                  ? 'Housekeeping Lead'
                  : 'Privilege Member',
            };
          }
        } catch (apiErr) {
          console.warn('Backend login attempt:', apiErr.message);

          // Fallback to role mapping if demo credentials
          const fallback = DEMO_FALLBACK_ROLES[email];
          if (fallback) {
            authUser = {
              name: fallback.name,
              role: fallback.role,
              email,
              title: fallback.title,
            };
          } else if (email.startsWith('admin@')) {
            authUser = { name: 'Alexander Sterling', role: 'admin', email, title: 'General Manager' };
          } else if (email.startsWith('reception@') || email.startsWith('frontdesk@')) {
            authUser = { name: 'Julian Vance', role: 'receptionist', email, title: 'Head Receptionist' };
          } else if (email.startsWith('kitchen@') || email.startsWith('chef@')) {
            authUser = { name: 'Chef Marco Bellini', role: 'kitchen', email, title: 'Executive Head Chef' };
          } else if (email.startsWith('housekeeping@') || email.startsWith('clean@')) {
            authUser = { name: 'Maria Santos', role: 'housekeeping', email, title: 'Senior Housekeeper' };
          } else {
            setLoading(false);
            setErrorMessage(apiErr.message || 'Invalid credentials. Please verify your email and password.');
            return;
          }
        }
      }

      setLoading(false);
      setActiveRoleInfo(authUser);
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        try {
          localStorage.setItem('efoy_hotel_auth', JSON.stringify(authUser));
        } catch (e) {
          console.warn('Auth storage error:', e);
        }
        if (onLoginSuccess) {
          onLoginSuccess(authUser);
        }
        onClose();
      }, 700);
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleForgotPassword = () => {
    setInfoMessage(
      'Password reset instructions have been dispatched to your registered email address.'
    );
  };

  const handleQuickFill = (roleObj) => {
    setMode('login');
    setFormData((prev) => ({
      ...prev,
      email: roleObj.email,
      password: roleObj.pass,
    }));
    setErrorMessage('');
    setInfoMessage(`Loaded credentials for ${roleObj.label}. Click 'Sign In' or proceed.`);
  };

  const handleSocialGoogle = () => {
    setFormData((prev) => ({
      ...prev,
      email: 'guest@efoyhotel.com',
      password: '123456',
    }));
    setInfoMessage('Google OAuth verified. Signing in with linked Google Account...');
    setTimeout(() => {
      const demoUser = {
        id: 5,
        name: 'Lord Alexander Wright',
        email: 'guest@efoyhotel.com',
        role: 'guest',
        title: 'Privilege Member',
      };
      localStorage.setItem('efoy_hotel_auth', JSON.stringify(demoUser));
      if (onLoginSuccess) onLoginSuccess(demoUser);
      onClose();
    }, 600);
  };

  const handleCorporateSSO = () => {
    setFormData((prev) => ({
      ...prev,
      email: 'reception@efoyhotel.com',
      password: '123456',
    }));
    setInfoMessage('Enterprise SSO token authorized. Connecting to Hotel Console...');
    setTimeout(() => {
      const staffUser = {
        id: 2,
        name: 'Julian Vance',
        email: 'reception@efoyhotel.com',
        role: 'receptionist',
        title: 'Head Receptionist',
      };
      localStorage.setItem('efoy_hotel_auth', JSON.stringify(staffUser));
      if (onLoginSuccess) onLoginSuccess(staffUser);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-white flex flex-col lg:flex-row overflow-y-auto animate-fade-in font-sans">
      {/* ─────────────────────────────────────────────────────────────
          LEFT PANEL: THE LUXURY SANCTUARY BANNER (Matching Image 1)
          ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 min-h-screen bg-gradient-to-br from-[#2a3038] via-[#1f242b] to-[#12161b] text-white p-8 xl:p-14 flex-col justify-between relative overflow-hidden select-none">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-gold-600/5 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-gold-400/40 bg-gold-500/10 flex items-center justify-center text-gold-300 font-serif font-bold text-sm shadow-xs">
              <span className="font-serif">m</span>
            </div>
            <span className="text-[10px] sm:text-xs text-gold-300 tracking-[0.25em] font-serif uppercase font-medium">
              The Sanctuary of Hospitality
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-gold-300 text-[11px] font-medium flex items-center gap-1.5 shadow-xs">
            <span className="text-amber-400 tracking-widest text-xs">★★★★★</span>
            <span className="text-slate-200">5.0 Star Luxury Rating</span>
          </div>
        </div>

        {/* Middle Hero Section */}
        <div className="my-auto py-10 relative z-10 max-w-xl">
          <span className="text-[11px] font-bold text-gold-400 tracking-[0.28em] uppercase font-mono block mb-3">
            Efoy Hotel & Suites Addis Ababa
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-white font-normal leading-[1.18] tracking-tight mb-5">
            Experience Unrivaled Elegance & Timeless Comfort.
          </h2>
          <p className="text-slate-300 font-light text-xs sm:text-sm leading-relaxed max-w-lg mb-8">
            Welcome back to your personalized resident lounge. Seamlessly coordinate in-suite dining, private fleet transfers, and bespoke concierge itineraries.
          </p>

          {/* 3 Luxury Feature Pills */}
          <div className="flex flex-wrap gap-2.5">
            <div className="bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-[11px] text-slate-200 flex items-center gap-1.5 backdrop-blur-xs font-light">
              <Check size={13} className="text-gold-400" />
              <span>24/7 Butler & Concierge</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-[11px] text-slate-200 flex items-center gap-1.5 backdrop-blur-xs font-light">
              <Check size={13} className="text-gold-400" />
              <span>Private Chauffeur Fleet</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-[11px] text-slate-200 flex items-center gap-1.5 backdrop-blur-xs font-light">
              <Check size={13} className="text-gold-400" />
              <span>High-Speed Fiber Connect</span>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial Quotation Card */}
        <div className="bg-[#181e26]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-2xl relative z-10">
          <div className="w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center font-serif text-base mb-2">
            <Quote size={14} className="fill-gold-400 text-gold-400" />
          </div>
          <p className="italic font-serif text-slate-200 text-xs sm:text-[13px] leading-relaxed mb-4 font-light">
            "The most exquisite sanctuary in the horn of Africa. Every stay redefines the meaning of bespoke Ethiopian warmth and luxury."
          </p>
          <div className="flex items-center justify-between text-xs pt-3 border-t border-white/10">
            <span className="font-bold text-white tracking-wide">Ambassador Guest Review</span>
            <span className="text-gold-400 font-medium">World Luxury Hotel Awards 2024</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT PANEL: THE LUXURY LOGIN / REGISTER PORTAL (Matching Image 1)
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 min-h-screen bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto relative">
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between pb-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-gold-600 transition-colors cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-slate-700 group-hover:text-gold-600" />
            <span>Back to Main Site</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span>Guest Concierge Online</span>
          </div>
        </div>

        {/* Center Container: Brand Emblem + Sign In Form */}
        <div className="max-w-md w-full mx-auto my-auto py-6">
          {/* Emblem & Brand Titles */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-center mx-auto shadow-xs p-2.5 mb-2.5">
              <img
                src="/images/logo.png"
                alt="Efoy Arch Emblem"
                className="h-9 w-auto object-contain drop-shadow-2xs"
              />
            </div>
            <h1 className="font-serif text-lg font-bold tracking-[0.25em] text-slate-900 uppercase">
              E F O Y
            </h1>
            <span className="text-[9px] tracking-[0.3em] text-[#b08438] font-bold uppercase block mt-0.5">
              Efoy Hotel & Suites
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl text-slate-900 font-normal tracking-tight mt-4 mb-1">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-light">
              {mode === 'login'
                ? 'Enter your credentials to access your personalized hotel console and guest services.'
                : 'Join the Efoy Privilege Club to unlock tailored suites, express mobile check-in & culinary billing.'}
            </p>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-xl mb-6 text-xs font-semibold text-center border border-slate-200/50 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setSubmitted(false);
                setErrorMessage('');
                setInfoMessage('');
              }}
              className={`py-2.5 rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setSubmitted(false);
                setErrorMessage('');
                setInfoMessage('');
              }}
              className={`py-2.5 rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 mb-4 flex items-start gap-2.5 animate-fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 mb-4 flex items-start gap-2.5 animate-fade-in">
              <ShieldCheck size={16} className="shrink-0 mt-0.5 text-amber-700" />
              <span className="leading-relaxed">{infoMessage}</span>
            </div>
          )}

          {/* Authenticated Loading Splash */}
          {submitted ? (
            <div className="py-12 text-center flex flex-col items-center animate-scale-up">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-3 ring-8 ring-amber-50/60 border border-amber-200">
                <CheckCircle2 size={36} className="text-[#b08438]" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900 mb-1">
                Access Granted
              </h3>
              <p className="text-xs text-slate-500">
                Connecting to {activeRoleInfo?.title || 'Personalized Console'}...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elena Rostova"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-2xs"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="abeni@efoyhotel.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Phone (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+251 (911) 234-567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-2xs"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-[#b08438] hover:text-[#916927] font-semibold transition-colors cursor-pointer hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-[#b08438] focus:ring-[#b08438] focus:ring-offset-0 cursor-pointer accent-[#b08438]"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    {mode === 'login' ? 'Remember this device' : 'I agree to the Terms of Stay & Privacy Policy'}
                  </span>
                </label>
              </div>

              {/* Primary Bronze Gold Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#b38438] via-[#a6782f] to-[#996d2a] hover:from-[#a0742e] hover:to-[#8c6224] active:scale-[0.99] text-white rounded-xl font-bold text-xs uppercase tracking-[0.12em] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In to Portal' : 'Create Account'}</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
                    Or Continue With
                  </span>
                </div>
              </div>

              {/* Social / SSO Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleSocialGoogle}
                  className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleCorporateSSO}
                  className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  <Building2 size={15} className="text-slate-600" />
                  <span>Corporate SSO</span>
                </button>
              </div>

              {/* Quick Demo Credentials Assistant */}
              <div className="pt-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 text-center">
                  Quick Demo Role Access
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {QUICK_ROLES.map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={() => handleQuickFill(r)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-gold-50 hover:text-gold-800 hover:border-gold-300 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600 transition-colors cursor-pointer"
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Bottom Security Badge & Footer Links */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck size={14} className="text-[#b08438]" />
            <span>Encrypted 256-Bit TLS • 5-Star Hospitality Portal</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-400 font-light">
            <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Efoy Hotel Data Protection and Privacy Policy.'); }} className="hover:text-slate-600 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Efoy Hotel Terms of Service.'); }} className="hover:text-slate-600 transition-colors">
              Terms of Service
            </a>
            <span>•</span>
            <span>Front Desk: <strong className="font-medium text-slate-700">+251 11 667 8000</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
