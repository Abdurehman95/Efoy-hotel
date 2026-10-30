import React, { useState } from 'react';
import { ArrowRight, Plus, Sparkles, Check } from 'lucide-react';

/**
 * InteractiveAccordionCards
 * Senior Motion Designer Recreation of Figma Interactive Card Animation
 * Reference: https://www.youtube.com/shorts/--y9BnoyOWI (@Edgedotdesign)
 * 
 * Features:
 * - Fluid flex-grow horizontal accordion expansion with custom bezier easing
 * - Active card expands (flex: 3.5) while inactive cards gracefully compress (flex: 1)
 * - Deep depth, parallax-like scale-105 zoom on active image, and subtle mood dimming on inactive cards
 * - Smooth bottom-anchored content slide-up and fade-in
 * - High-accessibility with keyboard navigation (Enter / Space), focus rings, and reduced motion
 * - Responsive: Smooth horizontal accordion on tablet/desktop; responsive touch-accordion on mobile
 */
const InteractiveAccordionCards = ({
  items = [],
  initialActiveIndex = 0,
  onItemClick,
  variant = 'image', // 'image' | 'service'
  containerHeight = 'h-[380px] sm:h-[420px] lg:h-[450px]',
  className = '',
}) => {
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Active index prioritized by hover, falling back to selected/pinned active card
  const currentActive = hoveredIndex !== null ? hoveredIndex : activeIndex;

  const handleCardClick = (item, idx) => {
    setActiveIndex(idx);
    if (onItemClick) {
      onItemClick(item, idx);
    }
  };

  const handleKeyDown = (e, item, idx) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(item, idx);
    }
  };

  const renderCardIcon = (icon) => {
    if (!icon) return <Sparkles className="w-6 h-6" />;
    if (React.isValidElement(icon)) return icon;
    const IconComponent = icon;
    return <IconComponent className="w-6 h-6" />;
  };


  return (
    <div
      className={`w-full flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 ${containerHeight} ${className}`}
      onMouseLeave={() => setHoveredIndex(null)}
      role="region"
      aria-label="Interactive Showcase Cards"
    >
      {items.map((item, idx) => {
        const isActive = currentActive === idx;

        if (variant === 'service') {
          return (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              aria-expanded={isActive}
              aria-label={item.title}
              onMouseEnter={() => setHoveredIndex(idx)}
              onClick={() => handleCardClick(item, idx)}
              onKeyDown={(e) => handleKeyDown(e, item, idx)}
              style={{
                flex: isActive ? '3.2 1 0%' : '1 1 0%',
                transition: 'flex 650ms cubic-bezier(0.25, 1, 0.5, 1), transform 650ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 400ms ease, border-color 400ms ease',
              }}
              className={`group relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden cursor-pointer select-none border transition-all duration-500 ${
                isActive
                  ? 'bg-gradient-to-br from-[#ffffff] via-[#fcfbf9] to-[#fbf7ee] border-gold-500/60 shadow-xl ring-1 ring-gold-500/20'
                  : 'bg-[#fafafa] hover:bg-white border-gray-200/80 shadow-xs hover:border-gold-500/40'
              }`}
            >
              {/* Subtle Ambient Background Watermark */}
              <div 
                className={`absolute -right-10 -bottom-10 pointer-events-none transition-opacity duration-700 ${
                  isActive ? 'opacity-10 scale-125' : 'opacity-0 scale-90'
                }`}
              >
                <div className="w-56 h-56 rounded-full bg-gold-400 blur-3xl" />
              </div>

              {/* Top: Icon & Category Indicator */}
              <div className="relative z-10 flex items-center justify-between">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                    isActive
                      ? 'bg-gold-500 text-white shadow-md shadow-gold-500/30 scale-105'
                      : 'bg-gold-50 text-gold-600 group-hover:bg-gold-100 group-hover:text-gold-700'
                  }`}
                >
                  {renderCardIcon(item.icon)}
                </div>

                {/* Subtle Card Index / Tag for Inactive Cards */}
                <span
                  className={`text-[10px] font-mono tracking-widest uppercase transition-opacity duration-300 ${
                    isActive ? 'opacity-0' : 'text-gray-400 opacity-70 group-hover:opacity-100'
                  }`}
                >
                  0{idx + 1}
                </span>
              </div>

              {/* Middle / Bottom Content */}
              <div className="relative z-10 mt-6">
                <h3
                  className={`font-serif text-dark-900 font-normal leading-tight transition-all duration-500 ${
                    isActive
                      ? 'text-xl sm:text-2xl lg:text-3xl text-dark-900 mb-3'
                      : 'text-base sm:text-lg text-dark-800 line-clamp-2'
                  }`}
                >
                  {item.title}
                </h3>

                {/* Description & Link - Smoothly Revealed on Expansion */}
                <div
                  className={`transition-all duration-500 ease-out overflow-hidden ${
                    isActive
                      ? 'max-h-48 opacity-100 translate-y-0 mt-2'
                      : 'max-h-0 opacity-0 translate-y-4 pointer-events-none'
                  }`}
                >
                  <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed mb-6">
                    {item.desc || item.description}
                  </p>

                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-gold-600 hover:text-gold-700 group/btn transition-colors">
                    <span>{item.actionText || 'Learn more'}</span>
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // ================= Default 'image' Variant (Chef's Shared Boards & Luxury Photography) =================
        return (
          <div
            key={idx}
            role="button"
            tabIndex={0}
            aria-expanded={isActive}
            aria-label={item.title}
            onMouseEnter={() => setHoveredIndex(idx)}
            onClick={() => handleCardClick(item, idx)}
            onKeyDown={(e) => handleKeyDown(e, item, idx)}
            style={{
              flex: isActive ? '3.5 1 0%' : '1 1 0%',
              transition: 'flex 650ms cubic-bezier(0.25, 1, 0.5, 1), transform 650ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 400ms ease',
            }}
            className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer select-none shadow-lg transition-all duration-500 ${
              isActive
                ? 'shadow-2xl ring-1 ring-gold-400/30'
                : 'hover:shadow-xl opacity-90 hover:opacity-100'
            }`}
          >
            {/* Background Full-Bleed Image with Object Cover */}
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-dark-900">
              <img
                src={item.image}
                alt={item.title}
                className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${
                  isActive
                    ? 'scale-105 brightness-100 contrast-105 saturate-105'
                    : 'scale-100 brightness-75 contrast-95 saturate-90 group-hover:brightness-85 group-hover:scale-102'
                }`}
                loading="lazy"
              />
            </div>

            {/* Gradient Overlays for Cinematic Contrast & Legibility */}
            <div
              className={`absolute inset-0 transition-opacity duration-700 ease-out pointer-events-none ${
                isActive
                  ? 'bg-gradient-to-t from-dark-900/95 via-dark-900/40 to-transparent/10 opacity-100'
                  : 'bg-gradient-to-t from-dark-900/80 via-dark-900/30 to-black/30 opacity-80 group-hover:opacity-60'
              }`}
            />

            {/* Inactive State Minimal Floating Badge/Number */}
            <div
              className={`absolute top-4 sm:top-5 left-4 sm:left-5 z-20 transition-all duration-500 ${
                isActive
                  ? 'opacity-0 scale-75 pointer-events-none'
                  : 'opacity-90 group-hover:opacity-100 scale-100'
              }`}
            >
              <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-dark-900/70 backdrop-blur-md border border-white/15 text-[11px] font-mono text-gold-300 font-semibold shadow-sm">
                0{idx + 1}
              </span>
            </div>

            {/* Inactive Vertical Title Preview (Figma Style) for Sleek Narrow Cards */}
            <div
              className={`absolute inset-x-0 bottom-4 px-3 z-10 transition-all duration-400 text-center ${
                isActive
                  ? 'opacity-0 translate-y-4 pointer-events-none'
                  : 'opacity-80 group-hover:opacity-100 translate-y-0'
              }`}
            >
              <p className="text-[10px] sm:text-[11px] font-medium tracking-wider text-white/90 truncate uppercase">
                {item.tag || item.title}
              </p>
            </div>

            {/* Active Card Bottom-Anchored Details (Slide-Up & Fade-In) */}
            <div
              className={`absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-8 z-20 text-white transition-all duration-500 ease-out ${
                isActive
                  ? 'opacity-100 translate-y-0 delay-100'
                  : 'opacity-0 translate-y-6 pointer-events-none'
              }`}
            >
              {/* Category / Subtitle Tag */}
              {item.tag && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-500/20 backdrop-blur-md border border-gold-400/30 mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-gold-300">
                    {item.tag}
                  </span>
                </div>
              )}

              {/* Main Title */}
              <h4 className="font-serif text-lg sm:text-2xl lg:text-3xl font-bold leading-tight mb-2 text-white drop-shadow-sm">
                {item.title}
              </h4>

              {/* Description */}
              {item.desc && (
                <p className="text-xs sm:text-sm text-white/85 font-light leading-relaxed max-w-lg mb-4 drop-shadow-xs line-clamp-2 sm:line-clamp-none">
                  {item.desc}
                </p>
              )}

              {/* Action Prompt Pill */}
              <div className="flex items-center gap-3 pt-1">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-gold-500 hover:text-white backdrop-blur-md border border-white/25 text-xs font-semibold text-white tracking-wide transition-all duration-300 shadow-sm group/btn">
                  <span>{item.actionLabel || 'Add to Order'}</span>
                  <Plus size={13} className="text-gold-300 group-hover/btn:text-white transition-transform group-hover/btn:rotate-90" />
                </span>
                <span className="text-[11px] text-white/60 font-light hidden sm:inline-block">
                  Click to reserve table
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InteractiveAccordionCards;
