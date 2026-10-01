import React from 'react';
import { Sparkles, PhoneCall, Mail, MapPin, Clock, ShieldCheck, HeartHandshake } from 'lucide-react';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

const ContactPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      {/* Dedicated Luxury Hero Banner for Contact & Concierge */}
      <div 
        className="relative min-h-[50vh] sm:min-h-[58vh] flex flex-col justify-center bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("/images/room7.jpg")',
          backgroundPosition: 'center 45%'
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
            <span className="text-gold-300 font-semibold">Contact & Diplomatic Concierge</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-gold-300 text-xs font-medium mb-4 shadow-sm">
            <HeartHandshake size={13} className="text-gold-400" />
            <span>24/7 Les Clefs d'Or Diplomatic Concierge</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal leading-tight tracking-tight mb-4 max-w-3xl">
            At Your Service, Whenever You Need Us
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-200 font-light max-w-2xl leading-relaxed">
            Whether coordinating seamless airport tarmac transfers, private dining reservations, or high-security delegation suites, our dedicated team is at your command 24 hours a day.
          </p>
        </div>
      </div>

      {/* Concierge Directory Ribbon */}
      <div className="bg-white border-y border-gray-200 py-6 px-4 sm:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-3 text-slate-700">
            <PhoneCall size={18} className="text-gold-500 shrink-0" />
            <div>
              <span className="font-bold text-dark-900 block">General Inquiries</span>
              <a href="tel:+251116678900" className="text-gray-500 hover:text-gold-600 transition-colors font-light text-[11px]">+251 11 667 8900</a>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Mail size={18} className="text-gold-500 shrink-0" />
            <div>
              <span className="font-bold text-dark-900 block">Diplomatic & VIP Desk</span>
              <a href="mailto:concierge@efoyhotel.com" className="text-gray-500 hover:text-gold-600 transition-colors font-light text-[11px]">concierge@efoyhotel.com</a>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <MapPin size={18} className="text-gold-500 shrink-0" />
            <div>
              <span className="font-bold text-dark-900 block">Prime Location</span>
              <span className="text-gray-500 font-light text-[11px]">Bole Africa Ave, Addis Ababa</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Clock size={18} className="text-gold-500 shrink-0" />
            <div>
              <span className="font-bold text-dark-900 block">Concierge Hours</span>
              <span className="text-gray-500 font-light text-[11px]">24 Hours / 365 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Contact & Interactive Map Section */}
      <main className="flex-1">
        <ContactSection />
      </main>

      {/* Luxury Footer (Universal on Every Page) */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default ContactPage;
