import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Key, 
  UtensilsCrossed, 
  Car, 
  CalendarCheck 
} from 'lucide-react';

const Footer = ({ onNavigate }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterSubscribed(false);
    }, 3500);
  };

  const handleLinkClick = (e, pageId) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(pageId);
    } else {
      window.location.hash = pageId === 'home' ? '' : pageId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gradient-to-b from-[#161a22] to-[#0f1217] text-white border-t border-gold-500/20 relative overflow-hidden select-none font-sans">
      {/* Subtle gold ambient glow */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-gold-600/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top Privilege Circle & Concierge Banner */}
      <div className="border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.28em] text-gold-400 uppercase font-mono block mb-2">
              The Efoy Privilege Circle
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal tracking-tight">
              Bespoke Hospitality & Exclusive Seasonal Offers
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-light mt-1.5 leading-relaxed">
              Subscribe to receive private invitations to seasonal culinary tasting menus, penthouse suite releases, and VIP resident events.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {newsletterSubscribed ? (
              <div className="bg-gold-500/20 border border-gold-400/40 px-6 py-3.5 rounded-xl flex items-center gap-2.5 text-xs text-gold-200">
                <Check size={16} className="text-gold-400 shrink-0" />
                <span>Thank you. Your invitation to the Efoy Privilege Circle has been dispatched.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md w-full mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="px-4 py-3 text-xs bg-white/5 border border-white/15 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-gold-500 focus:bg-white/10 transition-all sm:w-72"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#b38438] via-[#a6782f] to-[#996d2a] hover:from-[#a0742e] hover:to-[#8c6224] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Join Circle</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 relative z-10 text-xs">
        {/* Column 1: Brand & Credentials */}
        <div className="space-y-4">
          <div className="bg-white inline-flex rounded-xl px-3 py-1.5 shadow-md items-center justify-center">
            <img
              src="/images/logo.png"
              alt="Efoy Hotel & Suites"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>
          <p className="text-slate-300 font-light leading-relaxed">
            Addis Ababa’s premier five-star luxury hotel and private residences, harmonizing bespoke Ethiopian warmth with world-class hospitality.
          </p>

          <div className="pt-2 flex flex-col gap-2">
            <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[11px] text-gold-300 w-fit">
              <span className="text-amber-400">★★★★★</span>
              <span>Forbes Five Star 2026</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[11px] text-slate-300 w-fit">
              <Sparkles size={12} className="text-gold-400" />
              <span>Leading Hotels of the World</span>
            </div>
          </div>
        </div>

        {/* Column 2: Navigation Pages */}
        <div>
          <h4 className="font-serif text-sm font-bold tracking-wider uppercase text-white mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            <span>Discover The Sanctuary</span>
          </h4>
          <ul className="space-y-3 font-light text-slate-300">
            <li>
              <a
                href="#"
                onClick={(e) => handleLinkClick(e, 'home')}
                className="hover:text-gold-400 transition-colors flex items-center justify-between group"
              >
                <span>Home Sanctuary</span>
                <span className="text-white/20 group-hover:text-gold-400 group-hover:translate-x-0.5 transition-all">→</span>
              </a>
            </li>
            <li>
              <a
                href="#rooms"
                onClick={(e) => handleLinkClick(e, 'rooms')}
                className="hover:text-gold-400 transition-colors flex items-center justify-between group"
              >
                <span>Curated Rooms & Suites</span>
                <span className="text-white/20 group-hover:text-gold-400 group-hover:translate-x-0.5 transition-all">→</span>
              </a>
            </li>
            <li>
              <a
                href="#dining"
                onClick={(e) => handleLinkClick(e, 'dining')}
                className="hover:text-gold-400 transition-colors flex items-center justify-between group"
              >
                <span>Haute Gastronomy & Dining</span>
                <span className="text-white/20 group-hover:text-gold-400 group-hover:translate-x-0.5 transition-all">→</span>
              </a>
            </li>
            <li>
              <a
                href="#services"
                onClick={(e) => handleLinkClick(e, 'services')}
                className="hover:text-gold-400 transition-colors flex items-center justify-between group"
              >
                <span>Spa, Wellness & Butler Services</span>
                <span className="text-white/20 group-hover:text-gold-400 group-hover:translate-x-0.5 transition-all">→</span>
              </a>
            </li>
            <li>
              <a
                href="#contact"
                onClick={(e) => handleLinkClick(e, 'contact')}
                className="hover:text-gold-400 transition-colors flex items-center justify-between group"
              >
                <span>Concierge & Contact</span>
                <span className="text-white/20 group-hover:text-gold-400 group-hover:translate-x-0.5 transition-all">→</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Guest Portal & Resident Services */}
        <div>
          <h4 className="font-serif text-sm font-bold tracking-wider uppercase text-white mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            <span>Resident Privileges</span>
          </h4>
          <ul className="space-y-3 font-light text-slate-300">
            <li>
              <a
                href="#rooms"
                onClick={(e) => handleLinkClick(e, 'rooms')}
                className="hover:text-gold-400 transition-colors flex items-center gap-2"
              >
                <CalendarCheck size={14} className="text-gold-400 shrink-0" />
                <span>Reserve a Suite Online</span>
              </a>
            </li>
            <li>
              <a
                href="#login"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = 'login';
                }}
                className="hover:text-gold-400 transition-colors flex items-center gap-2"
              >
                <Key size={14} className="text-gold-400 shrink-0" />
                <span>Guest Portal & Digital NFC Key</span>
              </a>
            </li>
            <li>
              <a
                href="#dining"
                onClick={(e) => handleLinkClick(e, 'dining')}
                className="hover:text-gold-400 transition-colors flex items-center gap-2"
              >
                <UtensilsCrossed size={14} className="text-gold-400 shrink-0" />
                <span>24/7 In-Room Dining Menu</span>
              </a>
            </li>
            <li>
              <a
                href="#contact"
                onClick={(e) => handleLinkClick(e, 'contact')}
                className="hover:text-gold-400 transition-colors flex items-center gap-2"
              >
                <Car size={14} className="text-gold-400 shrink-0" />
                <span>Private Chauffeur Airport Pickup</span>
              </a>
            </li>
            <li>
              <a
                href="#services"
                onClick={(e) => handleLinkClick(e, 'services')}
                className="hover:text-gold-400 transition-colors flex items-center gap-2"
              >
                <ShieldCheck size={14} className="text-gold-400 shrink-0" />
                <span>Express Departure & Folio Settlement</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Location & Concierge Directory */}
        <div>
          <h4 className="font-serif text-sm font-bold tracking-wider uppercase text-white mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            <span>Concierge & Location</span>
          </h4>
          <div className="space-y-3 font-light text-slate-300">
            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="text-gold-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-white block">Efoy Hotel & Suites</span>
                <span>Africa Avenue, Bole, Addis Ababa, Ethiopia</span>
                <span className="block text-[11px] text-gold-400/80 mt-0.5">5 mins from Bole Int'l Airport (ADD)</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <Phone size={15} className="text-gold-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">24/7 Concierge Desk</span>
                <a href="tel:+251116670199" className="font-mono font-medium text-white hover:text-gold-400 transition-colors">
                  +251 (11) 667-0199
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <Mail size={15} className="text-gold-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Private Guest Inquiries</span>
                <a href="mailto:concierge@efoyhotel.com" className="text-white hover:text-gold-400 transition-colors">
                  concierge@efoyhotel.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Legal Credentials */}
      <div className="border-t border-white/10 relative z-10 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© 2026 Efoy Hotel & Suites Addis Ababa. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-light">
            <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Efoy Hotel Data Protection and Guest Privacy Policy.'); }} className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Efoy Hotel Terms of Luxury Stay.'); }} className="hover:text-white transition-colors">
              Terms of Stay
            </a>
            <span>•</span>
            <a href="#security" onClick={(e) => { e.preventDefault(); alert('256-Bit TLS & Diplomatic Security Standards.'); }} className="hover:text-white transition-colors">
              Security Protocol
            </a>
            <span>•</span>
            <span className="text-gold-400/80">World Luxury Hotel Awards Winner</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
