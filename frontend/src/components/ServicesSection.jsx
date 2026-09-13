import React from 'react';
import { Droplets, Sparkles, Activity, Key, Wind, CarFront, Shirt, Bath, HeartHandshake } from 'lucide-react';

const ServicesSection = () => {
  const hospitalityItems = [
    { icon: <Key size={24} className="text-gray-400" />, title: '24/7 Reception & Express Check-In', desc: 'Direct-to-room mobile digital keycard bypass or warm front-desk greeting with glass of chilled champagne and hot towels.' },
    { icon: <Wind size={24} className="text-gray-400" />, title: 'Daily White-Glove Housekeeping', desc: 'Twice-daily housekeeping with evening turndown, fresh floral arrangements, pillow selection menu, and butler shoe shine.' },
    { icon: <CarFront size={24} className="text-gray-400" />, title: 'House Chauffeur & Airport Transfers', desc: 'Complimentary house car drop-offs within a 3-mile radius in our fleet of Mercedes S-Class and Range Rover luxury hybrid sedans.' },
    { icon: <Shirt size={24} className="text-gray-400" />, title: 'Express Laundry & Garment Care', desc: 'Same-day express dry cleaning, delicate hand steaming, and expert button tailoring handled in-house with surgical care.' },
    { icon: <Bath size={24} className="text-gray-400" />, title: 'Spa, Steam & Hydrotherapy', desc: 'Unlimited access for all suite residents to the hydrotherapy plunge pools, eucalyptus steam rooms, and panoramic fitness studio.' },
    { icon: <HeartHandshake size={24} className="text-gray-400" />, title: 'Dedicated VIP Concierge & Butler', desc: 'Members of Les Clefs d\'Or at your disposal for sold-out event tickets, private yacht charters, and bespoke coastal excursions.' }
  ];

  return (
    <section id="services">
      {/* Wellness Part */}
      <div className="py-16 sm:py-24 px-4 sm:px-8 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          <div className="lg:w-1/2">
            <span className="text-[10px] sm:text-[11px] tracking-[0.2em] text-gray-500 uppercase mb-3 sm:mb-4 block">Restorative Wellness</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-dark-900 mb-4 sm:mb-6 leading-tight">
              Geothermal Hydrotherapy <span className="font-sans font-light">&amp;</span> Spa
            </h2>
            <p className="text-gray-600 font-light text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
              Enter an atmospheric retreat carved from Roman travertine and natural cedarwood. Our 25-meter heated 
              hydrotherapy infinity pool is paired with Finnish eucalyptus steam saunas, Himalayan salt inhalation rooms, and 
              personalized cellular renewal treatments.
            </p>
            
            <ul className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
              <li className="flex gap-3 sm:gap-4 items-start">
                <Droplets className="text-gold-500 shrink-0 mt-0.5" size={20} />
                <span className="text-xs sm:text-sm text-gray-600 font-light">Temperature-controlled 34°C vitality pool with submerged lounger jets</span>
              </li>
              <li className="flex gap-3 sm:gap-4 items-start">
                <Sparkles className="text-gold-500 shrink-0 mt-0.5" size={20} />
                <span className="text-xs sm:text-sm text-gray-600 font-light">Organic Biologique Recherche tailored skincare and deep tissue massage</span>
              </li>
              <li className="flex gap-3 sm:gap-4 items-start">
                <Activity className="text-gold-500 shrink-0 mt-0.5" size={20} />
                <span className="text-xs sm:text-sm text-gray-600 font-light">Body matrix envelop sound bath and private yoga instruction</span>
              </li>
            </ul>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <button className="w-full sm:w-auto bg-dark-900 text-white px-8 py-3 text-sm font-medium hover:bg-gold-600 transition-colors cursor-pointer text-center">
                Explore Spa Menu
              </button>
              <button className="text-sm font-medium text-dark-900 hover:text-gold-600 transition-colors cursor-pointer">
                Book Treatment
              </button>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative w-full">
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full overflow-hidden rounded-sm">
              <img 
                src="/images/room8.jpg" 
                alt="Spa and Wellness" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hospitality Part */}
      <div className="py-16 sm:py-24 px-4 sm:px-8 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-[10px] sm:text-[11px] tracking-[0.2em] text-gray-500 uppercase mb-3 sm:mb-4 block">White-Glove Hospitality</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-dark-900 mb-4 sm:mb-6">
              Everything You Need, Anticipated
            </h2>
            <p className="text-gray-600 font-light text-sm sm:text-base max-w-2xl mx-auto">
              From frictionless arrivals to bespoke departure luggage forwarding, our team operates with surgical precision and quiet warmth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {hospitalityItems.map((item, idx) => (
              <div key={idx} className="bg-white p-6 sm:p-8 border border-gray-100 hover:shadow-lg transition-shadow rounded-sm">
                <div className="w-12 h-12 bg-gray-50 flex items-center justify-center rounded-sm mb-5 sm:mb-6">
                  {item.icon}
                </div>
                <h4 className="font-serif text-dark-900 text-base sm:text-lg mb-2 sm:mb-3">{item.title}</h4>
                <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
