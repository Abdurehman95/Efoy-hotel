import React from 'react';
import { Sparkles, Utensils, Award, Clock, Wine, HeartHandshake } from 'lucide-react';
import DiningSection from '../components/DiningSection';
import Footer from '../components/Footer';

const DiningPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      {/* Dedicated Luxury Hero Banner for Dining & Gastronomy */}
      <div 
        className="relative min-h-[50vh] sm:min-h-[58vh] flex flex-col justify-center bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("/images/dinning.jpg")',
          backgroundPosition: 'center 45%'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/85 via-dark-900/65 to-dark-900/90 z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-white w-full text-center">
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal leading-tight tracking-tight mb-4 max-w-3xl mx-auto">
            Culinary Artistry & Artisanal Cellars
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-200 font-light max-w-2xl leading-relaxed mx-auto">
            Led by Executive Head Chef Marco Bellini, our dining program harmonizes indigenous Ethiopian botanicals and highland spices with modern French haute cuisine techniques.
          </p>
        </div>
      </div>

      {/* Culinary Credentials Ribbon */}
      <div className="bg-white border-y border-gray-200 py-6 px-4 sm:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-3 text-slate-700">
            <Award size={18} className="text-gold-500 shrink-0" />
            <div>
              <span className="font-bold text-dark-900 block">Chef's Table</span>
              <span className="text-gray-500 font-light text-[11px]">Bespoke 7-course pairing</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Clock size={18} className="text-gold-500 shrink-0" />
            <div>
              <span className="font-bold text-dark-900 block">24/7 In-Room Dining</span>
              <span className="text-gray-500 font-light text-[11px]">White-glove suite service</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Wine size={18} className="text-gold-500 shrink-0" />
            <div>
              <span className="font-bold text-dark-900 block">Grand Cru Sommelier</span>
              <span className="text-gray-500 font-light text-[11px]">850+ curated vintages</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <HeartHandshake size={18} className="text-gold-500 shrink-0" />
            <div>
              <span className="font-bold text-dark-900 block">Organic Highland Terroir</span>
              <span className="text-gray-500 font-light text-[11px]">100% farm-to-table sourcing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Dining Section Component */}
      <main className="flex-1">
        <DiningSection />
      </main>

      {/* Luxury Footer (Universal on Every Page) */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default DiningPage;
