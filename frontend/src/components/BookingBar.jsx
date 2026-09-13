import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Sparkles, 
  ChevronDown, 
  Check, 
  Search, 
  Moon, 
  ShieldCheck,
  Plus,
  Minus
} from 'lucide-react';

const GUEST_PRESETS = [
  { label: '2 Adults, 1 Suite', sub: 'Couples & Executive Stays', adults: 2, suites: 1 },
  { label: '1 Adult, 1 Suite', sub: 'Solo Business & Sanctuary', adults: 1, suites: 1 },
  { label: '2 Adults, 2 Suites', sub: 'Adjacent Executive Suites', adults: 2, suites: 2 },
  { label: 'Family (4 Guests, 2 Suites)', sub: 'Connected Family Residences', adults: 4, suites: 2 },
  { label: 'Diplomatic Delegation (6+)', sub: 'Multi-Suite VIP Protocol', adults: 6, suites: 3 },
];

const TIER_OPTIONS = [
  { 
    title: 'Horizon Member Tier', 
    badge: '★ Best Value', 
    desc: 'Guaranteed 15% private rate, welcome cocktails & late checkout' 
  },
  { 
    title: 'Standard Flexible Rate', 
    badge: 'Free Cancel', 
    desc: 'Full booking flexibility with free cancellation up to 24h prior' 
  },
  { 
    title: 'Forbes VIP Presidential', 
    badge: 'Elite VIP', 
    desc: 'Dedicated 24/7 butler, private airport limousine & champagne' 
  },
  { 
    title: 'Diplomatic Summit Rate', 
    badge: 'Protocol', 
    desc: 'Special rate for AU, UNECA, embassy and diplomatic delegations' 
  },
];

