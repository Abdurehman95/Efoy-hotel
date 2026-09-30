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
  X,
  AlertTriangle,
  Plus,
  RefreshCw
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

const KitchenDashboard = ({ user, onLogout, onBackToSite }) => {
  const {
    orders,
    menuItems,
    inventoryItems,
    updateOrderStatus,
    toggleDishStock,
    updateInventoryItem,
    createInventoryItem,
  } = useHotel();

  const [activeTab, setActiveTab] = useState('Live KDS Board');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // New ingredient form modal state
  const [isNewIngredientModalOpen, setIsNewIngredientModalOpen] = useState(false);
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    category: 'Produce',
    quantity: 10,
    unit: 'kg',
    minStock: 5,
    linkedDishId: '',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const pendingOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'pending');
  const cookingOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'cooking');
  const readyOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'ready');
  const deliveredOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'delivered');

  // Low stock inventory alert
  const lowStockIngredients = (inventoryItems || []).filter(
    (item) => item.quantity <= item.minStock
  );

  const navMenuItems = [
    { name: 'Live KDS Board', icon: Layers, count: pendingOrders.length + cookingOrders.length + readyOrders.length },
    { name: 'Active Orders', icon: ShoppingBag, count: pendingOrders.length + cookingOrders.length },
    { name: 'Menu 86 System', icon: Package, count: menuItems.filter(m => !m.inStock).length },
    { name: 'Culinary Inventory', icon: AlertTriangle, count: lowStockIngredients.length },
    { name: 'Delivered History', icon: CheckCircle2 },
  ];

  const handleNextStatus = (order) => {
    const s = (order.status || '').toLowerCase();
    let next = 'Cooking';
    if (s === 'pending') next = 'Cooking';
    else if (s === 'cooking') next = 'Ready';
    else if (s === 'ready') next = 'Delivered';

    updateOrderStatus(order.id, next);
    if (next === 'Delivered') {
      showToast(`✓ Order #${order.id} DELIVERED! Charge automatically posted to Room ${order.roomNumber} folio.`);
    } else {
      showToast(`Order #${order.id} for Room ${order.roomNumber} moved to ${next.toUpperCase()}`);
    }
  };

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (!ingredientForm.name) {
      showToast('Please enter ingredient name.');
      return;
    }

    createInventoryItem({
      ...ingredientForm,
      quantity: parseFloat(ingredientForm.quantity) || 0,
      minStock: parseFloat(ingredientForm.minStock) || 0,
      linkedDishId: ingredientForm.linkedDishId ? parseInt(ingredientForm.linkedDishId) : null,
    });

    showToast(`✓ Ingredient ${ingredientForm.name} tracked in culinary inventory.`);
    setIsNewIngredientModalOpen(false);
    setIngredientForm({
      name: '',
      category: 'Produce',
      quantity: 10,
      unit: 'kg',
      minStock: 5,
      linkedDishId: '',
    });
  };

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[150] bg-dark-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-gold-500/40 text-xs flex items-center gap-2 animate-slide-down">
          <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* NEW INGREDIENT MODAL */}
      {isNewIngredientModalOpen && (
        <div className="fixed inset-0 z-[140] bg-dark-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full p-5 sm:p-6 text-dark-900 relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-serif font-bold text-base text-dark-900">
                Track Culinary Ingredient
              </h3>
              <button onClick={() => setIsNewIngredientModalOpen(false)} className="text-gray-400 hover:text-dark-900">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddIngredient} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wagyu Beef Tenderloin, Truffle Oil, Fresh Basil"
                  value={ingredientForm.name}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                    Current Qty
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={ingredientForm.quantity}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    placeholder="kg / bottles"
                    value={ingredientForm.unit}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                    Min Threshold
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={ingredientForm.minStock}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, minStock: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fafafa] border border-gray-200 rounded-lg text-dark-900 text-rose-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                  Linked Menu Item (Optional for auto-86 linkage)
                </label>
                <select
                  value={ingredientForm.linkedDishId}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, linkedDishId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-dark-900"
                >
                  <option value="">-- No linked menu dish --</option>
                  {menuItems.map((dish) => (
                    <option key={dish.id} value={dish.id}>
                      {dish.name} (${dish.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewIngredientModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-medium shadow-xs"
                >
                  Save Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE SIDEBAR DRAWER (<lg) */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-dark-900/70 backdrop-blur-xs flex animate-fade-in"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-dark-900 shadow-2xl flex flex-col animate-slide-right border-r border-dark-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-dark-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-xl px-2.5 py-1.5 shadow-md flex items-center justify-center shrink-0">
                  <img
                    src="/images/logo.png"
                    alt="Efoy Hotel"
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <div>
                  <h1 className="font-serif text-base font-bold tracking-wider text-white uppercase">
                    Efoy Kitchen
                  </h1>
                  <p className="text-[9px] tracking-[0.25em] text-gold-400 uppercase font-medium">
                    Live Kitchen KDS
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="px-3 py-4 flex-1 space-y-1 overflow-y-auto">
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-gold-500 text-white font-semibold shadow-xs'
                        : 'text-gray-300 hover:text-white hover:bg-dark-800/60'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={16} />
                      <span>{item.name}</span>
                    </span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-dark-800 text-gold-400 font-bold">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:w-64 bg-dark-900 border-r border-dark-800 flex-col shrink-0 text-white select-none">
        <div className="p-5 border-b border-dark-800 flex items-center gap-3">
          <div className="bg-white rounded-xl px-2.5 py-1.5 shadow-md flex items-center justify-center shrink-0">
            <img
              src="/images/logo.png"
              alt="Efoy Hotel"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="font-serif text-base font-bold tracking-wider text-white uppercase">
              Efoy Kitchen
            </h1>
            <p className="text-[9px] tracking-[0.25em] text-gold-400 uppercase font-medium">
              Live Kitchen KDS
            </p>
          </div>
        </div>

        <div className="px-4 pt-3 pb-1">
          <button
            onClick={onBackToSite}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gold-400 bg-gold-500/10 hover:bg-gold-500/15 rounded-md transition-all border border-gold-500/25 cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <Home size={14} />
              <span>Public Website</span>
            </span>
            <span className="text-[10px] text-gold-300/80 group-hover:translate-x-0.5 transition-transform">
              Visit →
            </span>
          </button>
        </div>

        <div className="px-3 py-4 flex-1 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
            Kitchen Operations
          </div>
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-gold-500 hover:bg-gold-600 text-white font-semibold shadow-xs'
                    : 'text-gray-300 hover:text-white hover:bg-dark-800/60 font-light'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400'} />
                  <span>{item.name}</span>
                </span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-gold-600 text-white' : 'bg-dark-800 text-gold-400'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Live Ticket Count Box */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-dark-800/70 border border-dark-700/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-300">
              Active KDS Tickets
            </span>
            <span className="text-gold-400 font-bold text-xs">
              {pendingOrders.length + cookingOrders.length + readyOrders.length}
            </span>
          </div>
          <div className="space-y-1 text-[11px] text-gray-400 pt-2 border-t border-dark-700/60 font-light">
            <div className="flex justify-between">
              <span>Pending:</span>
              <span className="font-bold text-red-400">{pendingOrders.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Cooking:</span>
              <span className="font-bold text-gold-400">{cookingOrders.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Ready for Runner:</span>
              <span className="font-bold text-emerald-400">{readyOrders.length}</span>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-dark-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-dark-800 text-gold-500 border border-gold-500/30 font-semibold text-xs flex items-center justify-center">
              MB
            </div>
            <div>
              <div className="text-xs font-semibold text-white">{user?.name || 'Chef Marco Bellini'}</div>
              <div className="text-[10px] text-gray-400 font-light">Executive Head Chef</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log out"
            className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-gray-600 hover:text-dark-900 hover:bg-gray-100 rounded-lg cursor-pointer shrink-0"
              aria-label="Open navigation drawer"
            >
              <Menu size={20} />
            </button>

            <div className="relative w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, room numbers, dishes..."
                className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 bg-[#fafafa] border border-gray-200 rounded-lg text-xs text-dark-900 placeholder-gray-400 focus:outline-none focus:border-gold-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {lowStockIngredients.length > 0 && (
              <button
                onClick={() => setActiveTab('Culinary Inventory')}
                className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full flex items-center gap-1.5 cursor-pointer animate-pulse"
              >
                <AlertTriangle size={13} />
                <span>{lowStockIngredients.length} Low Stock Alert</span>
              </button>
            )}

            <div className="flex items-center gap-1 text-xs text-dark-900 font-mono bg-dark-900/5 px-2.5 py-1 rounded-md">
              <CreditCard size={13} className="text-gold-600" />
              <span className="hidden xs:inline">Folio Sync:</span>
              <span className="text-emerald-700 font-bold">On Delivery</span>
            </div>
          </div>
        </header>

        {/* TAB 1: LIVE KDS BOARD (4-STAGE PIPELINE: PENDING -> COOKING -> READY -> DELIVERED) */}
        {activeTab === 'Live KDS Board' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-gold-600 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                  Kitchen Display System (KDS)
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Orders Stream
                </span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-dark-900">
                KDS Pipeline: Pending → Cooking → Ready → Delivered
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-light">
                When an order is moved to <strong>DELIVERED</strong>, its charge is automatically applied to the guest's folio.
              </p>
            </div>

            {/* KANBAN BOARD */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
              {/* COLUMN 1: PENDING */}
              <div className="bg-[#fafafa] rounded-xl p-3 border border-gray-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200">
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
                      className="bg-white p-4 rounded-lg border border-gray-100 shadow-xs hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-base text-dark-900">
                          Room {ord.roomNumber}
                        </span>
                        <span className="font-mono text-xs text-gray-400">{ord.createdAt || 'Just now'}</span>
                      </div>
                      <div className="text-xs font-semibold text-dark-900 mb-2">
                        👤 {ord.guestName}
                      </div>

                      <div className="bg-[#fafafa] p-2.5 rounded border border-gray-100 space-y-1 mb-3 text-xs font-light">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-gray-700">
                            <span className="font-medium text-dark-900">{item.qty}x {item.name}</span>
                            <span className="font-mono text-gray-400">${(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {ord.notes && (
                        <div className="text-[11px] text-gold-800 bg-gold-50/80 p-2 rounded border border-gold-200/80 mb-3">
                          <span className="font-bold">Note: </span>{ord.notes}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="font-mono font-bold text-dark-900 text-xs">
                          ${ord.total.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleNextStatus(ord)}
                          className="px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-white rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Flame size={13} />
                          <span>Start Cooking</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {pendingOrders.length === 0 && (
                    <div className="p-8 text-center text-xs text-gray-400 bg-white/60 rounded-lg border border-dashed border-gray-200 font-light">
                      No pending tickets
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 2: COOKING */}
              <div className="bg-[#fafafa] rounded-xl p-3 border border-gray-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gold-700 uppercase">
                    <Flame size={14} className="text-gold-500" />
                    <span>2. In Preparation</span>
                  </div>
                  <span className="bg-gold-50 text-gold-700 border border-gold-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {cookingOrders.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {cookingOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white p-4 rounded-lg border border-gold-200/80 shadow-xs hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-base text-dark-900">
                          Room {ord.roomNumber}
                        </span>
                        <span className="font-mono text-xs text-gold-600 font-semibold flex items-center gap-1">
                          <Clock size={11} /> {ord.createdAt || 'Cooking'}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-dark-900 mb-2">
                        👤 {ord.guestName}
                      </div>

                      <div className="bg-[#fafafa] p-2.5 rounded border border-gray-100 space-y-1 mb-3 text-xs font-light">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-gray-700">
                            <span className="font-medium text-dark-900">{item.qty}x {item.name}</span>
                            <span className="font-mono text-gray-400">${(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {ord.notes && (
                        <div className="text-[11px] text-gold-800 bg-gold-50/80 p-2 rounded border border-gold-200/80 mb-3">
                          <span className="font-bold">Note: </span>{ord.notes}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="font-mono font-bold text-dark-900 text-xs">
                          ${ord.total.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleNextStatus(ord)}
                          className="px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-white rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 size={13} />
                          <span>Mark Ready</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {cookingOrders.length === 0 && (
                    <div className="p-8 text-center text-xs text-gray-400 bg-white/60 rounded-lg border border-dashed border-gray-200 font-light">
                      No orders cooking
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 3: READY */}
              <div className="bg-[#fafafa] rounded-xl p-3 border border-gray-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200">
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
                      className="bg-white p-4 rounded-lg border border-blue-200/80 shadow-xs hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-base text-dark-900">
                          Room {ord.roomNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                          READY FOR RUNNER
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-dark-900 mb-2">
                        👤 {ord.guestName}
                      </div>

                      <div className="bg-[#fafafa] p-2.5 rounded border border-gray-100 space-y-1 mb-3 text-xs font-light">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-gray-700">
                            <span className="font-medium text-dark-900">{item.qty}x {item.name}</span>
                            <span className="font-mono text-gray-400">${(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="font-mono font-bold text-dark-900 text-xs">
                          ${ord.total.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleNextStatus(ord)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Check size={13} />
                          <span>Dispatch Delivered</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {readyOrders.length === 0 && (
                    <div className="p-8 text-center text-xs text-gray-400 bg-white/60 rounded-lg border border-dashed border-gray-200 font-light">
                      No plated tickets waiting
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 4: DELIVERED */}
              <div className="bg-[#fafafa] rounded-xl p-3 border border-gray-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200">
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
                      className="bg-white p-4 rounded-lg border border-emerald-200/80 shadow-xs opacity-95"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-dark-900">
                          Room {ord.roomNumber}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          CHARGED
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 mb-2 font-light">👤 {ord.guestName}</div>

                      <div className="text-[11px] text-gray-500 mb-2 font-light">
                        {ord.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                      </div>

                      <div className="flex justify-between items-center text-xs font-mono font-bold text-dark-900 pt-2 border-t border-gray-100">
                        <span>Folio Charged:</span>
                        <span className="text-emerald-700">${ord.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}

                  {deliveredOrders.length === 0 && (
                    <div className="p-8 text-center text-xs text-gray-400 bg-white/60 rounded-lg border border-dashed border-gray-200 font-light">
                      No delivered orders yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE ORDERS */}
        {activeTab === 'Active Orders' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-dark-900">
                Active Room Service Ticket List
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-light">
                Tickets in preparation with direct links to guest rooms and automated folio charging.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-[#fbfbfb] border-b border-gray-200 text-gray-500 uppercase text-[10px] font-semibold">
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
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-dark-900">{ord.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-dark-900">Room {ord.roomNumber}</div>
                          <div className="text-[11px] text-gray-400 font-light">{ord.guestName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-800 font-light">
                            {ord.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-gray-500 max-w-xs font-light">
                          {ord.notes || 'Standard presentation'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-dark-900">
                          ${ord.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              (ord.status || '').toLowerCase() === 'pending'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : (ord.status || '').toLowerCase() === 'cooking'
                                ? 'bg-gold-50 text-gold-700 border-gold-200'
                                : (ord.status || '').toLowerCase() === 'ready'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {(ord.status || '').toLowerCase() !== 'delivered' ? (
                            <button
                              onClick={() => handleNextStatus(ord)}
                              className="px-3 py-1 bg-gold-500 hover:bg-gold-600 text-white rounded text-xs font-medium cursor-pointer transition-colors shadow-xs"
                            >
                              Advance →
                            </button>
                          ) : (
                            <span className="text-emerald-600 text-xs font-semibold">✓ Charged to Folio</span>
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

        {/* TAB 3: MENU 86 SYSTEM */}
        {activeTab === 'Menu 86 System' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-dark-900">
                Out-of-Stock / 86 Menu Control
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-light">
                When an item is marked <strong>86 / OUT OF STOCK</strong>, it is immediately disabled on all guest dining screens.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {menuItems.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-dark-900 uppercase bg-dark-900/5 px-2 py-0.5 rounded">
                        {dish.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          dish.inStock !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {dish.inStock !== false ? 'IN STOCK' : '86’D / OUT'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-dark-900 mb-1">{dish.name}</h3>
                    <p className="text-[11px] text-gray-500 mb-3 leading-relaxed font-light">{dish.description}</p>
                    <div className="flex justify-between text-xs font-mono mb-3">
                      <span className="text-gray-400 font-light">Prep: {dish.prepTime}</span>
                      <span className="font-bold text-dark-900">${dish.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      toggleDishStock(dish.id);
                      showToast(`${dish.name} marked ${dish.inStock === false ? 'In Stock' : '86 / Out of Stock'}`);
                    }}
                    className={`w-full py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      dish.inStock !== false
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-xs'
                    }`}
                  >
                    {dish.inStock !== false ? 'Mark 86 (Out of Stock)' : 'Restore to Available'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CULINARY INVENTORY */}
        {activeTab === 'Culinary Inventory' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-dark-900">
                  Kitchen Inventory & Ingredient Stock
                </h1>
                <p className="text-xs text-gray-500 mt-1 font-light">
                  Track ingredient stocks with minimum threshold warnings. Automatically trigger 86 actions when supplies are exhausted.
                </p>
              </div>

              <button
                onClick={() => setIsNewIngredientModalOpen(true)}
                className="px-3.5 py-2 bg-gold-500 hover:bg-gold-600 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Track New Ingredient</span>
              </button>
            </div>

            {/* Low-stock warning banner */}
            {lowStockIngredients.length > 0 && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-3">
                <AlertTriangle size={20} className="shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm mb-1">
                    {lowStockIngredients.length} Ingredient(s) Below Minimum Reorder Threshold!
                  </h4>
                  <p className="leading-relaxed text-rose-700 font-light">
                    The following ingredients have reached zero or are below critical stock: {lowStockIngredients.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}. Please mark associated menu dishes as 86 or initiate a culinary reorder.
                  </p>
                </div>
              </div>
            )}

            {/* Inventory table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-[#fbfbfb] border-b border-gray-200 text-gray-500 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="py-3 px-4">Ingredient Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Current Stock</th>
                      <th className="py-3 px-4">Min. Threshold</th>
                      <th className="py-3 px-4">Stock Status</th>
                      <th className="py-3 px-4 text-right">Quick Stock Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(inventoryItems || []).map((item) => {
                      const isLow = item.quantity <= item.minStock;
                      const isZero = item.quantity <= 0;

                      return (
                        <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                          <td className="py-3 px-4 font-bold text-dark-900">{item.name}</td>
                          <td className="py-3 px-4 text-gray-500 font-light">{item.category || 'General'}</td>
                          <td className="py-3 px-4 font-mono font-bold text-dark-900">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-3 px-4 font-mono text-gray-500">
                            {item.minStock} {item.unit}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isZero
                                  ? 'bg-red-800 text-white'
                                  : isLow
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {isZero ? 'EXHAUSTED' : isLow ? 'LOW STOCK' : 'OPTIMAL'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  updateInventoryItem(item.id, { quantity: item.quantity + 5 });
                                  showToast(`Added 5 ${item.unit} to ${item.name}`);
                                }}
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[11px]"
                              >
                                +5 {item.unit}
                              </button>
                              <button
                                onClick={() => {
                                  const newQ = Math.max(0, item.quantity - 1);
                                  updateInventoryItem(item.id, { quantity: newQ });
                                  showToast(`Used 1 ${item.unit} of ${item.name}`);
                                }}
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[11px]"
                              >
                                -1 {item.unit}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DELIVERED HISTORY */}
        {activeTab === 'Delivered History' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-dark-900">
                Delivered Room Service Orders
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-light">
                All delivered dishes are posted to guest folios in real time.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-[#fbfbfb] border-b border-gray-200 text-gray-500 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Room</th>
                      <th className="py-3 px-4">Guest</th>
                      <th className="py-3 px-4">Delivered Items</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Folio Billing Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {deliveredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-dark-900">{ord.id}</td>
                        <td className="py-3 px-4 font-bold text-dark-900">Room {ord.roomNumber}</td>
                        <td className="py-3 px-4 font-light">{ord.guestName}</td>
                        <td className="py-3 px-4 text-gray-600 font-light">
                          {ord.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-dark-900">
                          ${ord.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
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
