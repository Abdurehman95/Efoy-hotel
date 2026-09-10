import React, { useState } from 'react';
import { Users, Wine, Maximize2, ArrowRight } from 'lucide-react';

const RoomsSection = () => {
  const [activeFilter, setActiveFilter] = useState('All Suites');

  const rooms = [
    {
      id: 1,
      roomNumber: 'Room 1',
      name: 'Deluxe King Sanctuary',
      category: 'Ocean View',
      size: '54 m² / 581 sq ft',
      description: 'Warm wooden artisan finishes, 800-thread Indian Frette linens, bedside ambient glow, and expansive acoustic soundproof windows.',
      guests: 2,
      price: 420,
      image: '/images/room1.jpg',
      badge: 'MOST REQUESTED'
    },
    {
      id: 2,
      roomNumber: 'Room 2',
      name: 'Resort Oceanfront Pool Villa',
      category: 'Executive',
      size: '120 m² / 1,290 sq ft',
      description: 'Private waterside terrace facing tranquil lagoon pools and swaying palms, with dedicated butler unpacking and evening cocktail service.',
      guests: 3,
      price: 680,
      image: '/images/room2.jpg',
      badge: 'RESORT EXCLUSIVE'
    },
    {
      id: 3,
      roomNumber: 'Room 3',
      name: 'Horizon Glasshouse Suite',
      category: 'Penthouse',
      size: '92 m² / 990 sq ft',
      description: 'Architectural masterpiece featuring full-height glass pavilion en-suite, wood-burning hearth, and bespoke organic designer loungers.',
      guests: 2,
      price: 780,
      image: '/images/room3.jpg',
      badge: 'ARCHITECTURAL ICON'
    },
    {
      id: 4,
      roomNumber: 'Room 4',
      name: 'Presidential Royal Suite',
      category: 'Penthouse',
      size: '160 m² / 1,720 sq ft',
      description: 'Our premier penthouse featuring tufted velvet salon, gilded dressing mirrors, opulent emerald drapery, and Rolls-Royce chauffeur service.',
      guests: 4,
      price: 1250,
      image: '/images/room4.jpg',
      badge: 'SIGNATURE SUITE'
    },
    {
      id: 5,
      roomNumber: 'Room 5',
      name: 'Golden Hour Skyline Loft',
      category: 'Ocean View',
      size: '75 m² / 807 sq ft',
      description: 'High-floor panoramic corner loft framing golden sunsets through atelier-style steel windows with deep soaking hydrotherapy spa tub.',
      guests: 2,
      price: 590,
      image: '/images/room5.jpg',
      badge: 'SUNSET VIEW'
    },
    {
      id: 6,
      roomNumber: 'Room 6',
      name: 'Executive Metropolitan Suite',
      category: 'Executive',
      size: '68 m² / 732 sq ft',
      description: 'Sleek metropolitan interior with bespoke wool sofa, marble coffee tables, natural oak flooring, and ergonomic executive workstation.',
      guests: 2,
      price: 510,
      image: '/images/room6.jpg',
      badge: 'EXECUTIVE PRIVILEGES'
    },
    {
      id: 7,
      roomNumber: 'Room 7',
      name: 'Minimalist Zen King Sanctuary',
      category: 'Ocean View',
      size: '50 m² / 538 sq ft',
      description: 'Understated elegance crafted in muted charcoal tones, concealed indirect cove lighting, acoustic wool carpets, and curated contemporary art.',
      guests: 2,
      price: 460,
      image: '/images/room7.jpg',
      badge: 'PURE CALM'
    },
    {
      id: 8,
      roomNumber: 'Room 8',
      name: 'Tropical Garden Pavilion Suite',
      category: 'Executive',
      size: '95 m² / 1,022 sq ft',
      description: 'Enclosed private botanical garden patio with teak daybed, outdoor rainfall shower, handcrafted teak headboard, and artisan waffle robes.',
      guests: 4,
      price: 890,
      image: '/images/room8.jpg',
      badge: 'PRIVATE GARDEN'
    }
  ];

  const categories = ['All Suites', 'Ocean View', 'Executive', 'Penthouse'];
  const filteredRooms = activeFilter === 'All Suites' 
    ? rooms 
    : rooms.filter(r => r.category === activeFilter);

  return (
    <section id="rooms" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-14 gap-6">
          <div>
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] text-gold-600 font-semibold uppercase mb-2 sm:mb-3 block">
              Bespoke Accommodations • Rooms 1 to 8
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-dark-900 mb-3 sm:mb-4 tracking-tight">
              Find Your Perfect Stay
            </h2>
            <p className="text-gray-600 max-w-2xl font-light text-sm sm:text-base leading-relaxed">
              Discover our full collection of eight distinct architectural guest rooms and sanctuary suites, crafted with natural elements, quiet luxury, and world-class craftsmanship.
            </p>
          </div>

          {/* Filter tabs - smooth horizontal scroll on mobile */}
          <div className="w-full md:w-auto overflow-x-auto no-scrollbar flex items-center gap-1.5 sm:gap-2 p-1.5 bg-white border border-gray-200 rounded-lg shadow-xs text-xs sm:text-sm">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`whitespace-nowrap px-3.5 sm:px-4 py-2 rounded-md font-medium transition-all duration-200 cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-dark-900 text-white shadow-xs'
                    : 'text-gray-600 hover:text-dark-900 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 8 Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
          {filteredRooms.map((room) => (
            <div 
              key={room.id} 
              className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gold-500/40 hover:shadow-2xl transition-all duration-500 flex flex-col group"
            >
              {/* Room Image Container */}
              <div className="relative overflow-hidden h-64 sm:h-72 md:h-80 bg-gray-100">
                <img 
                  src={room.image} 
                  alt={room.name} 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    if (!e.currentTarget.src.includes('%20') && room.id > 1) {
                      e.currentTarget.src = `/images/room ${room.id}.jpg`;
                    }
                  }}
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2 items-center z-10">
                  <span className="bg-dark-900/85 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-sm">
                    {room.roomNumber}
                  </span>
                  {room.badge && (
                    <span className="bg-white/95 backdrop-blur-md text-dark-900 text-[9px] sm:text-[10px] tracking-wider uppercase px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-sm font-semibold shadow-xs">
                      {room.badge}
                    </span>
                  )}
                </div>

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-dark-900 text-[10px] sm:text-[11px] font-medium px-2 sm:px-2.5 py-1 rounded-sm shadow-xs flex items-center gap-1">
                  <Maximize2 size={12} className="text-gold-600" />
                  {room.size.split('/')[0]}
                </div>
              </div>

              {/* Room Content */}
              <div className="p-5 sm:p-7 md:p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-2 text-[11px] sm:text-xs tracking-wider text-gray-400 uppercase font-medium">
                  <span>Suite #{100 + room.id} • {room.category}</span>
                  <span>{room.size.split('/')[1] || room.size}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-serif text-dark-900 mb-2.5 sm:mb-3 group-hover:text-gold-600 transition-colors">
                  {room.name}
                </h3>
                
                <p className="text-gray-600 font-light text-xs sm:text-sm mb-5 sm:mb-6 flex-grow leading-relaxed">
                  {room.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 sm:mb-7 text-xs text-gray-500 border-t border-gray-100 pt-4">
                  <span className="flex items-center gap-1.5 font-medium text-gray-700">
                    <Users size={15} className="text-gold-500" /> {room.guests} Guests
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-gray-700">
                    <Wine size={15} className="text-gold-500" /> Welcome Bar & Sommelier
                  </span>
                </div>

                {/* Pricing & CTA */}
                <div className="flex flex-wrap sm:flex-nowrap justify-between items-end gap-3 pt-4 border-t border-gray-100 mt-auto">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-0.5 font-medium">Starting from</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-serif text-dark-900">${room.price}</span>
                      <span className="text-xs text-gray-500">/ night</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 sm:py-2.5 border border-gray-200 text-xs font-semibold uppercase tracking-wider text-dark-900 rounded hover:bg-gray-50 transition-colors cursor-pointer text-center">
                      Details
                    </button>
                    <button className="flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 bg-dark-900 text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-dark-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
                      Reserve <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer info notice */}
        <div className="mt-12 sm:mt-16 text-center bg-white p-5 sm:p-6 border border-gray-100 rounded-xl shadow-xs max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
            All rooms and suites include complimentary fiber Wi-Fi, daily hydrotherapy access, airport arrival transfers, and 24/7 dedicated concierge assistance.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RoomsSection;
