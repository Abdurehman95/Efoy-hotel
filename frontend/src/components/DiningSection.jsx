import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Plus, 
  Sparkles,
  ShoppingBag,
  Utensils
} from 'lucide-react';

// Menu dishes mapped to food1 - food6
const DISHES_DATA = [
  {
    id: 1,
    title: 'Eggs & Bacon',
    price: '$24.00',
    priceNum: 24,
    description: 'It is a culinary innovation that puts a unique spin on the beloved breakfast combination.',
    tags: ['ORGANIC EGGS', 'SMOKED CRISP'],
    category: 'Hot Savory Classics',
    badge: "CHEF'S CHOICE",
    badgeType: 'dark',
    image: '/images/food1.png',
    featured: false,
  },
  {
    id: 2,
    title: 'Tea or Coffee',
    price: '$10.00',
    priceNum: 10,
    description: 'A classic choice for your daily dose of comfort and calmness.',
    tags: ['SINGLE ORIGIN', 'LOOSE LEAF'],
    category: 'Cold Pressed & Infusions',
    badge: 'BARISTA',
    badgeType: 'dark',
    image: '/images/food2.png',
    featured: false,
  },
  {
    id: 3,
    title: 'Chia Oatmeal',
    price: '$18.00',
    priceNum: 18,
    description: 'Our Chia Oatmeal is a wholesome nutrient-packed breakfast delight.',
    tags: ['VEGAN', 'GLUTEN-FREE'],
    category: 'Healthy Granola & Bowls',
    badge: 'WELLNESS',
    badgeType: 'emerald',
    image: '/images/food3.png',
    featured: false,
  },
  {
    id: 4,
    title: 'Fruit Parfait',
    price: '$16.00',
    priceNum: 16,
    description: 'Our Fruit Parfait is a delightful culinary masterpiece of freshness and flavor.',
    tags: ['HOUSE GRANOLA', 'GREEK YOGURT'],
    category: 'Healthy Granola & Bowls',
    badge: 'SIGNATURE',
    badgeType: 'gold',
    image: '/images/food4.png',
    featured: true, // Special dark luxury card style
  },
  {
    id: 5,
    title: 'Marmalade Selection',
    price: '$14.00',
    priceNum: 14,
    description: 'Our Marmalade Selection is a delectable medley of vibrant, handcrafted citrus preserves.',
    tags: ['SEVILLE ORANGE', 'WARM BRIOCHE'],
    category: 'Morning Bakery & Viennoiserie',
    badge: 'ARTISAN',
    badgeType: 'amber',
    image: '/images/food5.png',
    featured: false,
  },
  {
    id: 6,
    title: 'Cheese Plate',
    price: '$28.00',
    priceNum: 28,
    description: 'Our cheese plate is a masterpiece that celebrates rich and diverse world of cheeses.',
    tags: ['AOC CHEESES', 'WILD HONEYCOMB'],
    category: 'Artisanal Cheeses & Spreads',
    badge: 'RESERVE',
    badgeType: 'dark',
    image: '/images/food6.png',
    featured: false,
  },
  {
    id: 7,
    title: 'Brioche French Toast',
    price: '$22.00',
    priceNum: 22,
    description: 'Caramelized Madagascar vanilla crust with wild mountain berry compote and whipped crème fraiche.',
    tags: ['ARTISAN BRIOCHE', 'MAPLE GLAZE'],
    category: 'Morning Bakery & Viennoiserie',
    badge: 'SWEET TOOTH',
    badgeType: 'amber',
    image: '/images/food7.png',
    featured: false,
  },
  {
    id: 8,
    title: 'Avocado Tartine & Poached Egg',
    price: '$21.00',
    priceNum: 21,
    description: 'Wood-fired sourdough, crushed Hass avocado, micro radish sprouts, and organic farm soft yolk.',
    tags: ['HAAS AVOCADO', 'FARM EGG'],
    category: 'Hot Savory Classics',
    badge: 'FRESH HARVEST',
    badgeType: 'emerald',
    image: '/images/food8.png',
    featured: false,
  },
];

