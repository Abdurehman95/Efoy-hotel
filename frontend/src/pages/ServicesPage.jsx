import React from 'react';
import { Sparkles, Key, Car, Bath, HeartHandshake, Droplets, ShieldCheck } from 'lucide-react';
import ServicesSection from '../components/ServicesSection';
import Footer from '../components/Footer';

const ServicesPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      {/* Dedicated Luxury Hero Banner for Services & Wellness */}
      <div 
        className="relative min-h-[50vh] sm:min-h-[58vh] flex flex-col justify-center bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("/images/room8.jpg")',
          backgroundPosition: 'center 50%'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/85 via-dark-900/65 to-dark-900/90 z-10" />

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
            <span className="text-gold-300 font-semibold">White-Glove Services & Spa</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-gold-300 text-xs font-medium mb-4 shadow-sm">
            <HeartHandshake size={13} className="text-gold-400" />
            <span>Les Clefs d'Or Certified Concierge</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal leading-tight tracking-tight mb-4 max-w-3xl">
            Curated Comfort & Restorative Hydrotherapy
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-200 font-light max-w-2xl leading-relaxed">
            Experience our 25-meter Roman travertine vitality plunge pool, bespoke Finnish eucalyptus steam rituals, and our fleet of private chauffeur-driven Mercedes-Benz sedans.
          </p>
        </div>
      </div>

      {/* Services Privileges Ribbon */}
      <div className="bg-white border-y border-gray-200 py-6 px-4 sm:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-3 text-slate-700">
            <Car size={18} className="text-gold-500 shrink-0" />
            <div>
              <span className="font-bold text-dark-900 block">Mercedes Chauffeur Fleet</span>
              <span className="text-gray-500 font-light text-[11px]">Bole Airport & city transfers</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Droplets size={18} className="text-gold-500 shrink-0" />
            <div>
              <span className="font-bold text-dark-900 block">Travertine Vitality Spa</span>
              <span className="text-gray-500 font-light text-[11px]">34°C geothermal plunge pool</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Key size={18} className="text-gold-500 shrink-0" />
            <div>
              <span className="font-bold text-dark-900 block">Mobile NFC Key Access</span>
              <span className="text-gray-500 font-light text-[11px]">Instant contactless suite unlock</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <ShieldCheck size={18} className="text-gold-500 shrink-0" />
            <div>
              <span className="font-bold text-dark-900 block">Diplomatic Security</span>
              <span className="text-gray-500 font-light text-[11px]">Secure access floors & protocol</span>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Services Section Component */}
      <main className="flex-1">
        <ServicesSection />
      </main>

      {/* Luxury Footer (Universal on Every Page) */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default ServicesPage;
