import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Search,
  Bell,
  Home,
  LogOut,
  Flame,
  Check,
  ArrowRight,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Menu,
  X
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

const KitchenDashboard = ({ user, onLogout, onBackToSite }) => {
  const {
    orders,
    menuItems,
    updateOrderStatus,
    toggleDishStock,
  } = useHotel();

  const [activeTab, setActiveTab] = useState('Live KDS Board');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const pendingOrders = orders.filter((o) => o.status === 'Pending');
  const cookingOrders = orders.filter((o) => o.status === 'Cooking');
  const readyOrders = orders.filter((o) => o.status === 'Ready');
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered');

  const navMenuItems = [
    { name: 'Live KDS Board', icon: Layers },
    { name: 'Active Orders', icon: ShoppingBag },
    { name: 'Menu Stock Toggle', icon: Package },
    { name: 'Delivered History', icon: CheckCircle2 },
  ];

  const handleNextStatus = (order) => {
    let next = 'Cooking';
    if (order.status === 'Pending') next = 'Cooking';
    else if (order.status === 'Cooking') next = 'Ready';
    else if (order.status === 'Ready') next = 'Delivered';

    updateOrderStatus(order.id, next);
    showToast(`Order #${order.id} for Room ${order.roomNumber} moved to ${next.toUpperCase()}`);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[150] bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-amber-500/40 text-xs flex items-center gap-2 animate-slide-down">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MOBILE SIDEBAR DRAWER (<lg) */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex animate-fade-in"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-slate-900 shadow-2xl flex flex-col animate-slide-right border-r border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-xl px-2.5 py-1.5 shadow-md flex items-center justify-center shrink-0">
                  <img
                    src="/images/logo.png"
                    alt="Efoy Hotel"
                    className="h-10 sm:h-11 w-auto object-contain"
                  />
                </div>
                <div>
                  <h1 className="font-serif text-base font-bold tracking-wider text-white uppercase">
                    Efoy Kitchen
                  </h1>
                  <p className="text-[9px] tracking-[0.25em] text-amber-400 uppercase font-medium">
                    Live Kitchen KDS
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 pt-3 pb-1">
              <button
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  onBackToSite();
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-amber-400 bg-amber-400/10 hover:bg-amber-400/15 rounded-md transition-all border border-amber-400/20 cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Home size={14} />
                  <span>Public Website</span>
                </span>
                <span className="text-[10px] text-amber-300/80">Visit →</span>
              </button>
            </div>

            <div className="px-3 py-4 flex-1 space-y-1 overflow-y-auto">
              <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 tracking-[0.15em] uppercase">
                Kitchen Operations
              </div>
              {navMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#f97316] text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-semibold text-xs flex items-center justify-center">
                  MB
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Chef Marco Bellini</div>
                  <div className="text-[10px] text-slate-400">Executive Head Chef</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Log out"
                className="p-1.5 text-slate-400 hover:text-red-400 rounded transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:w-64 bg-slate-900 border-r border-slate-800 flex-col shrink-0">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl px-2.5 py-1.5 shadow-md flex items-center justify-center shrink-0">
              <img
                src="/images/logo.png"
                alt="Efoy Hotel"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="font-serif text-base font-bold tracking-wider text-white uppercase">
                Efoy Kitchen
              </h1>
              <p className="text-[9px] tracking-[0.25em] text-amber-400 uppercase font-medium">
                Live Kitchen KDS
              </p>
            </div>
          </div>
        </div>

        {/* Public Website Button */}
        <div className="px-4 pt-3 pb-1">
          <button
            onClick={onBackToSite}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-amber-400 bg-amber-400/10 hover:bg-amber-400/15 rounded-md transition-all border border-amber-400/20 cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <Home size={14} />
              <span>Public Website</span>
            </span>
            <span className="text-[10px] text-amber-300/80 group-hover:translate-x-0.5 transition-transform">
              Visit →
            </span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-4 flex-1 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 tracking-[0.15em] uppercase">
            Kitchen Operations
          </div>
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#f97316] text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Live Ticket Count Box */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-300">
              Active KDS Tickets
            </span>
            <span className="text-amber-400 font-bold text-xs">
              {pendingOrders.length + cookingOrders.length + readyOrders.length}
            </span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-slate-700/60">
            <div className="flex justify-between">
              <span>Pending:</span>
              <span className="font-bold text-red-400">{pendingOrders.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Cooking:</span>
              <span className="font-bold text-amber-400">{cookingOrders.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Ready for Runner:</span>
              <span className="font-bold text-emerald-400">{readyOrders.length}</span>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-semibold text-xs flex items-center justify-center">
              MB
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Chef Marco Bellini</div>
              <div className="text-[10px] text-slate-400">Executive Head Chef</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-red-400 rounded transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
            {/* Hamburger Toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Open navigation drawer"
            >
              <Menu size={20} />
            </button>

            <div className="relative w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, room numbers, dishes..."
                className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sound Alerts ON</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-600 font-mono bg-slate-100 px-2 sm:px-2.5 py-1 rounded-md">
              <CreditCard size={13} className="text-amber-600" />
              <span className="hidden xs:inline">Auto-Billing</span> Synced
            </div>
          </div>
        </header>

        {/* TAB 1: LIVE KDS BOARD (KANBAN) */}
        {activeTab === 'Live KDS Board' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Live Kitchen Display System (KDS)
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Room Service 24/7
                </span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Order Pipeline: Pending → Cooking → Ready → Delivered
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                All food orders automatically update the guest room folio at the front desk.
              </p>
            </div>

            {/* KANBAN BOARD */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
              {/* COLUMN 1: PENDING */}
              <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-red-700 uppercase">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <span>1. Pending Order</span>
                  </div>
                  <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {pendingOrders.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {pendingOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-base text-slate-900">
                          Room {ord.roomNumber}
                        </span>
                        <span className="font-mono text-xs text-slate-500">{ord.createdAt}</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 mb-2">
                        👤 {ord.guestName}
                      </div>

                      {/* Items */}
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1 mb-3 text-xs">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700">
                            <span className="font-medium">{item.qty}x {item.name}</span>
                            <span className="font-mono text-slate-500">${(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {ord.notes && (
                        <div className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded border border-amber-200/80 mb-3">
                          <span className="font-bold">Note: </span>{ord.notes}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          ${ord.total.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleNextStatus(ord)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Flame size={13} />
                          <span>Start Cooking</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {pendingOrders.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400 bg-white/60 rounded-lg border border-dashed border-slate-200">
                      No pending tickets
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 2: COOKING */}
              <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-700 uppercase">
                    <Flame size={14} className="text-amber-500" />
                    <span>2. In Preparation</span>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {cookingOrders.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {cookingOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white p-4 rounded-lg border border-amber-200/80 shadow-2xs hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-base text-slate-900">
                          Room {ord.roomNumber}
                        </span>
                        <span className="font-mono text-xs text-amber-700 font-semibold flex items-center gap-1">
                          <Clock size={11} /> {ord.createdAt}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 mb-2">
                        👤 {ord.guestName}
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1 mb-3 text-xs">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700">
                            <span className="font-medium">{item.qty}x {item.name}</span>
                            <span className="font-mono text-slate-500">${(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {ord.notes && (
                        <div className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded border border-amber-200/80 mb-3">
                          <span className="font-bold">Note: </span>{ord.notes}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          ${ord.total.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleNextStatus(ord)}
                          className="px-3 py-1.5 bg-[#c2410c] hover:bg-[#9a3412] text-white rounded text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 size={13} />
                          <span>Mark Ready</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {cookingOrders.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400 bg-white/60 rounded-lg border border-dashed border-slate-200">
                      No orders cooking
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 3: READY */}
              <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-blue-700 uppercase">
                    <CheckCircle2 size={14} className="text-blue-500" />
                    <span>3. Plated & Ready</span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {readyOrders.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {readyOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white p-4 rounded-lg border border-blue-200/80 shadow-2xs hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-base text-slate-900">
                          Room {ord.roomNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                          READY FOR RUNNER
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 mb-2">
                        👤 {ord.guestName}
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1 mb-3 text-xs">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700">
                            <span className="font-medium">{item.qty}x {item.name}</span>
                            <span className="font-mono text-slate-500">${(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          ${ord.total.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleNextStatus(ord)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={13} />
                          <span>Dispatch Delivered</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {readyOrders.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400 bg-white/60 rounded-lg border border-dashed border-slate-200">
                      No plated tickets waiting
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 4: DELIVERED */}
              <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 uppercase">
                    <Check size={14} className="text-emerald-600" />
                    <span>4. Delivered & Billed</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {deliveredOrders.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {deliveredOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white p-4 rounded-lg border border-emerald-200/80 shadow-2xs opacity-90"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900">
                          Room {ord.roomNumber}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          BILLED
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mb-2">👤 {ord.guestName}</div>

                      <div className="text-[11px] text-slate-500 mb-2">
                        {ord.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                      </div>

                      <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-900 pt-2 border-t border-slate-100">
                        <span>Total:</span>
                        <span>${ord.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}

                  {deliveredOrders.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400 bg-white/60 rounded-lg border border-dashed border-slate-200">
                      No completed orders yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE ORDERS LIST */}
        {activeTab === 'Active Orders' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Active Room Service Ticket List
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Detailed view of orders in progress linked to guest room numbers and billing folios.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Ticket ID</th>
                      <th className="py-3 px-4">Room & Guest</th>
                      <th className="py-3 px-4">Dishes & Quantities</th>
                      <th className="py-3 px-4">Notes / Dietary</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Stage</th>
                      <th className="py-3 px-4 text-right">Advance Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{ord.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">Room {ord.roomNumber}</div>
                          <div className="text-[11px] text-slate-500">{ord.guestName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-800">
                            {ord.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs">
                          {ord.notes || 'None'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          ${ord.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              ord.status === 'Pending'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : ord.status === 'Cooking'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : ord.status === 'Ready'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {ord.status !== 'Delivered' ? (
                            <button
                              onClick={() => handleNextStatus(ord)}
                              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer transition-colors"
                            >
                              Advance →
                            </button>
                          ) : (
                            <span className="text-emerald-600 text-xs font-semibold">✓ Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MENU STOCK TOGGLE */}
        {activeTab === 'Menu Stock Toggle' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Culinary Stock Management (86 Toggle)
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Toggle dish availability in real-time. Unavailable items immediately grey out on the Guest Room Service menu.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {menuItems.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                        {dish.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          dish.inStock
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {dish.inStock ? 'IN STOCK' : '86’D / OUT'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mb-1">{dish.name}</h3>
                    <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">{dish.description}</p>
                    <div className="flex justify-between text-xs font-mono mb-3">
                      <span className="text-slate-500">Prep: {dish.prepTime}</span>
                      <span className="font-bold text-slate-900">${dish.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      toggleDishStock(dish.id);
                      showToast(`${dish.name} marked ${!dish.inStock ? 'In Stock' : 'Unavailable'}`);
                    }}
                    className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      dish.inStock
                        ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                        : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {dish.inStock ? 'Mark Unavailable (86 Item)' : 'Restore to In Stock'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DELIVERED HISTORY */}
        {activeTab === 'Delivered History' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">
                Delivered Room Service Orders
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Completed room service orders settled into front desk guest folios.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Room</th>
                      <th className="py-3 px-4">Guest</th>
                      <th className="py-3 px-4">Delivered Items</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Folio Billing Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deliveredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{ord.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">Room {ord.roomNumber}</td>
                        <td className="py-3 px-4">{ord.guestName}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {ord.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          ${ord.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Check size={10} /> Auto-Charged to Room
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenDashboard;
