import React from 'react';
import { Clock, Car, ChefHat, Wifi, Moon, Map } from 'lucide-react';

const AboutSection = () => {
  const features = [
    { icon: <Clock size={20} className="text-gold-500" />, title: '24/7 Concierge', desc: 'White-glove coordination' },
    { icon: <Car size={20} className="text-gold-500" />, title: 'Private Fleet', desc: 'Airport & city transfer' },
    { icon: <ChefHat size={20} className="text-gold-500" />, title: 'Michelin Chefs', desc: 'Culinary artistry' },
    { icon: <Wifi size={20} className="text-gold-500" />, title: 'Fiber Wi-Fi', desc: 'Dedicated 1Gbps mesh' },
    { icon: <Moon size={20} className="text-gold-500" />, title: 'Turndown Ritual', desc: 'Aromatherapy pillow mist' },
    { icon: <Map size={20} className="text-gold-500" />, title: 'Curated Tours', desc: 'Bespoke itineraries' }
  ];

  return (
    <section id="about-us" className="py-16 sm:py-24 px-4 sm:px-8 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
        
        <div className="lg:w-1/2">
          <span className="text-[10px] sm:text-[11px] tracking-[0.2em] text-gray-500 uppercase mb-3 sm:mb-4 block">Heritage & Philosophy</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-dark-900 mb-5 sm:mb-6 leading-tight">
            More than a stay.<br/>An architectural sanctuary.
          </h2>
          <p className="text-gray-600 font-light text-sm sm:text-base mb-8 sm:mb-12 leading-relaxed">
            Conceived as an urban harbor retreat, Efoy Hotel & Suites fuses timeless classical proportions with 
            modern glass cantilevers and tranquil water gardens. Every corridor, ambient luminaire, and 
            handcrafted teak finish is calibrated to ease mental tension and evoke pure calm.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 sm:gap-y-8 gap-x-4 mb-8 sm:mb-12">
            {features.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1.5 sm:gap-2">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-1.5 sm:mb-2">
                  {item.icon}
                </div>
                <h4 className="font-serif text-dark-900 text-base sm:text-lg">{item.title}</h4>
                <p className="text-xs text-gray-500 font-light">{item.desc}</p>
              </div>
            ))}
          </div>

          <button className="w-full sm:w-auto justify-center bg-blue-50 text-blue-900 px-6 py-3 text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2 rounded-sm cursor-pointer">
            Discover Our Story & Heritage <span>→</span>
          </button>
        </div>

        <div className="lg:w-1/2 relative w-full">
          <div className="relative h-[340px] sm:h-[460px] lg:h-[600px] w-full overflow-hidden rounded-sm">
            <img 
              src="/images/room3.jpg" 
              alt="Hotel Architectural Sanctuary" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-8 sm:-left-8 bg-white p-5 sm:p-6 shadow-xl max-w-sm flex gap-4 items-start border border-gray-100 z-10 rounded-sm">
            <div className="w-12 h-12 bg-gold-50 flex items-center justify-center shrink-0">
              <span className="text-gold-600 font-serif text-xl">★</span>
            </div>
            <div>
              <h4 className="font-serif text-dark-900 text-base sm:text-lg mb-1">Top 10 Global</h4>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Condé Nast Traveler Readers' Choice Awards 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
