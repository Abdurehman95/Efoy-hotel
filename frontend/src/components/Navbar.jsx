// Grand Horizon Hotel & Suites - Primary Navigation Component
// Supports sticky luxury glassmorphism, responsive mobile drawer, and Auth modal
import React, { useState } from 'react';
import { User, Menu, X, CalendarCheck, Phone } from 'lucide-react';
import AuthModal from './AuthModal';

const Navbar = ({ currentUser, onLoginSuccess, onLogout, onNavigateToAdmin, onNavigateToDashboard }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'Rooms', href: '#rooms' },
    { label: 'Dining', href: '#dining' },
    { label: 'Services', href: '#services' },
    { label: 'About Us', href: '#about-us' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all">
        {/* Brand Logo */}
        <a href="#" className="flex flex-col items-start sm:items-center justify-center cursor-pointer group">
          <h1 className="font-serif text-xl sm:text-2xl tracking-widest text-dark-900 uppercase leading-none group-hover:text-gold-600 transition-colors">
            Grand Horizon
          </h1>
          <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-gray-500 uppercase mt-1">
            Hotel & Suites
          </span>
        </a>

        {/* Center Desktop Links */}
        <div className="hidden lg:flex items-center space-x-8 xl:space-x-10">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-gray-600 hover:text-dark-900 transition-colors relative group py-1"
            >
              {item.label}
              <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-dark-900 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </div>

        {/* Right side Desktop actions */}
        <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
          <a
            href="#rooms"
            className="text-sm font-medium text-gray-600 hover:text-dark-900 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CalendarCheck size={16} className="text-gold-600" />
            <span>My Booking</span>
          </a>

          {/* Login and Sign Up / Role Dashboard controls */}
          {currentUser ? (
            <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
              <button
                onClick={() => (onNavigateToDashboard ? onNavigateToDashboard(currentUser.role) : onNavigateToAdmin())}
                className="text-xs font-semibold bg-[#c2410c] hover:bg-[#9a3412] text-white px-3 py-1.5 rounded transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <span>
                  {currentUser.role === 'admin' && '👑 Admin Panel'}
                  {currentUser.role === 'receptionist' && '🔔 Front Desk'}
                  {currentUser.role === 'kitchen' && '👨‍🍳 Kitchen KDS'}
                  {currentUser.role === 'housekeeping' && '🧹 Housekeeping'}
                  {currentUser.role === 'guest' && '👤 My Guest Portal'}
                </span>
              </button>
              <button
                onClick={onLogout}
                className="text-xs font-medium text-gray-600 hover:text-red-600 px-2 py-1.5 transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
              <button
                onClick={() => handleOpenAuth('login')}
                className="text-sm font-medium text-gray-700 hover:text-dark-900 px-3 py-1.5 rounded transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => handleOpenAuth('signup')}
                className="text-sm font-medium text-dark-900 border border-dark-900 hover:bg-dark-900 hover:text-white px-4 py-1.5 rounded-sm transition-all duration-200 cursor-pointer shadow-xs"
              >
                Sign Up
              </button>
            </div>
          )}

          <div className="flex items-center space-x-3 pl-2">
            <a
              href="#rooms"
              className="bg-dark-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-gold-600 transition-colors duration-300 cursor-pointer shadow-sm rounded-xs flex items-center gap-2"
            >
              Book Now
            </a>
            <button
              onClick={() => handleOpenAuth('login')}
              aria-label="Guest Account"
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-dark-900 transition-colors cursor-pointer"
            >
              <User size={18} />
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Right Controls */}
        <div className="flex lg:hidden items-center gap-2 sm:gap-3">
          {/* Quick Book CTA on Mobile */}
          <a
            href="#rooms"
            className="bg-dark-900 text-white text-xs font-semibold px-3.5 py-2 rounded-xs uppercase tracking-wider hover:bg-gold-600 transition-colors"
          >
            Book
          </a>

          {/* User Icon Button */}
          <button
            onClick={() => handleOpenAuth('login')}
            aria-label="User Account"
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <User size={17} />
          </button>

          {/* Mobile Hamburger / Close Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="w-10 h-10 flex items-center justify-center text-dark-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer / Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-dark-900/50 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="bg-white border-b border-gray-200 px-6 pt-5 pb-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header in drawer */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <span className="text-[10px] tracking-[0.2em] text-gold-600 uppercase font-semibold block">
                  Five-Star Luxury
                </span>
                <span className="font-serif text-lg text-dark-900">
                  Grand Horizon
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-1.5 text-gray-400 hover:text-dark-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex flex-col space-y-3 mb-6">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={handleNavClick}
                  className="text-base font-medium text-gray-800 hover:text-gold-600 hover:pl-2 transition-all py-1.5 border-b border-gray-50 flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <span className="text-gray-400 text-xs">→</span>
                </a>
              ))}
              <a
                href="#rooms"
                onClick={handleNavClick}
                className="text-base font-medium text-gray-800 hover:text-gold-600 hover:pl-2 transition-all py-1.5 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <CalendarCheck size={16} className="text-gold-600" />
                  My Booking
                </span>
                <span className="text-gray-400 text-xs">→</span>
              </a>
            </div>

            {/* Auth Buttons: Side-by-Side Login and Sign Up / Admin */}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-2">
                Horizon Circle Access
              </span>
              {currentUser ? (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onNavigateToDashboard) {
                        onNavigateToDashboard(currentUser.role);
                      } else {
                        onNavigateToAdmin();
                      }
                    }}
                    className="w-full py-2.5 px-3 text-center rounded bg-[#c2410c] text-white font-medium text-xs hover:bg-[#9a3412] transition-colors cursor-pointer shadow-sm"
                  >
                    {currentUser.role === 'admin' && 'Admin Panel'}
                    {currentUser.role === 'receptionist' && 'Front Desk'}
                    {currentUser.role === 'kitchen' && 'Kitchen KDS'}
                    {currentUser.role === 'housekeeping' && 'Housekeeping'}
                    {currentUser.role === 'guest' && 'My Guest Portal'}
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full py-2.5 px-3 text-center rounded border border-gray-300 font-medium text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="w-full py-2.5 px-4 text-center rounded border border-gray-300 font-medium text-sm text-dark-900 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => handleOpenAuth('signup')}
                    className="w-full py-2.5 px-4 text-center rounded bg-dark-900 text-white font-medium text-sm hover:bg-dark-800 transition-colors cursor-pointer shadow-sm"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Full CTA Button */}
              <a
                href="#rooms"
                onClick={handleNavClick}
                className="block w-full py-3.5 text-center bg-gold-500 hover:bg-gold-600 text-white font-semibold text-xs uppercase tracking-widest rounded transition-colors shadow-sm"
              >
                Book Your Stay Online
              </a>

              {/* Concierge phone */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-gold-600" />
                  24/7 Concierge
                </span>
                <a href="tel:+18005550199" className="font-semibold text-dark-900 hover:text-gold-600">
                  +1 (800) 555-0199
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onLoginSuccess={onLoginSuccess}
      />
    </>
  );
};

export default Navbar;