const BookingBar = () => {
  const [checkIn, setCheckIn] = useState('2026-09-15');
  const [checkOut, setCheckOut] = useState('2026-09-20');
  const [selectedGuests, setSelectedGuests] = useState('2 Adults, 1 Suite');
  const [selectedTier, setSelectedTier] = useState('Horizon Member Tier');

  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [isTierOpen, setIsTierOpen] = useState(false);

  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);
  const guestsDropdownRef = useRef(null);
  const tierDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (guestsDropdownRef.current && !guestsDropdownRef.current.contains(event.target)) {
        setIsGuestsOpen(false);
      }
      if (tierDropdownRef.current && !tierDropdownRef.current.contains(event.target)) {
        setIsTierOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate nights
  const calculateNights = () => {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diffTime = d2 - d1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();

  // Format date display
  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const handleOpenPicker = (ref) => {
    if (ref.current) {
      if (typeof ref.current.showPicker === 'function') {
        ref.current.showPicker();
      } else {
        ref.current.focus();
      }
    }
  };

  return (
    <div className="relative z-30 w-full max-w-6xl px-4 mb-8 lg:-mb-16 lg:mt-auto">
      {/* Perks banner above bar */}
      <div className="flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] text-gray-300 uppercase tracking-widest px-2 sm:px-4 pb-2 font-medium gap-2">
        <span className="text-gold-500 font-semibold tracking-[0.2em] flex items-center gap-1.5">
          <Sparkles size={13} className="text-gold-400" />
          Direct Reservation Perks
        </span>
        <div className="flex items-center gap-3 sm:gap-4 text-gray-300">
          <span className="flex items-center gap-1">
            <Check size={12} className="text-gold-400" /> Best Rate Guaranteed
          </span>
          <span className="hidden md:inline">• Complimentary Valet & Welcome Cocktails</span>
        </div>
      </div>

      {/* Main Reservation Bar Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-2 sm:p-3 border border-gray-100/90 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 items-center backdrop-blur-md">
        
        {/* FIELD 1: CHECK-IN */}
        <div 
          onClick={() => handleOpenPicker(checkInRef)}
          className="p-3 border-b sm:border-b-0 sm:border-r border-gray-100 hover:bg-amber-50/40 rounded-xl transition-all cursor-pointer relative group flex flex-col justify-center"
        >
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
              <Calendar size={12} className="text-gold-600 group-hover:scale-110 transition-transform" />
              <span>Check-in</span>
            </label>
            <span className="text-[9px] text-gray-400 font-mono hidden sm:inline">From 2:00 PM</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold text-xs sm:text-sm text-dark-900 group-hover:text-gold-600 transition-colors">
              {formatDateLabel(checkIn)}
            </div>
            <input 
              ref={checkInRef}
              type="date" 
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-7 h-7 opacity-0 absolute right-2 bottom-2 cursor-pointer"
            />
            <div className="w-6 h-6 rounded-md bg-amber-50 group-hover:bg-amber-100/80 text-gold-700 flex items-center justify-center shrink-0 transition-colors">
              <Calendar size={13} />
            </div>
          </div>
        </div>

        {/* FIELD 2: CHECK-OUT */}
        <div 
          onClick={() => handleOpenPicker(checkOutRef)}
          className="p-3 border-b sm:border-b-0 lg:border-r border-gray-100 hover:bg-amber-50/40 rounded-xl transition-all cursor-pointer relative group flex flex-col justify-center"
        >
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
              <Calendar size={12} className="text-gold-600 group-hover:scale-110 transition-transform" />
              <span>Check-out</span>
            </label>
            {/* Nights badge */}
            <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded flex items-center gap-1">
              <Moon size={10} className="text-amber-700" />
              {nights} {nights === 1 ? 'Night' : 'Nights'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold text-xs sm:text-sm text-dark-900 group-hover:text-gold-600 transition-colors">
              {formatDateLabel(checkOut)}
            </div>
            <input 
              ref={checkOutRef}
              type="date" 
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-7 h-7 opacity-0 absolute right-2 bottom-2 cursor-pointer"
            />
            <div className="w-6 h-6 rounded-md bg-amber-50 group-hover:bg-amber-100/80 text-gold-700 flex items-center justify-center shrink-0 transition-colors">
              <Calendar size={13} />
            </div>
          </div>
        </div>

        {/* FIELD 3: GUESTS & SUITES CUSTOM DROPDOWN */}
        <div 
          ref={guestsDropdownRef} 
          className="p-3 border-b sm:border-b-0 sm:border-r border-gray-100 hover:bg-amber-50/40 rounded-xl transition-all relative group"
        >
          <div 
            onClick={() => {
              setIsGuestsOpen(!isGuestsOpen);
              setIsTierOpen(false);
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                <Users size={12} className="text-gold-600 group-hover:scale-110 transition-transform" />
                <span>Guests & Suites</span>
              </label>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-xs sm:text-sm text-dark-900 group-hover:text-gold-600 transition-colors truncate">
                {selectedGuests}
              </span>
              <ChevronDown 
                size={14} 
                className={`text-gray-400 group-hover:text-gold-600 transition-transform duration-200 shrink-0 ${isGuestsOpen ? 'rotate-180 text-gold-600' : ''}`} 
              />
            </div>
          </div>

          {/* Luxury Dropdown Menu */}
          {isGuestsOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50 animate-fade-in divide-y divide-gray-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Select Guest Configuration
              </div>
              <div className="py-1 space-y-0.5 max-h-60 overflow-y-auto">
                {GUEST_PRESETS.map((preset) => {
                  const isSelected = selectedGuests === preset.label;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setSelectedGuests(preset.label);
                        setIsGuestsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between text-xs cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-50/80 text-dark-900 font-semibold border border-amber-200/60' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-xs">{preset.label}</div>
                        <div className="text-[10px] text-gray-400 font-light">{preset.sub}</div>
                      </div>
                      {isSelected && <Check size={14} className="text-gold-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* FIELD 4: PREFERRED TIER CUSTOM DROPDOWN */}
        <div 
          ref={tierDropdownRef} 
          className="p-3 hover:bg-amber-50/40 rounded-xl transition-all relative group"
        >
          <div 
            onClick={() => {
              setIsTierOpen(!isTierOpen);
              setIsGuestsOpen(false);
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                <Sparkles size={12} className="text-gold-600 group-hover:scale-110 transition-transform" />
                <span>Preferred Tier</span>
              </label>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-xs sm:text-sm text-gold-600 group-hover:text-gold-700 transition-colors truncate">
                {selectedTier}
              </span>
              <ChevronDown 
                size={14} 
                className={`text-gold-500 transition-transform duration-200 shrink-0 ${isTierOpen ? 'rotate-180' : ''}`} 
              />
            </div>
          </div>

          {/* Luxury Dropdown Menu */}
          {isTierOpen && (
            <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-2 w-72 sm:w-84 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50 animate-fade-in divide-y divide-gray-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Select Horizon Privilege Tier
              </div>
              <div className="py-1 space-y-1">
                {TIER_OPTIONS.map((tier) => {
                  const isSelected = selectedTier === tier.title;
                  return (
                    <button
                      key={tier.title}
                      type="button"
                      onClick={() => {
                        setSelectedTier(tier.title);
                        setIsTierOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-start justify-between text-xs cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-50/90 text-dark-900 border border-amber-300/60' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs">{tier.title}</span>
                          <span className="text-[9px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium">
                            {tier.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-light mt-0.5 leading-snug">
                          {tier.desc}
                        </div>
                      </div>
                      {isSelected && <Check size={14} className="text-gold-600 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* FIELD 5: ACTION BUTTON */}
        <div className="p-1 sm:col-span-2 lg:col-span-1">
          <a 
            href="#rooms" 
            className="w-full h-12 bg-dark-900 hover:bg-gold-600 text-white font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-gold-500/20 cursor-pointer group"
          >
            <Search size={14} className="group-hover:scale-110 transition-transform text-gold-400" />
            <span>Check Availability</span>
          </a>
        </div>

      </div>
    </div>
  );
};

export default BookingBar;