// Bottom shared boards showcase
const SHARED_BOARDS = [
  {
    title: 'Artisan Charcuterie & Sourdough',
    tag: 'MORNING GRAZING',
    desc: 'Prosciutto di San Daniele, rustic levain, fig chutney',
    image: '/images/food7.png',
  },
  {
    title: 'Crushed Avocado & Heirloom Salsa',
    tag: 'TERRACE FAVORITE',
    desc: 'Crisp heirloom yellow bell pepper, stone-ground crisps',
    image: '/images/food8.png',
  },
  {
    title: 'The Aurelia Wagyu Breakfast Burger',
    tag: 'HEARTY CLASSICS',
    desc: 'Truffle emulsion, caramelized shallots, sunny duck egg',
    image: '/images/food3.png',
  },
];

const CATEGORIES = [
  'All Breakfast Items',
  'Morning Bakery & Viennoiserie',
  'Healthy Granola & Bowls',
  'Hot Savory Classics',
  'Artisanal Cheeses & Spreads',
  'Cold Pressed & Infusions',
];

const DiningSection = () => {
  const [activeCategory, setActiveCategory] = useState('All Breakfast Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [toastMessage, setToastMessage] = useState('');

  const itemsPerPage = 6;

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return DISHES_DATA.filter((dish) => {
      const matchesCategory =
        activeCategory === 'All Breakfast Items' || dish.category === activeCategory;
      const matchesSearch =
        dish.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Pagination slice
  const maxPages = Math.ceil(filteredDishes.length / itemsPerPage);
  const displayedDishes = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return filteredDishes.slice(start, start + itemsPerPage);
  }, [filteredDishes, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : Math.max(0, maxPages - 1)));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1 < maxPages ? prev + 1 : 0));
  };

  const handleAddToCart = (dishTitle) => {
    setToastMessage(`🍽️ Added "${dishTitle}" to your breakfast tray`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <section id="dining" className="py-16 sm:py-24 px-4 sm:px-8 bg-[#fafafa] relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-dark-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-gold-500/40 text-xs font-medium flex items-center gap-2.5 animate-slide-up">
          <div className="w-2 h-2 rounded-full bg-gold-400 animate-ping"></div>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* ===================== TOP HEADER ===================== */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-10">
          <div>
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] text-gray-400 uppercase font-semibold block mb-2 sm:mb-3">
              Seasonal Morning Selection — Spring / Summer 2025
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-dark-900 leading-tight">
              Our Food Menu
            </h2>
            <p className="text-gray-500 font-light text-xs sm:text-sm md:text-base max-w-2xl mt-3 leading-relaxed">
              Crafted each morning by Executive Chef Laurent with seasonal, organic produce 
              sourced directly from Hudson Valley estates and boutique French purveyors.
            </p>
          </div>

          {/* Right Side: Search & Carousel Navigation */}
          <div className="flex items-center gap-3 self-start lg:self-end">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search morning dishes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(0);
                }}
                className="pl-9 pr-4 py-2 rounded-full border border-gray-200 text-xs text-dark-900 bg-white placeholder-gray-400 focus:outline-none focus:border-dark-900 shadow-2xs w-48 sm:w-60 transition-all"
              />
            </div>

            {/* Carousel Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevPage}
                title="Previous dishes"
                className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-dark-900 hover:bg-dark-900 hover:text-white transition-all cursor-pointer shadow-2xs"
              >
                <ArrowLeft size={15} />
              </button>
              <button
                onClick={handleNextPage}
                title="Next dishes"
                className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-dark-900 hover:bg-dark-900 hover:text-white transition-all cursor-pointer shadow-2xs"
              >
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* ===================== CATEGORY FILTER PILLS ===================== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 sm:mb-12 no-scrollbar scroll-smooth">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setCurrentPage(0);
                }}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-dark-900 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:text-dark-900 border border-gray-200/80 hover:border-gray-400'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ===================== DISHES GRID (2 COLUMNS) ===================== */}
        {displayedDishes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200 my-8">
            <Utensils size={32} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-serif text-lg text-dark-900 font-semibold mb-1">No dishes found</h3>
            <p className="text-xs text-gray-500">Try changing your search term or category filter.</p>
            <button
              onClick={() => {
                setActiveCategory('All Breakfast Items');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-dark-900 text-white text-xs rounded-full font-medium hover:bg-gold-600 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-16 sm:mb-24">
            {displayedDishes.map((dish) => {
              // FEATURED DARK CARD (Fruit Parfait)
              if (dish.featured) {
                return (
                  <div
                    key={dish.id}
                    className="bg-[#141d2b] text-white rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden border border-slate-800 flex flex-col sm:flex-row gap-4 sm:gap-5 items-center group transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
                  >
                    {/* Diagonal Gold Ribbon Badge */}
                    <div className="absolute -right-8 top-5 rotate-45 bg-[#cba258] text-dark-900 text-[9px] font-extrabold uppercase tracking-widest px-8 py-0.5 shadow-md pointer-events-none z-10">
                      FEATURED
                    </div>

                    {/* Image */}
                    <div className="w-full sm:w-36 h-36 shrink-0 rounded-xl overflow-hidden relative shadow-inner">
                      <img
                        src={dish.image}
                        alt={dish.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between w-full">
                      <div>
                        <div className="flex items-baseline justify-between gap-2 mb-1.5 pr-8">
                          <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
                            {dish.title}
                          </h3>
                          <span className="font-serif text-lg sm:text-xl font-medium text-[#cba258]">
                            {dish.price}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-light leading-relaxed mb-4">
                          {dish.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                        <div className="flex flex-wrap gap-1.5">
                          {dish.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] font-semibold text-slate-300 bg-white/10 px-2 py-0.5 rounded uppercase tracking-wider"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => handleAddToCart(dish.title)}
                          className="bg-[#cba258] hover:bg-[#b8904a] text-dark-900 text-xs font-bold px-3.5 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-sm shrink-0"
                        >
                          <Plus size={13} />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              // STANDARD LIGHT CARDS
              return (
                <div
                  key={dish.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl border border-gray-100 flex flex-col sm:flex-row gap-4 sm:gap-5 items-center group transition-all duration-300 hover:-translate-y-0.5"
                >
                  {/* Image with badge */}
                  <div className="w-full sm:w-36 h-36 shrink-0 rounded-xl overflow-hidden relative shadow-inner">
                    <img
                      src={dish.image}
                      alt={dish.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {dish.badge && (
                      <span className="absolute top-2 left-2 bg-dark-900/85 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-xs">
                        {dish.badge}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between w-full h-full">
                    <div>
                      <div className="flex items-baseline justify-between gap-2 mb-1.5">
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-dark-900 tracking-tight">
                          {dish.title}
                        </h3>
                        <span className="font-serif text-lg sm:text-xl font-medium text-dark-900">
                          {dish.price}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-light leading-relaxed mb-4">
                        {dish.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-50">
                      <div className="flex flex-wrap gap-1.5">
                        {dish.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleAddToCart(dish.title)}
                        className="text-xs font-semibold text-dark-900 hover:text-gold-600 transition-colors cursor-pointer flex items-center gap-1 shrink-0 group-hover:translate-x-0.5"
                      >
                        <Plus size={13} className="text-gold-600" />
                        <span>Add to Tray</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===================== BOTTOM SECTION: CHEF'S TABLE PERSPECTIVES ===================== */}
        <div className="mt-8 pt-12 sm:pt-16 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <span className="text-[10px] sm:text-[11px] tracking-[0.25em] text-gray-400 uppercase font-semibold block mb-2">
                Chef's Table Perspectives
              </span>
              <h3 className="text-3xl sm:text-4xl font-serif text-dark-900 leading-tight">
                Morning Tastings & Shared Boards
              </h3>
            </div>
            <p className="text-gray-500 font-light text-xs sm:text-sm max-w-md leading-relaxed">
              Designed for leisurely morning gatherings on private suite balconies and terrace pavilions.
            </p>
          </div>

          {/* 3 Full-Bleed Showcase Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SHARED_BOARDS.map((board, idx) => (
              <div
                key={idx}
                className="group relative h-72 sm:h-80 rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
                onClick={() => handleAddToCart(board.title)}
              >
                {/* Background Image */}
                <img
                  src={board.image}
                  alt={board.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Gradient Overlays for High Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/30 to-transparent"></div>

                {/* Content Anchored to Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-gold-400 block mb-1.5">
                    {board.tag}
                  </span>
                  <h4 className="font-serif text-lg sm:text-xl font-bold leading-snug mb-1 text-white group-hover:text-gold-200 transition-colors">
                    {board.title}
                  </h4>
                  <p className="text-xs text-white/75 font-light leading-relaxed">
                    {board.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default DiningSection;
