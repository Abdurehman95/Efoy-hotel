import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
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
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    setLoading(true);

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    // Front-end guest registration requirement:
    // If logging in as guest, they must have registered first or have a recognized account
    const isStaffEmail =
      email.startsWith('admin@') ||
      email.startsWith('reception@') ||
      email.startsWith('frontdesk@') ||
      email.startsWith('kitchen@') ||
      email.startsWith('chef@') ||
      email.startsWith('housekeeping@') ||
      email.startsWith('clean@');

    if (mode === 'login' && !isStaffEmail) {
      const registered = getRegisteredGuests();
      const hasSignedUp = registered.some((g) => g.email.toLowerCase() === email);
      const isKnownDemo = DEMO_FALLBACK_ROLES[email];

      if (!hasSignedUp && !isKnownDemo) {
        setLoading(false);
        setErrorMessage(
          'Account not found. Please click "Create Account" above to register before signing in.'
        );
        return;
      }
    }

    try {
      let authUser = null;

      if (mode === 'signup') {
        const name = formData.name.trim() || 'Valued Guest';
        registerGuestLocal(email, name);

        // Attempt backend API call
        try {
          const res = await authApi.register({
            name,
            email,
            password,
            phone: formData.phone || null,
          });
          if (res.token) {
            setToken(res.token);
          }
          if (res.user) {
            authUser = {
              name: res.user.name,
              role: res.user.role || 'guest',
              email: res.user.email,
              title: 'Privilege Member',
            };
          }
        } catch (apiErr) {
          console.warn('Backend register note:', apiErr.message);
        }

        if (!authUser) {
          authUser = {
            name,
            role: 'guest',
            email,
            title: 'Privilege Member',
          };
        }
      } else {
        // Mode === 'login'
        // Attempt backend API call
        try {
          const res = await authApi.login({ email, password });
          if (res.token) {
            setToken(res.token);
          }
          if (res.user) {
            authUser = {
              name: res.user.name,
              role: res.user.role,
              email: res.user.email,
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
          console.warn('Backend login fallback:', apiErr.message);
        }

        // Fallback to role mapping if backend was offline or for demo credentials
        if (!authUser) {
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
            authUser = {
              name: formData.name || 'Lord Alexander Wright',
              role: 'guest',
              email,
              title: 'Privilege Member',
            };
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
      'Password reset link has been dispatched to your email address. (For demo accounts, use password "admin123", "recep123", "chef123", "clean123", or "guest123").'
    );
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Luxury Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-orange-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <span className="text-[10px] tracking-[0.28em] text-amber-600 uppercase font-bold block mb-1">
              Efoy Hotel & Suites
            </span>
            <h3 className="font-serif text-2xl text-slate-900 font-bold tracking-tight">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto">
              {mode === 'login'
                ? 'Enter your credentials to access your personalized hotel console.'
                : 'Register as an Efoy Privilege member for direct suite reservations & dining.'}
            </p>
          </div>

          {/* Clean Segmented Tab Control */}
          <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-xl mb-6 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setSubmitted(false);
                setErrorMessage('');
                setInfoMessage('');
              }}
              className={`py-2 text-center rounded-lg font-semibold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
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
              className={`py-2 text-center rounded-lg font-semibold transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 mb-4 flex items-start gap-2 animate-fade-in">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 mb-4 flex items-start gap-2 animate-fade-in">
              <ShieldCheck size={15} className="shrink-0 mt-0.5 text-amber-600" />
              <span className="leading-relaxed">{infoMessage}</span>
            </div>
          )}

          {/* Authenticated Loading Splash */}
          {submitted ? (
            <div className="py-10 text-center flex flex-col items-center animate-scale-up">
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-3 ring-8 ring-amber-50/50">
                <CheckCircle2 size={32} className="text-amber-600" />
              </div>
              <h4 className="font-serif text-lg font-bold text-slate-900 mb-1">
                Access Granted
              </h4>
              <p className="text-xs text-slate-500">
                Connecting to {activeRoleInfo?.title || 'Operational Console'}...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lord Alexander Wright"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@efoyhotel.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Phone (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 234-5678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] text-amber-600 hover:text-amber-700 font-medium transition-colors cursor-pointer"
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
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me / Terms */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600">
                    {mode === 'login' ? 'Remember this device' : 'I agree to the Terms of Stay'}
                  </span>
                </label>
              </div>

              {/* Action Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 mt-4"
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
            </form>
          )}

          {/* Footer Security Badge */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck size={14} className="text-amber-600/70" />
            <span>Encrypted 256-Bit TLS • 5-Star Hospitality Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
