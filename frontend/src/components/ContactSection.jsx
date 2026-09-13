import React, { useState } from 'react';
import { 
  MapPin, 
  Plane, 
  Car, 
  Landmark, 
  Navigation, 
  ExternalLink, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  X, 
  ShieldCheck
} from 'lucide-react';

const HOTEL_ADDRESS = 'Africa Avenue, Bole, Addis Ababa, Ethiopia';
const HOTEL_COORDS = '8.9982° N, 38.7865° E';
const GOOGLE_MAPS_SEARCH_URL = 'https://www.google.com/maps/search/?api=1&query=Bole,+Addis+Ababa,+Ethiopia';
const GOOGLE_MAPS_DIRECTIONS_URL = 'https://www.google.com/maps/dir/?api=1&destination=Bole,+Addis+Ababa,+Ethiopia';
const MAP_EMBED_URL = 'https://maps.google.com/maps?q=Bole,+Addis+Ababa,+Ethiopia&t=&z=14&ie=UTF8&iwloc=&output=embed';

const ContactSection = () => {
  const [copied, setCopied] = useState(false);
  const [isCardMinimized, setIsCardMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChauffeurOpen, setIsChauffeurOpen] = useState(false);
  const [chauffeurSuccess, setChauffeurSuccess] = useState(false);

  // Chauffeur booking state
  const [chauffeurData, setChauffeurData] = useState({
    vehicle: 'Mercedes-Benz S-Class VIP',
    pickup: 'Addis Ababa Bole International Airport (ADD) - Terminal 2',
    flightNumber: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    guests: '2 Passengers',
    notes: 'Diplomatic welcome & luggage assistance'
  });

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(HOTEL_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleChauffeurSubmit = (e) => {
    e.preventDefault();
    setChauffeurSuccess(true);
    setTimeout(() => {
      setChauffeurSuccess(false);
      setIsChauffeurOpen(false);
    }, 2800);
  };

  return (
    <section id="contact" className="flex flex-col">
      {/* Location Map Section */}
      <div className="py-16 sm:py-24 px-4 sm:px-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            
            {/* Left Column: Address & Location Highlights */}
            <div className="lg:w-1/3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <span className="text-[10px] sm:text-[11px] tracking-[0.25em] text-gold-600 uppercase font-semibold block">
                    Premier Diplomatic Address
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-ping"></span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-dark-900 mb-4 sm:mb-6 leading-tight">
                  Perfect Position in Addis Ababa
                </h2>
                
                <p className="text-gray-600 font-light text-sm sm:text-base mb-8 sm:mb-10 leading-relaxed">
                  Occupying a prestigious address along Africa Avenue in Addis Ababa's vibrant Bole diplomatic and business quarter, 
                  Efoy Hotel & Suites balances peaceful sanctuary with immediate proximity to Bole International Airport, 
                  diplomatic missions, and celebrated cultural attractions.
                </p>
                
                {/* Distance & Transit Highlights */}
                <ul className="space-y-4 sm:space-y-5">
                  <li className="flex gap-4 items-start p-3 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="w-10 h-10 bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 rounded-md group-hover:bg-amber-100 transition-colors">
                      <Plane size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-serif text-dark-900 text-sm font-semibold">8 Minutes to Bole International (ADD)</h5>
                        <span className="text-[10px] text-amber-700 font-mono bg-amber-50 px-1.5 py-0.5 rounded">3.8 km</span>
                      </div>
                      <p className="text-xs text-gray-500 font-light mt-0.5">Complimentary VIP house chauffeur airport shuttle</p>
                    </div>
                  </li>

                  <li className="flex gap-4 items-start p-3 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="w-10 h-10 bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 rounded-md group-hover:bg-blue-100 transition-colors">
                      <Landmark size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-serif text-dark-900 text-sm font-semibold">10 Minutes to African Union & UNECA</h5>
                        <span className="text-[10px] text-blue-700 font-mono bg-blue-50 px-1.5 py-0.5 rounded">5.2 km</span>
                      </div>
                      <p className="text-xs text-gray-500 font-light mt-0.5">Direct arterial access for summits & diplomatic delegations</p>
                    </div>
                  </li>

                  <li className="flex gap-4 items-start p-3 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-900 flex items-center justify-center shrink-0 rounded-md group-hover:bg-emerald-100 transition-colors">
                      <Car size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-serif text-dark-900 text-sm font-semibold">12 Minutes to Meskel Square & Unity Park</h5>
                        <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded">6.0 km</span>
                      </div>
                      <p className="text-xs text-gray-500 font-light mt-0.5">National Palace, museums, and historic central plazas</p>
                    </div>
                  </li>
                </ul>
                
                {/* Action CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10">
                  <a
                    href={GOOGLE_MAPS_DIRECTIONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-dark-900 text-white px-6 py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-gold-600 transition-all cursor-pointer text-center rounded-sm flex items-center justify-center gap-2 shadow-sm group"
                  >
                    <Navigation size={14} className="group-hover:rotate-45 transition-transform duration-300 text-gold-400" />
                    <span>Get Directions</span>
                  </a>
                  <button 
                    onClick={() => setIsChauffeurOpen(true)}
                    className="w-full sm:w-auto bg-slate-100 text-slate-900 px-6 py-3.5 text-xs uppercase tracking-widest font-semibold hover:bg-slate-200 transition-all cursor-pointer text-center rounded-sm flex items-center justify-center gap-2 border border-slate-200"
                  >
                    <Car size={14} className="text-slate-600" />
                    <span>Book Airport Chauffeur</span>
                  </button>
                </div>
              </div>

              {/* Verified Sanctuary Badge */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                <ShieldCheck size={20} className="text-gold-600 shrink-0" />
                <div className="text-xs text-gray-500">
                  <span className="font-semibold text-dark-900">GPS Coordinates: </span>
                  <span className="font-mono text-[11px] text-gray-600">{HOTEL_COORDS}</span>
                </div>
              </div>
            </div>
            
            {/* Right Column: Clean Map Integration (No Top Nav) */}
            <div className="lg:w-2/3 w-full">
              <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white flex flex-col">
                
                {/* Clean Map Display Container */}
                <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[550px] bg-slate-100 overflow-hidden">
                  
                  {/* Real Interactive Map Iframe for Addis Ababa, Ethiopia */}
                  <iframe
                    title="Efoy Hotel & Suites Addis Ababa Map"
                    src={MAP_EMBED_URL}
                    className="w-full h-full border-0 filter contrast-[1.03]"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>

                  {/* Top-Right Quick Expand Button */}
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                    <a
                      href={GOOGLE_MAPS_SEARCH_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open full view in Google Maps"
                      className="bg-white/95 hover:bg-white text-slate-800 text-xs px-3 py-2 rounded-lg shadow-md backdrop-blur-sm border border-slate-200/80 flex items-center gap-1.5 transition-all font-medium"
                    >
                      <ExternalLink size={13} className="text-slate-600" />
                      <span className="hidden sm:inline text-[11px]">Google Maps</span>
                    </a>
                    <button
                      onClick={() => setIsFullscreen(true)}
                      title="Fullscreen Map"
                      className="p-2 bg-white/95 hover:bg-white text-slate-800 rounded-lg shadow-md backdrop-blur-sm border border-slate-200/80 transition-all cursor-pointer"
                    >
                      <Maximize2 size={15} />
                    </button>
                  </div>

                  {/* Floating Luxury Information Overlay Card */}
                  <div className="absolute top-4 left-4 z-20 max-w-[280px] sm:max-w-sm">
                    {isCardMinimized ? (
                      <button
                        onClick={() => setIsCardMinimized(false)}
                        className="bg-dark-900/90 text-white text-xs px-3.5 py-2 rounded-lg shadow-xl backdrop-blur-md border border-white/20 flex items-center gap-2 hover:bg-dark-900 transition-all cursor-pointer animate-fade-in"
                      >
                        <MapPin size={14} className="text-gold-400" />
                        <span className="font-serif font-semibold">Efoy Hotel & Suites</span>
                        <span className="text-[10px] text-gold-400 underline ml-1">Show Details</span>
                      </button>
                    ) : (
                      <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 sm:p-5 shadow-2xl border border-gray-100 text-left transition-all animate-fade-in relative">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <Sparkles size={11} className="text-gold-600" />
                            <span>5-Star Sanctuary • Addis Ababa</span>
                          </div>
                          <button
                            onClick={() => setIsCardMinimized(true)}
                            className="text-gray-400 hover:text-gray-700 p-1 -mr-1 -mt-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Minimize card"
                          >
                            <Minimize2 size={13} />
                          </button>
                        </div>

                        <h4 className="font-serif text-dark-900 text-base sm:text-lg font-bold leading-snug">
                          Efoy Hotel & Suites
                        </h4>
                        
                        <p className="text-xs text-gray-600 font-light mt-1 mb-3 leading-relaxed">
                          {HOTEL_ADDRESS}
                        </p>

                        <div className="flex items-center gap-2 mb-3.5 text-[11px] text-gray-500 font-mono">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>Airport Shuttle & Valet Active</span>
                        </div>

                        {/* Action buttons on the card */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <a
                            href={GOOGLE_MAPS_DIRECTIONS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-dark-900 hover:bg-gold-600 text-white text-[11px] font-semibold py-2 px-3 rounded-md transition-colors text-center flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <Navigation size={12} />
                            <span>Navigate</span>
                          </a>

                          <button
                            onClick={handleCopyAddress}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium py-2 px-3 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                            title="Copy address to clipboard"
                          >
                            {copied ? (
                              <>
                                <Check size={12} className="text-emerald-600" />
                                <span className="text-emerald-700 font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Amenities Ribbon at bottom of map */}
                  <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none hidden sm:flex justify-center">
                    <div className="bg-slate-900/85 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg border border-white/10 flex items-center gap-4 text-[11px] pointer-events-auto">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span>
                        Bole Airport: 8 Min Transfer
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span>
                        24/7 Secure Valet Parking
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span>
                        Diplomatic Quarter Adjacent
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-bar with location guide */}
                <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
                  <div className="flex items-center gap-2 text-[11px]">
                    <MapPin size={14} className="text-gold-600" />
                    <span>Africa Avenue, Bole Sub-City • Addis Ababa, Ethiopia</span>
                  </div>
                  <a
                    href={GOOGLE_MAPS_SEARCH_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-800 hover:text-amber-900 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <span>Open in Google Maps App</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FULLSCREEN MAP MODAL */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-gold-500" />
                <div>
                  <h3 className="font-serif text-base font-bold text-white">Efoy Hotel & Suites — Addis Ababa, Ethiopia</h3>
                  <p className="text-[11px] text-slate-400">{HOTEL_ADDRESS}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={GOOGLE_MAPS_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                >
                  <Navigation size={13} />
                  <span>Open Directions</span>
                </a>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close fullscreen"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Map iframe */}
            <div className="flex-1 w-full h-full relative">
              <iframe
                title="Efoy Hotel Fullscreen Map"
                src={MAP_EMBED_URL}
                className="w-full h-full border-0"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* CHAUFFEUR / AIRPORT TRANSFER BOOKING MODAL */}
      {isChauffeurOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-scale-up">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center">
                  <Car size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Airport & VIP Chauffeur Transfer</h3>
                  <p className="text-[11px] text-slate-400 font-light">Direct private transportation to Efoy Hotel & Suites</p>
                </div>
              </div>
              <button
                onClick={() => setIsChauffeurOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {chauffeurSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Check size={28} />
                </div>
                <h4 className="font-serif text-xl font-bold text-slate-900">Transfer Confirmed!</h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  Your VIP chauffeur transfer has been scheduled. Our concierge team will meet you at Bole International Airport.
                </p>
                <span className="inline-block text-[11px] font-mono text-amber-800 bg-amber-50 px-3 py-1 rounded-full">
                  Confirmation #EFY-ADD-{Math.floor(100000 + Math.random() * 900000)}
                </span>
              </div>
            ) : (
              <form onSubmit={handleChauffeurSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Select Fleet Vehicle
                  </label>
                  <select
                    value={chauffeurData.vehicle}
                    onChange={(e) => setChauffeurData({ ...chauffeurData, vehicle: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 font-medium"
                  >
                    <option>Mercedes-Benz S-Class VIP (Diplomatic Comfort)</option>
                    <option>Toyota Land Cruiser V8 Executive (All-Terrain Luxury)</option>
                    <option>Range Rover Autobiography (Presidential Class)</option>
                    <option>Mercedes-Benz V-Class (VIP Family & Delegation)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Pickup Location
                  </label>
                  <select
                    value={chauffeurData.pickup}
                    onChange={(e) => setChauffeurData({ ...chauffeurData, pickup: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 font-medium"
                  >
                    <option>Addis Ababa Bole International Airport (ADD) - Terminal 2 (International)</option>
                    <option>Addis Ababa Bole International Airport (ADD) - Terminal 1 (Domestic)</option>
                    <option>ADD Airport VIP Diplomatic Lounge / Presidential Pavilion</option>
                    <option>African Union (AU) Headquarters</option>
                    <option>United Nations Economic Commission for Africa (UNECA)</option>
                    <option>Custom Address in Addis Ababa</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={chauffeurData.date}
                      onChange={(e) => setChauffeurData({ ...chauffeurData, date: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Pickup Time
                    </label>
                    <input
                      type="time"
                      value={chauffeurData.time}
                      onChange={(e) => setChauffeurData({ ...chauffeurData, time: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Flight # (e.g. ET 500)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ET 500 / Ethiopian Airlines"
                      value={chauffeurData.flightNumber}
                      onChange={(e) => setChauffeurData({ ...chauffeurData, flightNumber: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Guests & Luggage
                    </label>
                    <select
                      value={chauffeurData.guests}
                      onChange={(e) => setChauffeurData({ ...chauffeurData, guests: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 font-medium"
                    >
                      <option>1-2 Passengers (2 Bags)</option>
                      <option>3-4 Passengers (4 Bags)</option>
                      <option>Diplomatic Delegation (5+ Bags)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-dark-900 hover:bg-gold-600 text-white text-xs uppercase tracking-widest font-semibold rounded-lg transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Car size={15} />
                    <span>Confirm Chauffeur Transfer</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2 font-light">
                    Complimentary airport transfer for Horizon Club members • 24/7 Concierge dispatch
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div className="bg-dark-900 py-16 sm:py-24 px-4 sm:px-8 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="w-12 h-12 border border-white/20 flex items-center justify-center mx-auto mb-5 sm:mb-6 text-white">
            <span className="font-serif text-xl text-white">EH</span>
          </div>
          <span className="text-[10px] sm:text-[11px] tracking-[0.2em] text-gold-500 uppercase mb-3 sm:mb-4 block font-semibold">Efoy Circle Membership</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-4 sm:mb-6 leading-tight text-white font-semibold">
            Subscribe for Private Rates & Seasonal Invitations
          </h2>
          <p className="text-white/70 font-light mb-8 sm:mb-10 text-xs sm:text-sm max-w-xl mx-auto">
            Members receive guaranteed priority reservations, complimentary room upgrades upon arrival when available, 
            and invitations to private cultural and culinary events.
          </p>
          <form className="flex flex-col sm:flex-row justify-center max-w-lg mx-auto gap-3 sm:gap-4">
            <input 
              type="email" 
              placeholder="Enter your private email address" 
              className="bg-white/10 border border-white/20 text-white px-5 sm:px-6 py-3 w-full focus:outline-none focus:border-gold-500 placeholder-white/40 text-sm rounded-xs"
            />
            <button className="bg-gold-500 text-white px-8 py-3 text-sm font-medium hover:bg-gold-600 transition-colors whitespace-nowrap cursor-pointer rounded-xs">
              Join Efoy Club
            </button>
          </form>
          <p className="text-[10px] text-white/40 mt-4">By joining, you consent to our Privacy Policy and Terms of Service.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#fafafa] py-12 sm:py-16 px-4 sm:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
          <div className="col-span-1 sm:col-span-2 md:col-span-1 text-left">
            <img
              src="/images/logo.png"
              alt="Efoy Hotel & Suites"
              className="h-20 sm:h-24 w-auto object-contain mb-4"
            />
            <p className="text-xs text-gray-500 mt-2 font-light leading-relaxed max-w-xs">
              Five-Star luxury sanctuary in Addis Ababa offering authentic Ethiopian hospitality, fine dining, and refined comfort.
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
                +251 (11) 667-0199
              </li>
              <li>
                <span className="block text-dark-900 font-medium">Email:</span>
                concierge@efoyhotel.com
              </li>
              <li className="pt-1 sm:pt-2">
                <span className="block text-dark-900 font-medium">Address:</span>
                Africa Avenue, Bole<br/>Addis Ababa, Ethiopia
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center pt-6 sm:pt-8 border-t border-gray-200 text-xs text-gray-500 gap-4">
          <p>© 2026 Efoy Hotel & Suites. All rights reserved.</p>
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
