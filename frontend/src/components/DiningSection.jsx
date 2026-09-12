import React from 'react';
import { Wine, UtensilsCrossed, Bell } from 'lucide-react';

const DiningSection = () => {
  return (
    <section id="dining" className="py-16 sm:py-24 px-4 sm:px-8 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row gap-12 lg:gap-16 items-center">
        
        <div className="lg:w-1/2 relative w-full">
          <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full overflow-hidden rounded-sm">
            <img 
              src="/images/dinning.png" 
              alt="L'Horizon Dining Experience" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-[10px] tracking-wider uppercase px-3 py-1 z-10 font-medium rounded-xs shadow-xs">
            2 Michelin Star Recipient
          </div>
        </div>

        <div className="lg:w-1/2">
          <span className="text-[10px] sm:text-[11px] tracking-[0.2em] text-gray-500 uppercase mb-3 sm:mb-4 block">Epicurean Artistry</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-dark-900 mb-4 sm:mb-6 leading-tight">
            L'Horizon Gourmet & Cellar
          </h2>
          <p className="text-gray-600 font-light text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
            Led by Executive Chef Antoine Laurent, our two-star Michelin culinary program bridges sustainable Northern 
            California coastal harvests with classical French technique. Experience our signature seven-course tasting 
            journey or order 24-hour in-room dining direct to your private terrace.
          </p>
          
          <ul className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
            <li className="flex gap-3 sm:gap-4 items-start">
              <Wine className="text-gold-500 shrink-0 mt-0.5" size={20} />
              <span className="text-xs sm:text-sm text-gray-600 font-light">Grand Award-winning cellar with over 2,000 curated vintages</span>
            </li>
            <li className="flex gap-3 sm:gap-4 items-start">
              <UtensilsCrossed className="text-gold-500 shrink-0 mt-0.5" size={20} />
              <span className="text-xs sm:text-sm text-gray-600 font-light">Nightly seasonal seafood tasting with local Monterey Bay pairing</span>
            </li>
            <li className="flex gap-3 sm:gap-4 items-start">
              <Bell className="text-gold-500 shrink-0 mt-0.5" size={20} />
              <span className="text-xs sm:text-sm text-gray-600 font-light">24/7 In-Suite Private Chef and Sommelier services upon request</span>
            </li>
          </ul>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <button className="w-full sm:w-auto bg-dark-900 text-white px-8 py-3 text-sm font-medium hover:bg-gold-600 transition-colors cursor-pointer text-center">
              Reserve a Table
            </button>
            <button className="text-sm font-medium text-dark-900 hover:text-gold-600 transition-colors cursor-pointer">
              View Tasting Menu
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default DiningSection;
