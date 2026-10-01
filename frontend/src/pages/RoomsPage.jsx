import React from 'react';
import { Sparkles, Shield, Wifi, Coffee, Award, ChevronRight } from 'lucide-react';
import RoomsSection from '../components/RoomsSection';
import BookingBar from '../components/BookingBar';
import Footer from '../components/Footer';

const RoomsPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      {/* Dedicated Luxury Hero Banner for Rooms & Suites */}
      <div 
        className="relative min-h-[50vh] sm:min-h-[58vh] flex flex-col justify-center bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("/images/room4.jpg")',
          backgroundPosition: 'center 40%'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/80 via-dark-900/60 to-dark-900/90 z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-white w-full">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold-400 mb-4 font-mono">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigate('home'); }} 
              className="hover:underline text-slate-300 hover:text-white transition-colors"
            >
              Home
            </a>
            <span>/</span>
            <span className="text-gold-300 font-semibold">Accommodations & Residences</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-gold-300 text-xs font-medium mb-4 shadow-sm">
            <Sparkles size={13} className="text-gold-400" />
            <span>Forbes Five-Star Certified Sanctuaries</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal leading-tight tracking-tight mb-4 max-w-3xl">
            Architectural Sanctuaries & Private Residences
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-200 font-light max-w-2xl leading-relaxed">
            Every suite is tailored with bespoke Italian furnishings, acoustic insulation, customized ambient circadian lighting, and panoramic vistas of Addis Ababa.
          </p>
        </div>
      </div>

      {/* Floating Booking Filter Bar */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 mb-6 w-full">
        <BookingBar />
      </div>

      {/* Suite Privileges Ribbon */}
      <div className="bg-white border-y border-gray-200 py-6 px-4 sm:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-3 text-slate-700">
            <Shield size={18} className="text-gold-500 shrink-0" />
            <div>
              <span className="font-bold text-dark-900 block">Best Rate Guarantee</span>
              <span className="text-gray-500 font-light text-[11px]">Direct reservation privileges</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Wifi size={18} className="text-gold-500 shrink-0" />
            <div>
              <span className="font-bold text-dark-900 block">1Gbps Dedicated Fiber</span>
              <span className="text-gray-500 font-light text-[11px]">Seamless in-suite connectivity</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Coffee size={18} className="text-gold-500 shrink-0" />
            <div>
              <span className="font-bold text-dark-900 block">Curated Mini-Bar</span>
              <span className="text-gray-500 font-light text-[11px]">Artisanal Ethiopian roasts</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Award size={18} className="text-gold-500 shrink-0" />
            <div>
              <span className="font-bold text-dark-900 block">24/7 Butler Service</span>
              <span className="text-gray-500 font-light text-[11px]">Uncompromising attention</span>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Rooms Grid Component */}
      <main className="flex-1">
        <RoomsSection />
      </main>

      {/* Luxury Footer (Universal on Every Page) */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default RoomsPage;
