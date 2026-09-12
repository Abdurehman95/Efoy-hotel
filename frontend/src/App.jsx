// Grand Horizon Hotel & Suites - Main Application Layout
// Features responsive hero banner, dynamic reservation bar, modular sections, and authenticated Dashboards for all 5 roles
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RoomsSection from './components/RoomsSection';
import AboutSection from './components/AboutSection';
import DiningSection from './components/DiningSection';
import ServicesSection from './components/ServicesSection';
import ContactSection from './components/ContactSection';
import AdminDashboard from './components/admin/AdminDashboard';
import ReceptionistDashboard from './components/receptionist/ReceptionistDashboard';
import KitchenDashboard from './components/kitchen/KitchenDashboard';
import HousekeepingDashboard from './components/housekeeping/HousekeepingDashboard';
import GuestDashboard from './components/guest/GuestDashboard';
import ConfirmModal from './components/shared/ConfirmModal';
import { HotelProvider } from './context/HotelContext';

function AppContent() {
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
      if (parsed?.role) {
        const hash = window.location.hash.replace('#', '');
        if (hash === parsed.role) {
          return parsed.role;
        }
      }
    } catch {
      // fallback
    }
    return 'home';
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (currentUser && ['admin', 'receptionist', 'kitchen', 'housekeeping', 'guest'].includes(hash)) {
        if (currentUser.role === hash) {
          setCurrentView(hash);
        }
      } else if (window.location.hash === '' || window.location.hash === '#') {
        if (currentView !== 'home') {
          setCurrentView('home');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser, currentView]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    const targetView = user?.role || 'home';
    setCurrentView(targetView);
    window.location.hash = targetView;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('home');
    localStorage.removeItem('efoy_hotel_auth');
    window.location.hash = '';
  };

  const promptLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  const handleBackToSite = () => {
    setCurrentView('home');
    window.location.hash = '';
  };

  const handleNavigateToDashboard = (role) => {
    const target = role || currentUser?.role;
    if (target) {
      setCurrentView(target);
      window.location.hash = target;
    }
  };

  // Render role-specific dashboards when active and user authenticated
  if (currentUser) {
    let dashboardElement = null;

    if (currentView === 'admin' && currentUser.role === 'admin') {
      dashboardElement = (
        <AdminDashboard
          user={currentUser}
          onLogout={promptLogout}
          onBackToSite={handleBackToSite}
        />
      );
    } else if (currentView === 'receptionist' && currentUser.role === 'receptionist') {
      dashboardElement = (
        <ReceptionistDashboard
          user={currentUser}
          onLogout={promptLogout}
          onBackToSite={handleBackToSite}
        />
      );
    } else if (currentView === 'kitchen' && currentUser.role === 'kitchen') {
      dashboardElement = (
        <KitchenDashboard
          user={currentUser}
          onLogout={promptLogout}
          onBackToSite={handleBackToSite}
        />
      );
    } else if (currentView === 'housekeeping' && currentUser.role === 'housekeeping') {
      dashboardElement = (
        <HousekeepingDashboard
          user={currentUser}
          onLogout={promptLogout}
          onBackToSite={handleBackToSite}
        />
      );
    } else if (currentView === 'guest' && currentUser.role === 'guest') {
      dashboardElement = (
        <GuestDashboard
          user={currentUser}
          onLogout={promptLogout}
          onBackToSite={handleBackToSite}
        />
      );
    }

    if (dashboardElement) {
      return (
        <>
          {dashboardElement}
          <ConfirmModal
            isOpen={showLogoutConfirm}
            onClose={() => setShowLogoutConfirm(false)}
            onConfirm={confirmLogout}
            title="Confirm Logout"
            message="Are you sure you want to end your current session and sign out of the portal?"
            confirmText="Yes, Log Out"
            cancelText="Cancel"
            variant="danger"
            icon="logout"
          />
        </>
      );
    }
  }

  // Home Landing Page (completely preserved and intact)
  return (
    <div className="min-h-screen bg-white overflow-x-hidden relative">
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to end your current session and sign out of the portal?"
        confirmText="Yes, Log Out"
        cancelText="Cancel"
        variant="danger"
        icon="logout"
      />
      {/* Floating Role Banner shortcut when logged in on public site */}
      {currentUser && (
        <div className="bg-slate-900 text-white text-xs px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 z-50 sticky top-0 border-b border-amber-500/30">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-center sm:text-left">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="font-medium text-amber-400">
              {currentUser.role === 'admin' && '👑 Admin Mode Active:'}
              {currentUser.role === 'receptionist' && '🔔 Front Desk Active:'}
              {currentUser.role === 'kitchen' && '👨‍🍳 Kitchen KDS Active:'}
              {currentUser.role === 'housekeeping' && '🧹 Housekeeping Active:'}
              {currentUser.role === 'guest' && '👤 Member Portal Active:'}
            </span>
            <span className="text-slate-300 hidden md:inline">Logged in as {currentUser.name} ({currentUser.email})</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => handleNavigateToDashboard(currentUser.role)}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1 rounded text-xs transition-colors cursor-pointer"
            >
              Open {currentUser.role === 'admin' ? 'Admin Dashboard' : currentUser.role === 'receptionist' ? 'Front Desk' : currentUser.role === 'kitchen' ? 'Kitchen KDS' : currentUser.role === 'housekeeping' ? 'Housekeeping Hub' : 'Guest Portal'} →
            </button>
            <button
              onClick={promptLogout}
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
        onLogout={promptLogout}
        onNavigateToAdmin={() => handleNavigateToDashboard('admin')}
        onNavigateToDashboard={handleNavigateToDashboard}
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
            
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif mb-4 sm:mb-6 leading-tight tracking-tight drop-shadow-md text-white">
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

export default function App() {
  return (
    <HotelProvider>
      <AppContent />
    </HotelProvider>
  );
}
