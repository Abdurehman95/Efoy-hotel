// Grand Horizon Hotel & Suites - Main Application Layout
// Features modular dedicated pages for Home, Rooms, Dining, Services, and Contact,
// each with a five-star luxury Footer, plus authenticated Dashboards for all 5 PMS roles
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import DiningPage from './pages/DiningPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
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
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const saved = localStorage.getItem('efoy_hotel_auth');
      const parsed = saved ? JSON.parse(saved) : null;
      
      if (parsed?.role && hash === parsed.role) {
        return parsed.role;
      }
      if (['rooms', 'dining', 'services', 'contact', 'home'].includes(hash)) {
        return hash;
      }
    } catch {
      // fallback
    }
    return 'home';
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sync hash changes across page views and authenticated dashboards
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace('#', '').toLowerCase();
      
      if (['admin', 'receptionist', 'kitchen', 'housekeeping', 'guest'].includes(rawHash)) {
        if (currentUser && currentUser.role === rawHash) {
          setCurrentView(rawHash);
          return;
        }
      }
      
      if (['rooms', 'dining', 'services', 'contact', 'home'].includes(rawHash)) {
        setCurrentView(rawHash);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (rawHash === 'about-us') {
        setCurrentView('home');
        setTimeout(() => {
          const el = document.getElementById('about-us');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      } else if (!rawHash) {
        setCurrentView('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  const handleNavigate = (viewId) => {
    setCurrentView(viewId);
    if (viewId === 'home') {
      window.location.hash = '';
    } else {
      window.location.hash = viewId;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Render role-specific dashboards when active and user is authenticated
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

  // Render Page Content based on currentView (Home, Rooms, Dining, Services, Contact)
  const renderCurrentPage = () => {
    switch (currentView) {
      case 'rooms':
        return <RoomsPage onNavigate={handleNavigate} />;
      case 'dining':
        return <DiningPage onNavigate={handleNavigate} />;
      case 'services':
        return <ServicesPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage onNavigate={handleNavigate} />;
      case 'home':
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden relative flex flex-col">
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
      {/* Fixed Navigation & Operational Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50">
        {currentUser && (
          <div className="bg-dark-900 text-white text-xs px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-b border-gold-500/30 shadow-xs">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-center sm:text-left">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-medium text-gold-500">
                {currentUser.role === 'admin' && '👑 Admin Mode Active:'}
                {currentUser.role === 'receptionist' && '🔔 Front Desk Active:'}
                {currentUser.role === 'kitchen' && '👨‍🍳 Kitchen KDS Active:'}
                {currentUser.role === 'housekeeping' && '🧹 Housekeeping Active:'}
                {currentUser.role === 'guest' && '👤 Member Portal Active:'}
              </span>
              <span className="text-gray-300 hidden md:inline">Logged in as {currentUser.name} ({currentUser.email})</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => handleNavigateToDashboard(currentUser.role)}
                className="bg-gold-500 hover:bg-gold-600 text-white font-semibold px-3 py-1 rounded text-xs transition-colors cursor-pointer shadow-xs"
              >
                Open {currentUser.role === 'admin' ? 'Admin Dashboard' : currentUser.role === 'receptionist' ? 'Front Desk' : currentUser.role === 'kitchen' ? 'Kitchen KDS' : currentUser.role === 'housekeeping' ? 'Housekeeping Hub' : 'Guest Portal'} →
              </button>
              <button
                onClick={promptLogout}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xs"
              >
                Log Out
              </button>
            </div>
          </div>
        )}

        <Navbar
          currentUser={currentUser}
          currentView={currentView}
          onNavigate={handleNavigate}
          onLoginSuccess={handleLoginSuccess}
          onLogout={promptLogout}
          onNavigateToAdmin={() => handleNavigateToDashboard('admin')}
          onNavigateToDashboard={handleNavigateToDashboard}
        />
      </header>

      {/* Spacer to prevent page content from being obscured under the fixed header */}
      <div className={currentUser ? "h-[128px] sm:h-[136px]" : "h-[74px] sm:h-[84px]"} aria-hidden="true" />
      
      {/* Individual Page View with universal Footer */}
      <main className="flex-1 flex flex-col">
        {renderCurrentPage()}
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
