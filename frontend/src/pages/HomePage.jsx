import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  BedDouble, 
  Utensils, 
  HeartHandshake, 
  MapPin, 
  ShieldCheck, 
  Award, 
  Star,
  Compass,
  CheckCircle2,
  Clock,
  PhoneCall
} from 'lucide-react';
import BookingBar from '../components/BookingBar';
import AboutSection from '../components/AboutSection';
import Footer from '../components/Footer';

const HomePage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden">
      {/* 1. Hero Section */}
      <div 
        className="relative min-h-[82vh] lg:min-h-[88vh] flex flex-col items-center justify-center bg-cover bg-center transition-all duration-700"
        style={{ 
          backgroundImage: 'url("/images/room2.jpg")',
          backgroundPosition: 'center 45%'
        }}
      >
        {/* Subtle dark gradient overlay for optimal readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/75 via-dark-900/50 to-dark-900/85 z-10" />
        
        <div className="relative z-20 text-center text-white px-4 sm:px-6 max-w-4xl pt-12 sm:pt-16 pb-12 sm:pb-20 lg:pb-28">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-4 sm:mb-6 shadow-sm">
            <span className="text-gold-400 font-serif text-sm">★</span>
            <p className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-gray-100">
              Forbes Five Star <span className="mx-1 text-gold-400">•</span> Leading Hotels of the World
            </p>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif mb-4 sm:mb-6 leading-tight tracking-tight drop-shadow-md text-white font-normal">
            Stay somewhere exceptional.
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-light text-gray-200 max-w-2xl mx-auto mb-8 sm:mb-10 drop-shadow-sm leading-relaxed px-2">
            Experience uncompromising comfort, architectural splendor, and intuitive white-glove hospitality in the diplomatic heart of Addis Ababa.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            <button 
              onClick={() => onNavigate('rooms')}
              className="w-full sm:w-auto bg-gold-500 hover:bg-gold-600 text-white px-7 sm:px-8 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-gold-500/25 cursor-pointer flex items-center justify-center gap-2 rounded-xs"
            >
              Book Your Sanctuary <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => onNavigate('rooms')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-7 sm:px-8 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 rounded-xs"
            >
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-white/60 flex items-center justify-center text-[8px] sm:text-[10px]">▶</span> Explore Suites
            </button>
          </div>
        </div>

        {/* Floating Booking Bar Component */}
        <BookingBar />
      </div>

      {/* Spacing for overlapping booking bar on large screens */}
      <div className="hidden lg:block h-20 bg-[#fafafa]" />

      {/* 2. Key Pillars Ribbon */}
      <div className="bg-white border-y border-gray-100 py-6 px-4 sm:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <p className="font-serif font-bold text-dark-900 text-sm">Forbes Five-Star</p>
              <p className="text-gray-500 font-light text-[11px]">Unrivaled global distinction</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center shrink-0">
              <Utensils className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <p className="font-serif font-bold text-dark-900 text-sm">Michelin Gastronomy</p>
              <p className="text-gray-500 font-light text-[11px]">Executive Chef Marco Bellini</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <p className="font-serif font-bold text-dark-900 text-sm">Les Clefs d'Or</p>
              <p className="text-gray-500 font-light text-[11px]">24/7 Diplomatic Concierge</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <p className="font-serif font-bold text-dark-900 text-sm">Diplomatic Security</p>
              <p className="text-gray-500 font-light text-[11px]">Biometric & VIP escort protocols</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Heritage & Philosophy About Section */}
      <AboutSection />

      {/* 4. Luxury Experience Showcase Grids */}
      {/* SECTION A: Accommodations Teaser */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold-600 font-semibold mb-3">
                <BedDouble size={14} />
                <span>Private Residences</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-dark-900 font-normal">
                Curated Sanctuaries of Peace
              </h2>
            </div>
            <button 
              onClick={() => onNavigate('rooms')}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-600 hover:text-gold-700 transition-colors group cursor-pointer"
            >
              <span>Explore All Suites & Rates</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div 
              onClick={() => onNavigate('rooms')}
              className="group bg-white rounded-xs overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="/images/room1.jpg" 
                  alt="Deluxe Skyline King Sanctuary" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-dark-900/80 backdrop-blur-md text-gold-400 text-xs px-3 py-1 font-mono font-semibold">
                  From 3,500 ETB / night
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">Skyline View • 48 m²</span>
                  <h3 className="font-serif text-xl text-dark-900 mt-1 mb-2 group-hover:text-gold-600 transition-colors">
                    Deluxe Skyline King Sanctuary
                  </h3>
                  <p className="text-xs text-gray-500 font-light leading-relaxed line-clamp-2">
                    Panoramic city vistas, Italian marble rainfall bath, and acoustic insulation for deep nocturnal rest.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gold-600 font-medium">
                  <span>View Details & Amenities</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div 
              onClick={() => onNavigate('rooms')}
              className="group bg-white rounded-xs overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="/images/room4.jpg" 
                  alt="Executive Presidential Suite" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-gold-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
                  Signature Suite
                </div>
                <div className="absolute top-4 right-4 bg-dark-900/80 backdrop-blur-md text-gold-400 text-xs px-3 py-1 font-mono font-semibold">
                  From 6,800 ETB / night
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">Diplomatic Floor • 95 m²</span>
                  <h3 className="font-serif text-xl text-dark-900 mt-1 mb-2 group-hover:text-gold-600 transition-colors">
                    Executive Diplomatic Suite
                  </h3>
                  <p className="text-xs text-gray-500 font-light leading-relaxed line-clamp-2">
                    Separate salon, private dining boardroom, 24/7 personal butler, and complimentary airport limousine.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gold-600 font-medium">
                  <span>View Details & Amenities</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div 
              onClick={() => onNavigate('rooms')}
              className="group bg-white rounded-xs overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="/images/room6.jpg" 
                  alt="Imperial Penthouse Suite" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-dark-900/80 backdrop-blur-md text-gold-400 text-xs px-3 py-1 font-mono font-semibold">
                  From 10,000 ETB / night
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">Top Floor Terraces • 140 m²</span>
                  <h3 className="font-serif text-xl text-dark-900 mt-1 mb-2 group-hover:text-gold-600 transition-colors">
                    Imperial Penthouse Suite
                  </h3>
                  <p className="text-xs text-gray-500 font-light leading-relaxed line-clamp-2">
                    Expansive open terrace, geothermal jacuzzi, Steinway baby grand, and dedicated sommelier service.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gold-600 font-medium">
                  <span>View Details & Amenities</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: Haute Gastronomy Showcase */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 bg-dark-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold-400 font-semibold mb-3">
              <Utensils size={14} />
              <span>Haute Gastronomy</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white font-normal mb-6 leading-tight">
              Culinary Artistry Across Four Distinct Venues
            </h2>
            <p className="text-gray-300 font-light text-sm sm:text-base leading-relaxed mb-6">
              Executive Chef Marco Bellini orchestrates unforgettable epicurean journeys. From our woodfire grill and artisanal Ethiopian roastery to our rooftop champagne observatory, each bite reflects absolute terroir and craftsmanship.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-xs text-gray-300">
                <CheckCircle2 size={16} className="text-gold-400 shrink-0" />
                <span>Sommelier cellar featuring 850+ rare Grand Cru vintages</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-300">
                <CheckCircle2 size={16} className="text-gold-400 shrink-0" />
                <span>Artisanal Ethiopian highland single-origin coffee tastings</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-300">
                <CheckCircle2 size={16} className="text-gold-400 shrink-0" />
                <span>24/7 bespoke in-suite chef table & private sommelier pairing</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button 
                onClick={() => onNavigate('dining')}
                className="bg-gold-500 hover:bg-gold-600 text-white px-7 py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 rounded-xs"
              >
                Explore Dining Venues & Menus <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="lg:w-1/2 grid grid-cols-2 gap-4 w-full">
            <div className="space-y-4">
              <div className="h-44 sm:h-56 rounded-xs overflow-hidden">
                <img src="/images/dinning.jpg" alt="Dining Room" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="h-56 sm:h-64 rounded-xs overflow-hidden">
                <img src="/images/food1.jpg" alt="Artisanal dish" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
            <div className="space-y-4 pt-6">
              <div className="h-56 sm:h-64 rounded-xs overflow-hidden">
                <img src="/images/food3.jpg" alt="Fine cuisine" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="h-44 sm:h-56 rounded-xs overflow-hidden">
                <img src="/images/food6.jpg" alt="Dessert & Wine" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION C: Wellness & White-Glove Services Teaser */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold-600 font-semibold mb-3">
                <HeartHandshake size={14} />
                <span>Privileges & Services</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-dark-900 font-normal">
                Curated Privileges for Discerning Guests
              </h2>
            </div>
            <button 
              onClick={() => onNavigate('services')}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-600 hover:text-gold-700 transition-colors group cursor-pointer"
            >
              <span>Discover All Privileges</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div 
              onClick={() => onNavigate('services')}
              className="p-8 bg-[#fdfdfd] border border-gray-200/80 rounded-xs hover:border-gold-500/60 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center mb-6 group-hover:bg-gold-500 transition-colors">
                <Sparkles className="w-6 h-6 text-gold-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-serif text-xl text-dark-900 mb-3 group-hover:text-gold-600 transition-colors">
                Travertine Vitality Spa
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed mb-6">
                Heated 34°C geothermal hydrotherapy pools, Finnish eucalyptus steam baths, and botanical treatments tailored for deep restorative wellness.
              </p>
              <span className="text-xs text-gold-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn more <ArrowRight size={13} />
              </span>
            </div>

            <div 
              onClick={() => onNavigate('services')}
              className="p-8 bg-[#fdfdfd] border border-gray-200/80 rounded-xs hover:border-gold-500/60 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center mb-6 group-hover:bg-gold-500 transition-colors">
                <Compass className="w-6 h-6 text-gold-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-serif text-xl text-dark-900 mb-3 group-hover:text-gold-600 transition-colors">
                Private Mercedes Chauffeur
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed mb-6">
                Guaranteed Bole International Airport VIP tarmac pickups and bespoke Addis Ababa city excursions in our private fleet of S-Class sedans.
              </p>
              <span className="text-xs text-gold-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn more <ArrowRight size={13} />
              </span>
            </div>

            <div 
              onClick={() => onNavigate('services')}
              className="p-8 bg-[#fdfdfd] border border-gray-200/80 rounded-xs hover:border-gold-500/60 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center mb-6 group-hover:bg-gold-500 transition-colors">
                <HeartHandshake className="w-6 h-6 text-gold-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-serif text-xl text-dark-900 mb-3 group-hover:text-gold-600 transition-colors">
                Les Clefs d'Or Concierge
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed mb-6">
                Around-the-clock coordination of private aviation charters, exclusive diplomatic dinners, art gallery viewings, and bespoke gift curations.
              </p>
              <span className="text-xs text-gold-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn more <ArrowRight size={13} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION D: Prime Location & Concierge Callout */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-[#f8f9fa] border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold-600 font-semibold mb-2">
              <MapPin size={14} />
              <span>Africa Avenue • Bole Diplomatic District</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif text-dark-900 mb-2">
              Addis Ababa's Most Prestigious Address
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-light max-w-xl">
              Situated 8 minutes from Bole International Airport and adjacent to diplomatic embassies, international headquarters, and fine boutiques.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button 
              onClick={() => onNavigate('contact')}
              className="bg-dark-900 hover:bg-black text-white px-6 py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 rounded-xs"
            >
              <MapPin size={14} className="text-gold-400" />
              View Map & Directions
            </button>
            <button 
              onClick={() => onNavigate('contact')}
              className="bg-white hover:bg-gray-50 text-dark-900 border border-gray-300 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 rounded-xs"
            >
              <PhoneCall size={14} className="text-gold-600" />
              Contact 24/7 Concierge
            </button>
          </div>
        </div>
      </section>

      {/* 5. Luxury Universal Footer (On Every Page) */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default HomePage;
