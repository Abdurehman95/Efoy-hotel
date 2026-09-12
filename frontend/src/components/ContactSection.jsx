import React from 'react';
import { MapPin, Plane, Car, Train } from 'lucide-react';

const ContactSection = () => {
  return (
    <section id="contact" className="flex flex-col">
      {/* Location Map Section */}
      <div className="py-16 sm:py-24 px-4 sm:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            <div className="lg:w-1/3">
              <span className="text-[10px] sm:text-[11px] tracking-[0.2em] text-gray-500 uppercase mb-3 sm:mb-4 block">Enviable Waterfront Address</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-dark-900 mb-4 sm:mb-6 leading-tight">
                Perfect Position on the Coast
              </h2>
              <p className="text-gray-600 font-light text-sm sm:text-base mb-8 sm:mb-10 leading-relaxed">
                Occupying a prized waterfront parcel in San Francisco's Financial Waterfront district, Grand Horizon 
                balances secluded tranquility with immediate proximity to cultural landmarks, private marinas, and premier shopping.
              </p>
              
              <ul className="space-y-5 sm:space-y-6">
                <li className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-blue-50 flex items-center justify-center shrink-0 rounded-sm">
                    <Plane size={18} className="text-blue-900" />
                  </div>
                  <div>
                    <h5 className="font-serif text-dark-900 mb-1 text-sm font-medium">25 Minutes to SFO International</h5>
                    <p className="text-xs text-gray-500 font-light">Direct VIP house chauffeur pickup available</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-blue-50 flex items-center justify-center shrink-0 rounded-sm">
                    <Car size={18} className="text-blue-900" />
                  </div>
                  <div>
                    <h5 className="font-serif text-dark-900 mb-1 text-sm font-medium">5 Minutes to Marina Bay Yacht Club</h5>
                    <p className="text-xs text-gray-500 font-light">Exclusive guest reciprocal privileges & slip bookings</p>
                  </div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-blue-50 flex items-center justify-center shrink-0 rounded-sm">
                    <Train size={18} className="text-blue-900" />
                  </div>
                  <div>
                    <h5 className="font-serif text-dark-900 mb-1 text-sm font-medium">10 Minutes to Luxury Fashion District</h5>
                    <p className="text-xs text-gray-500 font-light">Union Square personal boutique appointments</p>
                  </div>
                </li>
              </ul>
              
              <div className="flex flex-wrap gap-3 sm:gap-4 mt-8 sm:mt-10">
                <button className="w-full sm:w-auto bg-dark-900 text-white px-6 py-3 text-sm font-medium hover:bg-gold-600 transition-colors cursor-pointer text-center">
                  Get Directions
                </button>
                <button className="w-full sm:w-auto bg-blue-50 text-blue-900 px-6 py-3 text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer text-center">
                  Book Chauffeur Transfer
                </button>
              </div>
            </div>
            
            <div className="lg:w-2/3 w-full">
              {/* Responsive Map Visual */}
              <div className="w-full h-[320px] sm:h-[420px] lg:h-[500px] bg-blue-100 rounded-sm relative overflow-hidden flex items-center justify-center border border-blue-200">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-50 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200/50 to-blue-400/30"></div>
                
                {/* Map markers */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <MapPin size={32} className="text-gold-600 drop-shadow-md z-10" />
                  <div className="bg-white px-3 sm:px-4 py-2 mt-2 shadow-lg rounded-sm text-center border border-gray-100 z-10 relative max-w-xs">
                    <h4 className="font-serif text-dark-900 text-xs sm:text-sm mb-1 font-semibold">Grand Horizon Hotel</h4>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-light">740 Horizon Promenade, Financial District<br/>San Francisco, CA 94105</p>
                  </div>
                  {/* Map ring effect */}
                  <div className="absolute top-4 w-12 h-12 bg-gold-500/20 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-dark-900 py-16 sm:py-24 px-4 sm:px-8 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="w-12 h-12 border border-white/20 flex items-center justify-center mx-auto mb-5 sm:mb-6 text-white">
            <span className="font-serif text-xl text-white">GH</span>
          </div>
          <span className="text-[10px] sm:text-[11px] tracking-[0.2em] text-gold-500 uppercase mb-3 sm:mb-4 block font-semibold">Horizon Circle Membership</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-4 sm:mb-6 leading-tight text-white font-semibold">
            Subscribe for Private Rates & Seasonal Invitations
          </h2>
          <p className="text-white/70 font-light mb-8 sm:mb-10 text-xs sm:text-sm max-w-xl mx-auto">
            Members receive guaranteed priority reservations, complimentary room upgrades upon arrival when available, 
            and invitations to private chef tastings.
          </p>
          <form className="flex flex-col sm:flex-row justify-center max-w-lg mx-auto gap-3 sm:gap-4">
            <input 
              type="email" 
              placeholder="Enter your private email address" 
              className="bg-white/10 border border-white/20 text-white px-5 sm:px-6 py-3 w-full focus:outline-none focus:border-gold-500 placeholder-white/40 text-sm rounded-xs"
            />
            <button className="bg-gold-500 text-white px-8 py-3 text-sm font-medium hover:bg-gold-600 transition-colors whitespace-nowrap cursor-pointer rounded-xs">
              Join Horizon Club
            </button>
          </form>
          <p className="text-[10px] text-white/40 mt-4">By joining, you consent to our Privacy Policy and Terms of Service.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#fafafa] py-12 sm:py-16 px-4 sm:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
          <div className="col-span-1 sm:col-span-2 md:col-span-1 text-left">
             <h1 className="font-serif text-xl tracking-widest text-dark-900 uppercase leading-none mb-1">
              Grand Horizon
            </h1>
            <span className="text-[10px] tracking-[0.2em] text-gray-500 uppercase">
              Hotel & Suites
            </span>
            <p className="text-xs text-gray-500 mt-4 font-light leading-relaxed max-w-xs">
              Five-Star waterfront luxury sanctuary on the San Francisco coast.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-900 mb-4 sm:mb-6">Explore</h4>
            <ul className="space-y-2.5 sm:space-y-3 text-sm text-gray-600 font-light">
              <li><a href="#rooms" className="hover:text-gold-600 transition-colors">Suites & Residences</a></li>
              <li><a href="#dining" className="hover:text-gold-600 transition-colors">Gastronomy & Lounge</a></li>
              <li><a href="#services" className="hover:text-gold-600 transition-colors">Spa & Wellness</a></li>
              <li><a href="#about-us" className="hover:text-gold-600 transition-colors">Heritage & Architecture</a></li>
              <li><a href="#contact" className="hover:text-gold-600 transition-colors">Concierge & Transfers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-900 mb-4 sm:mb-6">Guest Services</h4>
            <ul className="space-y-2.5 sm:space-y-3 text-sm text-gray-600 font-light">
              <li><a href="#rooms" className="hover:text-gold-600 transition-colors">Reservations</a></li>
              <li><a href="#rooms" className="hover:text-gold-600 transition-colors">My Booking</a></li>
              <li><a href="#services" className="hover:text-gold-600 transition-colors">Folio Settlement</a></li>
              <li><a href="#dining" className="hover:text-gold-600 transition-colors">In-Room Dining</a></li>
              <li><a href="#contact" className="hover:text-gold-600 transition-colors">Special Requests</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-900 mb-4 sm:mb-6">Contact & Press</h4>
            <ul className="space-y-2.5 sm:space-y-3 text-sm text-gray-600 font-light">
              <li>
                <span className="block text-dark-900 font-medium">Concierge Desk:</span>
                +1 (800) 555-0199
              </li>
              <li>
                <span className="block text-dark-900 font-medium">Email:</span>
                concierge@grandhorizon.com
              </li>
              <li className="pt-1 sm:pt-2">
                <span className="block text-dark-900 font-medium">Address:</span>
                740 Horizon Promenade<br/>San Francisco, CA 94105
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center pt-6 sm:pt-8 border-t border-gray-200 text-xs text-gray-500 gap-4">
          <p>© 2025 Grand Horizon Hotel & Resorts LLC. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center sm:justify-end">
            <a href="#" className="hover:text-dark-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-dark-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-dark-900 transition-colors">Press Inquiries</a>
          </div>
        </div>
      </footer>
    </section>
  );
};

export default ContactSection;
