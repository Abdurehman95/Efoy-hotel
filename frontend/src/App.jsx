// Grand Horizon Hotel & Suites - Main Application Layout
// Features responsive hero banner, dynamic reservation bar, modular sections, and authenticated Admin Dashboard
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RoomsSection from './components/RoomsSection';
import AboutSection from './components/AboutSection';
import DiningSection from './components/DiningSection';
import ServicesSection from './components/ServicesSection';
import ContactSection from './components/ContactSection';
import AdminDashboard from './components/admin/AdminDashboard';
import { ShieldAlert } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('efoy_hotel_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState(() => {
    try {
      const saved = localStorage.getItem('efoy_hotel_auth');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed?.role === 'admin' && (window.location.hash === '#admin' || window.location.pathname.includes('/admin'))) {
        return 'admin';
      }
    } catch {
      // fallback
    }
    return 'home';
  });

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin' && currentUser?.role === 'admin') {
        setCurrentView('admin');
      } else if (window.location.hash === '' || window.location.hash === '#') {
        if (currentView !== 'admin') {
          setCurrentView('home');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser, currentView]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user?.role === 'admin') {
      setCurrentView('admin');
      window.location.hash = 'admin';
    } else {
      setCurrentView('home');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('home');
    localStorage.removeItem('efoy_hotel_auth');
    if (window.location.hash === '#admin') {
      window.location.hash = '';
    }
  };

  const handleBackToSite = () => {
    setCurrentView('home');
    if (window.location.hash === '#admin') {
      window.location.hash = '';
    }
  };

  // If user is admin and current view is admin, display the Admin Dashboard matching admin.png
  if (currentView === 'admin' && currentUser?.role === 'admin') {
    return (
      <AdminDashboard
        user={currentUser}
        onLogout={handleLogout}
        onBackToSite={handleBackToSite}
      />
    );
  }

  // Home Landing Page (completely preserved)
  return (
    <div className="min-h-screen bg-white overflow-x-hidden relative">
      {/* Floating Admin Banner shortcut when logged in as admin on public site */}
      {currentUser?.role === 'admin' && (
        <div className="bg-slate-900 text-white text-xs px-4 py-2 flex items-center justify-between z-50 sticky top-0 border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-amber-400">Admin Mode Active:</span>
            <span className="text-slate-300">Logged in as {currentUser.name} ({currentUser.email})</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentView('admin');
                window.location.hash = 'admin';
              }}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1 rounded text-xs transition-colors cursor-pointer"
            >
              Open Admin Dashboard →
            </button>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
            >
              Log Out
            </button>
          </div>
        </div>
      )}

      <Navbar
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onNavigateToAdmin={() => {
          setCurrentView('admin');
          window.location.hash = 'admin';
        }}
      />
      
      <main>
        {/* Hero Section with public image background */}
        <div 
          className="relative min-h-[80vh] lg:min-h-[85vh] flex flex-col items-center justify-center bg-cover bg-center transition-all duration-700"
          style={{ 
            backgroundImage: 'url("/images/room2.jpg")',
            backgroundPosition: 'center 45%'
          }}
        >
          {/* Subtle dark gradient overlay for optimal readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-900/70 via-dark-900/50 to-dark-900/85 z-10"></div>
          
          <div className="relative z-20 text-center text-white px-4 sm:px-6 max-w-4xl pt-12 sm:pt-16 pb-12 sm:pb-20 lg:pb-28">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-4 sm:mb-6 shadow-sm">
              <span className="text-gold-500 font-serif text-sm">★</span>
              <p className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-gray-100">
                Forbes Five Star <span className="mx-1 text-gold-500">•</span> Leading Hotels of the World
              </p>
            </div>
            
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif mb-4 sm:mb-6 leading-tight tracking-tight drop-shadow-md">
              Stay somewhere exceptional.
            </h2>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-light text-gray-200 max-w-2xl mx-auto mb-8 sm:mb-10 drop-shadow-sm leading-relaxed px-2">
              Experience uncompromising comfort, architectural elegance, and intuitive white-glove hospitality along the pristine San Francisco waterfront.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
              <a 
                href="#rooms" 
                className="w-full sm:w-auto bg-gold-500 hover:bg-gold-600 text-white px-7 sm:px-8 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-gold-500/25 cursor-pointer flex items-center justify-center gap-2 rounded-xs"
              >
                Book Your Stay <span className="text-base">→</span>
              </a>
              <a 
                href="#rooms" 
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-7 sm:px-8 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 rounded-xs"
              >
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-white/60 flex items-center justify-center text-[8px] sm:text-[10px]">▶</span> Explore Rooms & Suites
              </a>
            </div>
          </div>

          {/* Booking Bar Component - fully responsive */}
          <div className="relative z-30 w-full max-w-6xl px-4 mb-8 lg:-mb-16 lg:mt-auto">
            {/* Perks banner above bar */}
            <div className="flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] text-gray-300 uppercase tracking-widest px-2 sm:px-4 pb-2 font-medium gap-2">
              <span className="text-gold-500 font-semibold tracking-[0.2em] flex items-center gap-1">
                ★ Direct Reservation Perks
              </span>
              <div className="flex items-center gap-3 sm:gap-4 text-gray-300">
                <span>✓ Best Rate Guaranteed</span>
                <span className="hidden md:inline">• Complimentary Valet & Welcome Cocktails</span>
              </div>
            </div>

            {/* Booking fields */}
            <div className="bg-white rounded-xl shadow-2xl p-3 sm:p-4 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
              {/* Check-in */}
              <div className="p-3 border-b sm:border-b-0 sm:border-r border-gray-100 hover:bg-gray-50/80 rounded transition-colors">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Check-in</label>
                <input 
                  type="date" 
                  defaultValue="2026-09-15"
                  className="w-full text-xs sm:text-sm font-semibold text-dark-900 focus:outline-none bg-transparent cursor-pointer"
                />
              </div>

              {/* Check-out */}
              <div className="p-3 border-b sm:border-b-0 lg:border-r border-gray-100 hover:bg-gray-50/80 rounded transition-colors">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Check-out</label>
                <input 
                  type="date" 
                  defaultValue="2026-09-20"
                  className="w-full text-xs sm:text-sm font-semibold text-dark-900 focus:outline-none bg-transparent cursor-pointer"
                />
              </div>

              {/* Guests & Suites */}
              <div className="p-3 border-b sm:border-b-0 sm:border-r border-gray-100 hover:bg-gray-50/80 rounded transition-colors">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Guests & Suites</label>
                <select className="w-full text-xs sm:text-sm font-semibold text-dark-900 focus:outline-none bg-transparent cursor-pointer">
                  <option>2 Adults, 1 Suite</option>
                  <option>1 Adult, 1 Suite</option>
                  <option>2 Adults, 2 Suites</option>
                  <option>Family (4 Guests, 2 Suites)</option>
                </select>
              </div>

              {/* Preferred Tier */}
              <div className="p-3 hover:bg-gray-50/80 rounded transition-colors">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Preferred Tier</label>
                <select className="w-full text-xs sm:text-sm font-semibold text-gold-600 focus:outline-none bg-transparent cursor-pointer">
                  <option>Horizon Member Tier</option>
                  <option>Standard Rate</option>
                  <option>Forbes Executive VIP</option>
                </select>
              </div>

              {/* Action Button */}
              <div className="p-1 sm:col-span-2 lg:col-span-1">
                <a 
                  href="#rooms" 
                  className="w-full h-12 bg-dark-900 hover:bg-gold-600 text-white font-semibold text-xs uppercase tracking-widest flex items-center justify-center rounded transition-all duration-300 shadow-sm cursor-pointer"
                >
                  Check Availability
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Spacing for overlapping booking bar on large screens */}
        <div className="hidden lg:block h-20 bg-[#fafafa]"></div>

        {/* Dynamic Sections */}
        <RoomsSection />
        <AboutSection />
        <DiningSection />
        <ServicesSection />
        <ContactSection />
      </main>
    </div>
  );
}

export default App;
