import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  DoorClosed,
  UtensilsCrossed,
  Users,
  Clock,
  Settings,
  HelpCircle,
  Search,
  LogOut,
  Plus,
  Edit2,
  Home,
  Trash2,
  Menu,
  X,
  ShieldCheck,
  UserCheck,
  Key,
  Lock,
  Eye,
  EyeOff,
  User,
  ShieldAlert,
  Layers,
  Package,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { useHotel } from '../../context/HotelContext';
import ConfirmModal from '../shared/ConfirmModal';

Chart.register(...registerables);

const AdminDashboard = ({ user, onLogout, onBackToSite }) => {
  const {
    rooms,
    roomCategories,
    bookings,
    menuItems,
    orders,
    staffList,
    activityLogs,
    inventoryItems,
    addMenuItem,
    editMenuItem,
    deleteMenuItem,
    toggleDishStock,
    addStaff,
    editStaff,
    deleteStaff,
    updateRoom,
    addRoom,
    deleteRoom,
    addRoomCategory,
    editRoomCategory,
    deleteRoomCategory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    resetDemoData,
    usersList,
    addUser,
    editUser,
    deleteUser,
  } = useHotel();

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    if (deleteConfirmTarget.type === 'room') {
      deleteRoom(deleteConfirmTarget.id);
      showToast(`Room ${deleteConfirmTarget.id} removed from inventory`);
    } else if (deleteConfirmTarget.type === 'category') {
      deleteRoomCategory(deleteConfirmTarget.id);
      showToast(`Category removed from room master`);
    } else if (deleteConfirmTarget.type === 'inventory') {
      deleteInventoryItem(deleteConfirmTarget.id);
      showToast(`Inventory item removed`);
    } else if (deleteConfirmTarget.type === 'dish') {
      deleteMenuItem(deleteConfirmTarget.id);
      showToast(`"${deleteConfirmTarget.name || 'Dish'}" removed from menu`);
    } else if (deleteConfirmTarget.type === 'staff') {
      deleteStaff(deleteConfirmTarget.id);
      showToast('Staff member removed from directory');
    } else if (deleteConfirmTarget.type === 'user') {
      const res = await deleteUser(deleteConfirmTarget.id);
      if (res?.success) {
        showToast(`User account removed from database`);
      } else {
        showToast(res?.message || 'Failed to remove user account');
      }
    }
    setDeleteConfirmTarget(null);
  };
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');

  // Modals state
  const [modalType, setModalType] = useState(null); // 'addStaff', 'editStaff', 'addRoom', 'editRoom', 'addFood', 'editFood', 'reservation'
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);

  // Forms
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    department: 'Front Desk',
    role: 'Receptionist',
    shift: 'Morning (07:00 - 15:30)',
    status: 'Active Duty',
  });

  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    type: 'Single Classic',
    floor: 'Floor 1 (West Wing)',
    capacity: '1 Person',
    rate: 180,
    features: 'Single Bed • City View',
  });

  const [foodForm, setFoodForm] = useState({
    name: '',
    category: 'All-Day Dining',
    price: 25.0,
    prepTime: '15-20 mins',
    description: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    baseRate: 200,
    capacity: '2 Persons',
    features: 'King Bed • Balcony',
    description: '',
    imageUrl: '/images/room1.jpg',
  });

  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    category: 'Produce',
    quantity: 10,
    unit: 'kg',
    minStock: 5,
    linkedDishId: '',
  });

  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'guest',
    password: '',
  });
  const [showUserPassword, setShowUserPassword] = useState(false);

  // Chart Canvas Refs
  const revenueChartRef = useRef(null);
  const occupancyChartRef = useRef(null);
  const roomTypeChartRef = useRef(null);

  const chartInstances = useRef({});

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Filtered queries across tabs based on searchQuery
  const q = searchQuery.trim().toLowerCase();

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = bookingStatusFilter === 'All' || b.status === bookingStatusFilter;
    if (!matchesFilter) return false;
    if (!q) return true;
    return (
      b.id?.toLowerCase().includes(q) ||
      b.guestName?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.roomNumber?.toString().toLowerCase().includes(q) ||
      b.roomType?.toLowerCase().includes(q) ||
      b.status?.toLowerCase().includes(q)
    );
  });

  const filteredRooms = rooms.filter((r) => {
    if (!q) return true;
    return (
      r.roomNumber?.toString().toLowerCase().includes(q) ||
      r.type?.toLowerCase().includes(q) ||
      r.capacity?.toLowerCase().includes(q) ||
      r.cleanliness?.toLowerCase().includes(q) ||
      r.occupancy?.toLowerCase().includes(q) ||
      r.floor?.toLowerCase().includes(q) ||
      r.features?.toLowerCase().includes(q)
    );
  });

  const filteredMenuItems = menuItems.filter((dish) => {
    if (!q) return true;
    return (
      dish.name?.toLowerCase().includes(q) ||
      dish.category?.toLowerCase().includes(q) ||
      dish.description?.toLowerCase().includes(q) ||
      dish.prepTime?.toLowerCase().includes(q)
    );
  });

  const filteredStaff = staffList.filter((staff) => {
    if (!q) return true;
    return (
      staff.name?.toLowerCase().includes(q) ||
      staff.email?.toLowerCase().includes(q) ||
      staff.department?.toLowerCase().includes(q) ||
      staff.role?.toLowerCase().includes(q) ||
      staff.shift?.toLowerCase().includes(q) ||
      staff.status?.toLowerCase().includes(q)
    );
  });

  const filteredUsers = (usersList || []).filter((u) => {
    const matchesRole =
      userRoleFilter === 'All' || u.role?.toLowerCase() === userRoleFilter.toLowerCase();
    if (!matchesRole) return false;
    if (!q) return true;
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const filteredRoomCategories = (roomCategories || []).filter((cat) => {
    if (!q) return true;
    return (
      cat.name?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q) ||
      cat.capacity?.toLowerCase().includes(q) ||
      cat.features?.toLowerCase().includes(q)
    );
  });

  const filteredInventoryItems = (inventoryItems || []).filter((item) => {
    if (!q) return true;
    return (
      item.name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q) ||
      item.unit?.toLowerCase().includes(q)
    );
  });

  const filteredActivityLogs = activityLogs.filter((log) => {
    if (!q) return true;
    return (
      log.title?.toLowerCase().includes(q) ||
      log.description?.toLowerCase().includes(q) ||
      log.tag?.toLowerCase().includes(q) ||
      log.category?.toLowerCase().includes(q)
    );
  });

  // Nav Menu items
  const navMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Bookings', icon: Calendar },
    { name: 'Room Management', icon: DoorClosed },
    { name: 'Room Categories', icon: Layers },
    { name: 'Menu Management', icon: UtensilsCrossed },
    { name: 'Culinary Inventory', icon: Package },
    { name: 'Staff Management', icon: Users },
    { name: 'User Accounts', icon: ShieldCheck },
    { name: 'Activity Logs', icon: Clock },
    { name: 'Settings', icon: Settings },
  ];

  // Initialize or re-render Chart.js when on Analytics or Dashboard tab
  useEffect(() => {
    if (activeTab !== 'Analytics' && activeTab !== 'Dashboard') return;

    const instances = chartInstances.current;

    // Destroy previous charts safely
    if (instances.revenue) {
      instances.revenue.destroy();
      instances.revenue = null;
    }
    if (instances.occupancy) {
      instances.occupancy.destroy();
      instances.occupancy = null;
    }
    if (instances.roomType) {
      instances.roomType.destroy();
      instances.roomType = null;
    }

    // Dynamic counts for room types
    const singleCount = rooms.filter((r) => r.type?.toLowerCase().includes('single')).length || 1;
    const doubleCount = rooms.filter((r) => r.type?.toLowerCase().includes('double')).length || 1;
    const suiteCount = rooms.filter((r) => r.type?.toLowerCase().includes('suite')).length || 1;
    const penthouseCount = rooms.filter((r) => r.type?.toLowerCase().includes('penthouse')).length || 1;

    // 1. Revenue Chart
    if (revenueChartRef.current) {
      Chart.getChart(revenueChartRef.current)?.destroy();
      const ctx = revenueChartRef.current.getContext('2d');
      instances.revenue = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Room Tariffs ($)',
              data: [32400, 38500, 44200, 48920, 56200, 64000, 58900],
              borderColor: '#cba258',
              backgroundColor: 'rgba(203, 162, 88, 0.12)',
              tension: 0.35,
              fill: true,
              borderWidth: 2.5,
              pointRadius: 4,
              pointBackgroundColor: '#b8904a',
            },
            {
              label: 'In-Room Dining ($)',
              data: [8200, 9400, 11200, 12800, 15400, 17900, 14800],
              borderColor: '#0a0a0a',
              backgroundColor: 'rgba(10, 10, 10, 0.05)',
              tension: 0.35,
              fill: true,
              borderWidth: 2,
              pointRadius: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { font: { size: 11, family: 'sans-serif' } } },
            tooltip: { padding: 10 },
          },
          scales: {
            y: {
              grid: { color: '#f1f5f9' },
              ticks: { font: { size: 10 }, callback: (v) => `${v / 1000}k ETB` },
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 } },
            },
          },
        },
      });
    }

    // 2. Occupancy Rate Chart
    if (occupancyChartRef.current) {
      Chart.getChart(occupancyChartRef.current)?.destroy();
      const ctx = occupancyChartRef.current.getContext('2d');
      instances.occupancy = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Occupancy %',
              data: [72, 78, 83.5, 88, 94, 96, 85],
              backgroundColor: '#0a0a0a',
              hoverBackgroundColor: '#cba258',
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              max: 100,
              grid: { color: '#f1f5f9' },
              ticks: { font: { size: 10 }, callback: (v) => `${v}%` },
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 } },
            },
          },
        },
      });
    }

    // 3. Room Type Trends (Doughnut)
    if (roomTypeChartRef.current) {
      Chart.getChart(roomTypeChartRef.current)?.destroy();
      const ctx = roomTypeChartRef.current.getContext('2d');
      instances.roomType = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Single Rooms', 'Double Deluxe', 'Executive Suites', 'Penthouse'],
          datasets: [
            {
              data: [singleCount, doubleCount, suiteCount, penthouseCount],
              backgroundColor: ['#cba258', '#b8904a', '#d4af37', '#0a0a0a'],
              borderWidth: 2,
              borderColor: '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
          },
        },
      });
    }

    return () => {
      if (instances.revenue) {
        instances.revenue.destroy();
        instances.revenue = null;
      }
      if (instances.occupancy) {
        instances.occupancy.destroy();
        instances.occupancy = null;
      }
      if (instances.roomType) {
        instances.roomType.destroy();
        instances.roomType = null;
      }
    };
  }, [activeTab, rooms]);

  // Handle Staff Form
  const handleSaveStaff = (e) => {
    e.preventDefault();
    if (modalType === 'editStaff' && selectedItemForEdit) {
      editStaff({ ...selectedItemForEdit, ...staffForm });
      showToast(`Updated staff profile for ${staffForm.name}`);
    } else {
      addStaff(staffForm);
      showToast(`Added ${staffForm.name} to hotel directory`);
    }
    setModalType(null);
    setSelectedItemForEdit(null);
  };

  // Handle Room Form
  const handleSaveRoom = (e) => {
    e.preventDefault();
    const rateNum = parseFloat(roomForm.rate) || 0;
    if (modalType === 'editRoom' && selectedItemForEdit) {
      updateRoom({
        ...selectedItemForEdit,
        ...roomForm,
        rate: rateNum,
      });
      showToast(`Updated Room ${roomForm.roomNumber} parameters`);
    } else {
      if (rooms.some((r) => r.roomNumber.toString() === roomForm.roomNumber.toString())) {
        showToast(`Room ${roomForm.roomNumber} already exists in inventory!`);
        return;
      }
      addRoom({
        ...roomForm,
        rate: rateNum,
      });
      showToast(`Room ${roomForm.roomNumber} added to inventory`);
    }
    setModalType(null);
    setSelectedItemForEdit(null);
  };

  // Handle Food Form
  const handleSaveFood = (e) => {
    e.preventDefault();
    const priceNum = parseFloat(foodForm.price) || 0;
    if (modalType === 'editFood' && selectedItemForEdit) {
      editMenuItem({
        ...selectedItemForEdit,
        ...foodForm,
        price: priceNum,
      });
      showToast(`Updated dish ${foodForm.name}`);
    } else {
      addMenuItem({
        ...foodForm,
        price: priceNum,
        image: selectedItemForEdit?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
      });
      showToast(`Added ${foodForm.name} to in-room dining catalog`);
    }
    setModalType(null);
    setSelectedItemForEdit(null);
  };

  // Handle User Account Form
  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (modalType === 'addUser') {
      if (!userForm.name?.trim() || !userForm.email?.trim() || !userForm.password?.trim()) {
        showToast('⚠️ Full name, email, and password are required.');
        return;
      }
      const res = await addUser({
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        phone: userForm.phone?.trim() || null,
        role: userForm.role || 'guest',
        password: userForm.password.trim(),
      });
      if (res?.success) {
        showToast(`🎉 User account for ${userForm.name} created successfully!`);
        setModalType(null);
        setSelectedItemForEdit(null);
      } else {
        showToast(res?.message || 'Failed to create user account');
      }
    } else if (modalType === 'editUser' && selectedItemForEdit) {
      const payload = {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        phone: userForm.phone?.trim() || null,
        role: userForm.role || 'guest',
      };
      if (userForm.password?.trim()) {
        payload.password = userForm.password.trim();
      }
      const res = await editUser(selectedItemForEdit.id, payload);
      if (res?.success) {
        showToast(`✅ User account ${userForm.name} updated!`);
        setModalType(null);
        setSelectedItemForEdit(null);
      } else {
        showToast(res?.message || 'Failed to update user account');
      }
    }
  };

  // Handle Room Category Form
  const handleSaveCategory = (e) => {
    e.preventDefault();
    const rateNum = parseFloat(categoryForm.baseRate) || 0;
    if (modalType === 'editCategory' && selectedItemForEdit) {
      editRoomCategory(selectedItemForEdit.id, {
        ...selectedItemForEdit,
        ...categoryForm,
        baseRate: rateNum,
      });
      showToast(`Updated suite category: ${categoryForm.name}`);
    } else {
      addRoomCategory({
        ...categoryForm,
        baseRate: rateNum,
      });
      showToast(`Added suite category: ${categoryForm.name}`);
    }
    setModalType(null);
    setSelectedItemForEdit(null);
  };

  // Handle Culinary Inventory Form
  const handleSaveInventory = (e) => {
    e.preventDefault();
    const qtyNum = parseFloat(inventoryForm.quantity) || 0;
    const minNum = parseFloat(inventoryForm.minStock) || 5;
    if (modalType === 'editInventory' && selectedItemForEdit) {
      updateInventoryItem(selectedItemForEdit.id, {
        ...selectedItemForEdit,
        ...inventoryForm,
        quantity: qtyNum,
        minStock: minNum,
      });
      showToast(`Updated inventory item: ${inventoryForm.name}`);
    } else {
      createInventoryItem({
        ...inventoryForm,
        quantity: qtyNum,
        minStock: minNum,
      });
      showToast(`Added ${inventoryForm.name} to culinary inventory`);
    }
    setModalType(null);
    setSelectedItemForEdit(null);
  };

  // Occupancy calc
  const occupiedCount = rooms.filter((r) => r.occupancy === 'Occupied').length;
  const occupancyPercentage = rooms.length > 0 ? Math.round((occupiedCount / rooms.length) * 100) : 0;

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[150] bg-dark-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-gold-500/40 text-xs flex items-center gap-2 animate-slide-down">
          <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MOBILE SIDEBAR DRAWER (<lg) */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-dark-900/75 backdrop-blur-xs flex animate-fade-in"
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
                    className="h-10 sm:h-11 w-auto object-contain"
                  />
                </div>
                <div>
                  <h1 className="font-serif text-base font-bold tracking-wider text-white uppercase">
                    Efoy Hotel
                  </h1>
                  <p className="text-[9px] tracking-[0.25em] text-gold-500 uppercase font-medium">
                    Admin Portal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-dark-800 transition-colors cursor-pointer"
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
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gold-400 bg-gold-500/10 hover:bg-gold-500/15 rounded-md transition-all border border-gold-500/25 cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Home size={14} />
                  <span>Public Website</span>
                </span>
                <span className="text-[10px] text-gold-300/80">Visit →</span>
              </button>
            </div>

            <div className="px-3 py-4 flex-1 space-y-1 overflow-y-auto">
              <div className="px-3 pb-2 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
                Operations & Admin
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
                        ? 'bg-gold-500 hover:bg-gold-600 text-white font-semibold shadow-sm'
                        : 'text-gray-300 hover:text-white hover:bg-dark-800/80'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400'} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-dark-800 flex items-center justify-between text-xs">
              <div className="text-white font-semibold text-xs truncate max-w-[140px]">
                {user?.name || 'Alexander Sterling'}
              </div>
              <button
                onClick={onLogout}
                className="text-red-400 hover:text-red-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR (lg:flex) */}
      <aside className="hidden lg:flex lg:w-64 bg-dark-900 border-r border-dark-800 flex-col shrink-0">
        <div className="p-5 border-b border-dark-800">
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
                Efoy Hotel
              </h1>
              <p className="text-[9px] tracking-[0.25em] text-gold-500 uppercase font-medium">
                Admin Portal
              </p>
            </div>
          </div>
        </div>

        {/* Public Website Button */}
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

        {/* Navigation items */}
        <div className="px-3 py-4 flex-1 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-gray-400 tracking-[0.15em] uppercase">
            Operations & Admin
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
                    ? 'bg-gold-500 hover:bg-gold-600 text-white font-semibold shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-dark-800/80'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400'} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Live Occupancy Widget */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-dark-800/80 border border-dark-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-300">
              Live Occupancy
            </span>
            <span className="text-gold-400 font-bold text-xs">{occupancyPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-gold-500 to-amber-500 rounded-full"
              style={{ width: `${occupancyPercentage}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>{occupiedCount}/{rooms.length} Filled</span>
            <span className="text-emerald-400 font-medium">{rooms.length - occupiedCount} Free</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-dark-800 flex items-center justify-between text-[11px] text-gray-400">
          <button
            onClick={() => showToast('Help Center Documentation v2.4.0')}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <HelpCircle size={13} />
            <span>Help Center</span>
          </button>
          <span className="font-mono text-[10px] text-gray-500">v2.4.0</span>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOP NAVIGATION BAR */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
            {/* Hamburger Toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-gray-600 hover:text-dark-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
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
                placeholder="Search portal (guests, rooms, menu, staff)..."
                className="w-full pl-8 sm:pl-9 pr-8 py-1.5 bg-[#fafafa] border border-gray-200 rounded-lg text-xs text-dark-900 placeholder-gray-400 focus:outline-none focus:border-gold-500 focus:bg-white focus:ring-2 focus:ring-gold-500/15 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Clock size={14} className="text-gold-600" />
              <span>Wednesday, Oct 24 • 10:45AM</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-dark-900 text-gold-500 font-serif font-semibold text-xs flex items-center justify-center border border-gold-500/30 shrink-0">
                AS
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-semibold text-dark-900 truncate max-w-[120px]">
                  {user?.name || 'Alexander Sterling'}
                </div>
                <div className="text-[10px] text-gray-500">General Manager</div>
              </div>

              <button
                onClick={onLogout}
                title="Log Out"
                className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'Dashboard' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-gold-600 bg-amber-50 border border-gold-200/60 px-2 py-0.5 rounded">
                    Property Operations
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    System Optimal
                  </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-dark-900">
                  Property Overview & Operations
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Real-time hotel performance, key inventory occupancy, and departmental status.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setStaffForm({
                      name: '',
                      email: '',
                      department: 'Front Desk',
                      role: 'Receptionist',
                      shift: 'Morning (07:00 - 15:30)',
                      status: 'Active Duty',
                    });
                    setModalType('addStaff');
                  }}
                  className="bg-dark-900 hover:bg-dark-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus size={14} />
                  <span>+ Staff</span>
                </button>
                <button
                  onClick={() => {
                    setRoomForm({
                      roomNumber: '601',
                      type: 'Luxury Suite',
                      floor: 'Floor 6 (Penthouse)',
                      capacity: '4 Persons',
                      rate: 650,
                      features: '2 King Beds • Sky Terrace',
                    });
                    setModalType('addRoom');
                  }}
                  className="bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                  <span>+ Room</span>
                </button>
                <button
                  onClick={() => setActiveTab('Analytics')}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <BarChart3 size={14} />
                  <span>View Chart.js Analytics</span>
                </button>
              </div>
            </div>

            {/* Stat Cards - Connected Operations Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Total Revenue
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    +14.2%
                  </span>
                </div>
                <div className="font-serif text-3xl font-bold text-dark-900 mb-1">
                  489,200 ETB
                </div>
                <div className="text-[11px] text-gray-500">
                  Tariffs: 385k ETB • Culinary: {orders.length} orders ({orders.filter((o) => (o.status || '').toLowerCase() === 'pending' || (o.status || '').toLowerCase() === 'cooking').length} active)
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Live Occupancy
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Optimal
                  </span>
                </div>
                <div className="font-serif text-3xl font-bold text-dark-900 mb-1">
                  {occupancyPercentage}%
                </div>
                <div className="text-[11px] text-gray-500">
                  {occupiedCount} Occupied • {rooms.length - occupiedCount} Vacant Suites
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Room States (3-Way)
                  </span>
                  <button onClick={() => setActiveTab('Room Management')} className="text-[10px] text-gold-600 hover:underline font-semibold">
                    Manage →
                  </button>
                </div>
                <div className="font-serif text-2xl font-bold text-dark-900 mb-1 flex items-baseline gap-2">
                  <span className="text-emerald-600">{rooms.filter(r => (r.housekeepingStatus || r.cleanliness?.toUpperCase()) === 'CLEAN').length} Clean</span>
                  <span className="text-xs text-gray-400 font-sans">•</span>
                  <span className="text-rose-600">{rooms.filter(r => (r.housekeepingStatus || r.cleanliness?.toUpperCase()) === 'DIRTY').length} Dirty</span>
                </div>
                <div className="text-[11px] text-gray-500">
                  {rooms.filter(r => (r.maintenanceStatus || '').toUpperCase() === 'OUT_OF_SERVICE').length} Out of Service / Maintenance
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Culinary Inventory
                  </span>
                  <button onClick={() => setActiveTab('Culinary Inventory')} className="text-[10px] text-gold-600 hover:underline font-semibold">
                    Catalog →
                  </button>
                </div>
                <div className="font-serif text-2xl font-bold text-dark-900 mb-1">
                  {(inventoryItems || []).length} Items
                </div>
                <div className="text-[11px] text-gray-500">
                  {(inventoryItems || []).filter(i => i.quantity <= i.minStock).length > 0 ? (
                    <span className="text-rose-600 font-semibold">⚠️ {(inventoryItems || []).filter(i => i.quantity <= i.minStock).length} Low Stock Alert</span>
                  ) : (
                    <span className="text-emerald-600 font-medium">✓ All ingredients optimal</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Chart.js preview in Dashboard */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-serif text-lg font-bold text-dark-900">
                    Revenue & Financial Trajectory (Chart.js)
                  </h2>
                  <p className="text-xs text-gray-500">
                    Weekly performance comparing room charges vs in-room dining volume
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('Analytics')}
                  className="text-xs font-semibold text-gold-600 hover:text-gold-700 hover:underline cursor-pointer"
                >
                  Full Analytics →
                </button>
              </div>
              <div className="h-64 w-full">
                <canvas ref={revenueChartRef}></canvas>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANALYTICS (CHART.JS: REVENUE, OCCUPANCY, ROOM TYPE TRENDS) */}
        {activeTab === 'Analytics' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-gold-600 bg-amber-50 border border-gold-200/60 px-2 py-0.5 rounded">
                  Executive Intelligence
                </span>
                <span className="text-[10px] font-bold text-gold-700 bg-amber-50 border border-gold-200/60 px-2 py-0.5 rounded-full">
                  Chart.js Powered
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-dark-900">
                Analytics & Performance Trends
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Revenue streams, daily occupancy rates, and room type revenue popularity trends.
              </p>
            </div>

            {/* Top Chart: Revenue Stream */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2 mb-4">
                <div>
                  <h2 className="font-serif text-lg font-bold text-slate-900">
                    Revenue Performance Curve
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time room tariff vs food & beverage receipts across the past 7 days
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Gross: 3,428,000 ETB MTD
                  </span>
                </div>
              </div>
              <div className="h-72 w-full">
                <canvas ref={revenueChartRef}></canvas>
              </div>
            </div>

            {/* Bottom Row: Occupancy Bar + Room Type Doughnut */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Occupancy Bar */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs">
                <h2 className="font-serif text-base font-bold text-slate-900 mb-1">
                  Daily Occupancy Rate (%)
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  Capacity utilization across the property keys
                </p>
                <div className="h-60 w-full">
                  <canvas ref={occupancyChartRef}></canvas>
                </div>
              </div>

              {/* Room Type Trends */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs">
                <h2 className="font-serif text-base font-bold text-slate-900 mb-1">
                  Room Type Revenue Share
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  Single, Double Deluxe, Executive Suite, and Penthouse proportions
                </p>
                <div className="h-60 w-full">
                  <canvas ref={roomTypeChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BOOKINGS */}
        {activeTab === 'Bookings' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-slate-900">
                  Reservations & Master Folios
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  All guest reservations, stay durations, and room assignments.
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {['All', 'In-House', 'Arriving Today', 'Departing Today', 'Checked Out'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setBookingStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      bookingStatusFilter === status
                        ? 'bg-dark-900 text-white font-medium shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 font-light'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fbfbfb] border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Room & Type</th>
                    <th className="py-3 px-4">Stay Dates</th>
                    <th className="py-3 px-4">Tariff / Night</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 text-xs">
                        No reservations found matching your criteria.
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="ml-2 text-gold-600 underline font-medium cursor-pointer"
                          >
                            Clear search
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-amber-50/20">
                        <td className="py-3 px-4 font-mono font-bold text-dark-900">{b.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-dark-900">{b.guestName}</div>
                          <div className="text-[11px] text-gray-500">{b.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-dark-900">Room {b.roomNumber}</div>
                          <div className="text-[11px] text-gray-500">{b.roomType}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {b.checkIn} → {b.checkOut} ({b.nights}n)
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-dark-900">
                          ${b.roomRate}/nt
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              b.status === 'In-House'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : b.status === 'Arriving Today'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : b.status === 'Departing Today'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ROOM MANAGEMENT (PRICING, CAPACITY, ROOM TYPE) */}
        {activeTab === 'Room Management' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-dark-900">
                  Room Inventory & Pricing Configuration
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Manage nightly tariffs, capacities, and room types (Single/Double/Suite).
                </p>
              </div>
              <button
                onClick={() => {
                  setRoomForm({
                    roomNumber: `${Math.floor(100 + Math.random() * 899)}`,
                    type: 'Luxury Suite',
                    floor: 'Floor 4 (North Panorama)',
                    capacity: '4 Persons',
                    rate: 450,
                    features: 'King Bed • Terrace View',
                  });
                  setModalType('addRoom');
                }}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>Add Room Unit</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fbfbfb] border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Room #</th>
                    <th className="py-3 px-4">Category & Floor</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Nightly Rate</th>
                    <th className="py-3 px-4">Occupancy Status</th>
                    <th className="py-3 px-4">Housekeeping Status</th>
                    <th className="py-3 px-4">Maintenance Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRooms.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500 text-xs">
                        No rooms match your search query.
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="ml-2 text-gold-600 underline font-medium cursor-pointer"
                          >
                            Clear search
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredRooms.map((r) => (
                      <tr key={r.roomNumber} className="hover:bg-amber-50/20">
                        <td className="py-3 px-4 font-serif font-bold text-dark-900">
                          Room {r.roomNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-800">{r.type}</div>
                          <div className="text-[10px] text-gray-400">{r.floor}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{r.capacity}</td>
                        <td className="py-3 px-4 font-mono font-bold text-gold-600">
                          ${r.rate} / night
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              (r.occupancyStatus || r.occupancy?.toUpperCase()) === 'OCCUPIED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {r.occupancyStatus || r.occupancy?.toUpperCase() || 'VACANT'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              (r.housekeepingStatus || r.cleanliness?.toUpperCase()) === 'CLEAN' || (r.housekeepingStatus || r.cleanliness?.toUpperCase()) === 'INSPECTED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : (r.housekeepingStatus || r.cleanliness?.toUpperCase()) === 'DIRTY'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {r.housekeepingStatus || r.cleanliness?.toUpperCase() || 'CLEAN'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              (r.maintenanceStatus || 'AVAILABLE').toUpperCase() === 'AVAILABLE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-800 text-white'
                            }`}
                          >
                            {r.maintenanceStatus || 'AVAILABLE'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedItemForEdit(r);
                                setRoomForm({
                                  roomNumber: r.roomNumber,
                                  type: r.type,
                                  floor: r.floor || 'Floor 1 (West Wing)',
                                  capacity: r.capacity || '2 Persons',
                                  rate: r.rate || 180,
                                  features: r.features || 'Single Bed • City View',
                                });
                                setModalType('editRoom');
                              }}
                              className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-dark-900 rounded cursor-pointer transition-colors"
                              title="Edit Pricing & Capacity"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirmTarget({
                                  type: 'room',
                                  id: r.roomNumber,
                                  name: `Room ${r.roomNumber}`,
                                  title: 'Delete Room',
                                  message: `Are you sure you want to delete Room ${r.roomNumber} (${r.type})? This will permanently remove the suite from active inventory.`,
                                });
                              }}
                              className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                              title="Delete Room"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: ROOM CATEGORIES */}
        {activeTab === 'Room Categories' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-dark-900">
                  Room Categories & Suite Tiers
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Configure luxury tier classifications, standard base tariffs, guest capacity, and signature amenities.
                </p>
              </div>
              <button
                onClick={() => {
                  setCategoryForm({
                    name: '',
                    baseRate: 250,
                    capacity: '2 Persons',
                    features: 'King Bed • Marble Bath • City View',
                    description: '',
                    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80',
                  });
                  setModalType('addCategory');
                }}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>+ Add Room Category</span>
              </button>
            </div>

            {filteredRoomCategories.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500 text-xs shadow-xs">
                No room categories match your search criteria.
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-gold-600 underline font-medium cursor-pointer"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRoomCategories.map((cat) => {
                  const assignedRoomsCount = rooms.filter(
                    (r) => r.type?.toLowerCase() === cat.name?.toLowerCase()
                  ).length;
                  return (
                    <div
                      key={cat.id}
                      className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative h-40 bg-dark-900 overflow-hidden">
                        <img
                          src={cat.imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80'}
                          alt={cat.name}
                          className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-dark-900/80 backdrop-blur-xs text-gold-400 font-serif font-bold text-xs px-2.5 py-1 rounded-full border border-gold-500/30">
                          ${cat.baseRate} / night
                        </div>
                        <div className="absolute bottom-2 left-3 bg-dark-900/75 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-medium">
                          {assignedRoomsCount} {assignedRoomsCount === 1 ? 'Suite Assigned' : 'Suites Assigned'}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3 className="font-serif font-bold text-base text-dark-900">{cat.name}</h3>
                            <span className="text-[10px] bg-gold-50 text-gold-800 border border-gold-200/60 px-2 py-0.5 rounded font-medium shrink-0">
                              {cat.capacity || '2 Persons'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                            {cat.description || 'Forbes five-star certified luxury suite accommodations.'}
                          </p>
                          <div className="text-[11px] text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100 mb-4">
                            <span className="font-semibold text-dark-900">Amenities: </span>
                            {cat.features || 'Standard Forbes 5-Star Amenities'}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-[10px] text-gray-400 font-mono">ID: #{cat.id}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedItemForEdit(cat);
                                setCategoryForm({
                                  name: cat.name || '',
                                  baseRate: cat.baseRate || 250,
                                  capacity: cat.capacity || '2 Persons',
                                  features: cat.features || '',
                                  description: cat.description || '',
                                  imageUrl: cat.imageUrl || '',
                                });
                                setModalType('editCategory');
                              }}
                              className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-dark-900 rounded cursor-pointer transition-colors"
                              title="Edit Category"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirmTarget({
                                  type: 'category',
                                  id: cat.id,
                                  name: cat.name,
                                  title: 'Delete Room Category',
                                  message: `Are you sure you want to delete the "${cat.name}" category? Existing rooms will retain their configuration.`,
                                });
                              }}
                              className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MENU MANAGEMENT */}
        {activeTab === 'Menu Management' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-dark-900">
                  Culinary Room Service Catalog
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Add, modify, or remove in-room dining dishes, pricing, and stock status.
                </p>
              </div>
              <button
                onClick={() => {
                  setFoodForm({
                    name: '',
                    category: 'All-Day Dining',
                    price: 28.0,
                    prepTime: '20 mins',
                    description: '',
                  });
                  setModalType('addFood');
                }}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>+ Add Culinary Item</span>
              </button>
            </div>

            {filteredMenuItems.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500 text-xs col-span-full shadow-xs">
                No culinary dishes match your search query.
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-gold-600 underline font-medium cursor-pointer"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMenuItems.map((dish) => (
                  <div
                    key={dish.id}
                    className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase text-gold-700 bg-amber-50 px-2 py-0.5 rounded border border-gold-200/60">
                          {dish.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            dish.inStock
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {dish.inStock ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-base text-dark-900 mb-1">{dish.name}</h3>
                      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{dish.description}</p>
                      <div className="flex justify-between text-xs font-mono font-bold mb-4">
                        <span className="text-gray-500 font-normal">⏱ {dish.prepTime || '15 mins'}</span>
                        <span className="text-gold-700 text-sm">{Number(dish.price || 0).toLocaleString()} ETB</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => toggleDishStock(dish.id)}
                        className="text-xs font-semibold text-gray-600 hover:text-dark-900 underline cursor-pointer"
                      >
                        {dish.inStock ? 'Mark Out of Stock' : 'Mark Available'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedItemForEdit(dish);
                            setFoodForm({
                              name: dish.name,
                              category: dish.category,
                              price: dish.price,
                              prepTime: dish.prepTime || '15-20 mins',
                              description: dish.description || '',
                            });
                            setModalType('editFood');
                          }}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded cursor-pointer transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirmTarget({
                              type: 'dish',
                              id: dish.id,
                              name: dish.name,
                              title: 'Delete Menu Item',
                              message: `Are you sure you want to delete "${dish.name}" from the in-room dining catalog?`,
                            });
                          }}
                          className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                          title="Delete Dish"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: CULINARY INVENTORY */}
        {activeTab === 'Culinary Inventory' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-dark-900">
                  Culinary Pantry & Stock Inventory
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Track kitchen stock levels, threshold alerts, and synchronize 86 out-of-stock items across dining.
                </p>
              </div>
              <button
                onClick={() => {
                  setInventoryForm({
                    name: '',
                    category: 'Produce',
                    quantity: 10,
                    unit: 'kg',
                    minStock: 5,
                    linkedDishId: '',
                  });
                  setModalType('addInventory');
                }}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>+ Add Stock Item</span>
              </button>
            </div>

            {/* Inventory KPI Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
                <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Total Stock SKUs</div>
                <div className="text-xl font-bold text-dark-900 mt-1">{inventoryItems.length}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
                <div className="text-[11px] uppercase tracking-wider text-emerald-600 font-semibold">In Stock & Optimal</div>
                <div className="text-xl font-bold text-emerald-700 mt-1">
                  {inventoryItems.filter((i) => i.status === 'IN_STOCK' || (i.quantity > (i.minStock || 5))).length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-2xs">
                <div className="text-[11px] uppercase tracking-wider text-amber-600 font-semibold">Low Stock Warnings</div>
                <div className="text-xl font-bold text-amber-600 mt-1">
                  {inventoryItems.filter((i) => i.status === 'LOW_STOCK' || (i.quantity > 0 && i.quantity <= (i.minStock || 5))).length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-2xs">
                <div className="text-[11px] uppercase tracking-wider text-rose-600 font-semibold">Depleted (86 Trigger)</div>
                <div className="text-xl font-bold text-rose-600 mt-1">
                  {inventoryItems.filter((i) => i.status === 'OUT_OF_STOCK' || i.quantity <= 0).length}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fbfbfb] border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Item / Ingredient</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Min. Threshold</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Linked Dish</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInventoryItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                        No inventory items found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredInventoryItems.map((item) => {
                      const isLow = item.quantity <= (item.minStock || 5) && item.quantity > 0;
                      const isOut = item.quantity <= 0;
                      const linkedDish = menuItems.find((d) => d.id === item.linkedDishId);

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-dark-900">{item.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">SKU: #{item.id}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              {item.category || 'General'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-dark-900'}`}>
                                {item.quantity} {item.unit || 'units'}
                              </span>
                              <div className="flex items-center gap-0.5">
                                <button
                                  onClick={() =>
                                    updateInventoryItem(item.id, {
                                      quantity: Math.max(0, Number(item.quantity) - 1),
                                    })
                                  }
                                  className="w-5 h-5 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs cursor-pointer"
                                  title="Decrease by 1"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() =>
                                    updateInventoryItem(item.id, {
                                      quantity: Number(item.quantity) + 5,
                                    })
                                  }
                                  className="w-5 h-5 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs cursor-pointer"
                                  title="Restock +5"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.minStock || 5} {item.unit || 'units'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                                isOut
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : isLow
                                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                              />
                              {isOut ? '86 / DEPLETED' : isLow ? 'LOW STOCK' : 'IN STOCK'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {linkedDish ? (
                              <span className="text-[11px] text-dark-900 font-medium">{linkedDish.name}</span>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">None</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setSelectedItemForEdit(item);
                                  setInventoryForm({
                                    name: item.name || '',
                                    category: item.category || 'Produce',
                                    quantity: item.quantity || 0,
                                    unit: item.unit || 'kg',
                                    minStock: item.minStock || 5,
                                    linkedDishId: item.linkedDishId || '',
                                  });
                                  setModalType('editInventory');
                                }}
                                className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-dark-900 rounded cursor-pointer transition-colors"
                                title="Edit Stock Item"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteConfirmTarget({
                                    type: 'inventory',
                                    id: item.id,
                                    name: item.name,
                                    title: 'Delete Inventory Item',
                                    message: `Are you sure you want to remove "${item.name}" from culinary inventory?`,
                                  });
                                }}
                                className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                                title="Delete Item"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: STAFF MANAGEMENT (RECEPTIONISTS, CHEFS, CLEANERS) */}
        {activeTab === 'Staff Management' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-dark-900">
                  Staff Personnel Directory
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Add, edit, or remove Receptionists, Chefs, Cleaners, and Management staff.
                </p>
              </div>
              <button
                onClick={() => {
                  setStaffForm({
                    name: '',
                    email: '',
                    department: 'Front Desk',
                    role: 'Receptionist',
                    shift: 'Morning (07:00 - 15:30)',
                    status: 'Active Duty',
                  });
                  setModalType('addStaff');
                }}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>+ Add Staff Member</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fbfbfb] border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Staff Name & Contact</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Shift</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 text-xs">
                        No staff members match your search query.
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="ml-2 text-gold-600 underline font-medium cursor-pointer"
                          >
                            Clear search
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff) => (
                      <tr key={staff.id} className="hover:bg-amber-50/20">
                        <td className="py-3 px-4">
                          <div className="font-bold text-dark-900">{staff.name}</div>
                          <div className="text-[11px] text-gray-500">{staff.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-gold-700 border border-gold-200/60">
                            {staff.department}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800">{staff.role}</td>
                        <td className="py-3 px-4 text-gray-600">{staff.shift}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              staff.status === 'Active Duty'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            {staff.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedItemForEdit(staff);
                                setStaffForm({
                                  name: staff.name,
                                  email: staff.email,
                                  department: staff.department,
                                  role: staff.role,
                                  shift: staff.shift || 'Morning (07:00 - 15:30)',
                                  status: staff.status || 'Active Duty',
                                });
                                setModalType('editStaff');
                              }}
                              className="p-1.5 hover:bg-gray-100 text-gray-600 rounded cursor-pointer transition-colors"
                              title="Edit Staff"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirmTarget({
                                  type: 'staff',
                                  id: staff.id,
                                  name: staff.name,
                                  title: 'Remove Staff Member',
                                  message: `Are you sure you want to remove ${staff.name} (${staff.role}) from the staff directory?`,
                                });
                              }}
                              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded cursor-pointer transition-colors"
                              title="Delete Staff"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: USER ACCOUNTS (Admin PostgreSQL User Table Management) */}
        {activeTab === 'User Accounts' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-gold-600 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                    PostgreSQL Authentication
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    Table: users ({usersList?.length || 0} accounts)
                  </span>
                </div>
                <h1 className="font-serif text-2xl font-bold text-dark-900">
                  User Accounts & Authentication Management
                </h1>
                <p className="text-xs text-gray-500 mt-1 font-light">
                  Manage registered guest accounts, staff credentials, and administrative roles directly in the relational database.
                </p>
              </div>
              <button
                onClick={() => {
                  setUserForm({
                    name: '',
                    email: '',
                    phone: '',
                    role: 'guest',
                    password: '',
                  });
                  setShowUserPassword(false);
                  setModalType('addUser');
                }}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>+ Create New User</span>
              </button>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Total Accounts
                </span>
                <div className="text-2xl font-serif font-bold text-dark-900">
                  {usersList?.length || 0}
                </div>
                <div className="text-[11px] text-gray-500 mt-1 font-light">Database credentials</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                  Guest Accounts
                </span>
                <div className="text-2xl font-serif font-bold text-dark-900">
                  {usersList?.filter((u) => u.role === 'guest').length || 0}
                </div>
                <div className="text-[11px] text-emerald-600 mt-1 font-medium">Privilege Members</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  Operational Staff
                </span>
                <div className="text-2xl font-serif font-bold text-dark-900">
                  {usersList?.filter((u) => ['receptionist', 'kitchen', 'housekeeping'].includes(u.role)).length || 0}
                </div>
                <div className="text-[11px] text-gray-500 mt-1 font-light">Front desk & services</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
                <span className="text-[10px] font-bold text-gold-600 uppercase tracking-wider block mb-1">
                  Administrators
                </span>
                <div className="text-2xl font-serif font-bold text-dark-900">
                  {usersList?.filter((u) => u.role === 'admin').length || 0}
                </div>
                <div className="text-[11px] text-gold-600 mt-1 font-medium">Full management access</div>
              </div>
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { label: 'All Users', value: 'All', count: usersList?.length || 0 },
                { label: 'Guests', value: 'guest', count: usersList?.filter((u) => u.role === 'guest').length || 0 },
                { label: 'Admins', value: 'admin', count: usersList?.filter((u) => u.role === 'admin').length || 0 },
                { label: 'Receptionists', value: 'receptionist', count: usersList?.filter((u) => u.role === 'receptionist').length || 0 },
                { label: 'Kitchen Brigade', value: 'kitchen', count: usersList?.filter((u) => u.role === 'kitchen').length || 0 },
                { label: 'Housekeeping', value: 'housekeeping', count: usersList?.filter((u) => u.role === 'housekeeping').length || 0 },
              ].map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setUserRoleFilter(pill.value)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    userRoleFilter === pill.value
                      ? 'bg-dark-900 text-white font-medium shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:text-dark-900 hover:border-gray-300 font-light'
                  }`}
                >
                  <span>{pill.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      userRoleFilter === pill.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {pill.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Users Relational Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fbfbfb] border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">User & Email</th>
                      <th className="py-3 px-4">Assigned Role</th>
                      <th className="py-3 px-4">Phone / Contact</th>
                      <th className="py-3 px-4">Account ID</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500 text-xs">
                          No user accounts match your filter criteria.
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="ml-2 text-gold-600 underline font-medium cursor-pointer"
                            >
                              Clear search
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSelf = user?.email?.toLowerCase() === u.email?.toLowerCase();
                        const roleColors = {
                          admin: 'bg-gold-50 text-gold-700 border-gold-200',
                          receptionist: 'bg-blue-50 text-blue-800 border-blue-200',
                          kitchen: 'bg-orange-50 text-orange-800 border-orange-200',
                          housekeeping: 'bg-purple-50 text-purple-800 border-purple-200',
                          guest: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                        };
                        const roleBadges = {
                          admin: '👑 Administrator',
                          receptionist: '🔔 Front Desk Reception',
                          kitchen: '👨‍🍳 Kitchen Culinary',
                          housekeeping: '🧹 Housekeeping Lead',
                          guest: '👤 Guest / Privilege',
                        };

                        return (
                          <tr key={u.id} className="hover:bg-amber-50/20 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-dark-900 text-gold-500 border border-gold-500/20 font-semibold text-xs flex items-center justify-center shrink-0 uppercase">
                                  {u.name ? u.name.slice(0, 2) : 'US'}
                                </div>
                                <div>
                                  <div className="font-bold text-dark-900 flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {isSelf && (
                                      <span className="text-[10px] bg-gold-50 text-gold-700 border border-gold-200 font-semibold px-1.5 py-0.2 rounded">
                                        You (Current)
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-gray-400 font-mono">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                  roleColors[u.role] || 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}
                              >
                                {roleBadges[u.role] || u.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                              {u.phone || '—'}
                            </td>
                            <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">
                              #{u.id}
                            </td>
                            <td className="py-3 px-4 text-gray-500 text-[11px] font-light">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }) : 'Recent'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setSelectedItemForEdit(u);
                                    setUserForm({
                                      name: u.name || '',
                                      email: u.email || '',
                                      phone: u.phone || '',
                                      role: u.role || 'guest',
                                      password: '',
                                    });
                                    setShowUserPassword(false);
                                    setModalType('editUser');
                                  }}
                                  className="p-1.5 hover:bg-gray-100 text-gray-600 rounded cursor-pointer transition-colors"
                                  title="Edit User Role & Details"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  disabled={isSelf}
                                  onClick={() => {
                                    if (isSelf) return;
                                    setDeleteConfirmTarget({
                                      type: 'user',
                                      id: u.id,
                                      name: u.name,
                                      title: 'Delete User Account',
                                      message: `Are you sure you want to permanently delete the ${u.role?.toUpperCase()} account for "${u.name}" (${u.email})? This action cannot be undone.`,
                                    });
                                  }}
                                  className={`p-1.5 rounded transition-colors ${
                                    isSelf
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'hover:bg-red-50 text-red-600 cursor-pointer'
                                  }`}
                                  title={isSelf ? 'Cannot delete current account' : 'Delete User Account'}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ACTIVITY LOGS */}
        {activeTab === 'Activity Logs' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-dark-900">
                Live Activity Logs & Audit Trail
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-light">
                Real-time synchronized events across Front Desk bookings, Housekeeping turnovers, and Kitchen orders.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden divide-y divide-gray-100">
              {filteredActivityLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No activity logs match your search query.
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-2 text-gold-600 underline font-medium cursor-pointer"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                filteredActivityLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-amber-50/20 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-dark-900">{log.title}</span>
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-dark-900/5 text-dark-900">
                          {log.tag}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed font-light">{log.description}</p>
                    </div>
                    <span className="text-[11px] font-mono text-gray-400 whitespace-nowrap">{log.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS */}
        {activeTab === 'Settings' && (
          <div className="p-4 sm:px-6 lg:px-8 py-6 max-w-3xl space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-dark-900">
                Hotel System & Property Settings
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-light">
                Configure taxation rates, default currency, and operational protocols.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Property Name
                </label>
                <input
                  type="text"
                  defaultValue="Efoy Hotel & Suites"
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg bg-[#fafafa] text-dark-900 font-medium"
                  readOnly
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    State Hospitality Surcharge & Tax (%)
                  </label>
                  <input
                    type="number"
                    defaultValue={12}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Default Currency
                  </label>
                  <select className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 focus:outline-none">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all hotel data (rooms, bookings, orders, staff, menu) to default demo state?')) {
                      resetDemoData();
                      showToast('Hotel system reset to original demo state');
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reset Demo Data
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Hotel settings updated successfully!')}
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* STAFF MODAL */}
      {(modalType === 'addStaff' || modalType === 'editStaff') && (
        <div
          className="fixed inset-0 z-[140] bg-dark-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setModalType(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full p-6 relative overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-amber-500" />
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 pt-1">
              <h3 className="font-serif font-bold text-lg text-dark-900">
                {modalType === 'addStaff' ? 'Add Staff Member' : 'Edit Staff Details'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-dark-900 p-1 cursor-pointer transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="e.g. Maria Santos"
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  placeholder="name@efoyhotel.com"
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Department
                  </label>
                  <select
                    value={staffForm.department}
                    onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 bg-white"
                  >
                    <option>Front Desk</option>
                    <option>Kitchen / F&B</option>
                    <option>Housekeeping</option>
                    <option>Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    required
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    placeholder="e.g. Receptionist, Chef, Cleaner"
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Assigned Shift
                  </label>
                  <input
                    type="text"
                    value={staffForm.shift}
                    onChange={(e) => setStaffForm({ ...staffForm, shift: e.target.value })}
                    placeholder="e.g. Morning (07:00 - 15:30)"
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Duty Status
                  </label>
                  <select
                    value={staffForm.status}
                    onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 bg-white"
                  >
                    <option value="Active Duty">Active Duty</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors font-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-gold-500 hover:bg-gold-600 rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROOM MODAL */}
      {(modalType === 'addRoom' || modalType === 'editRoom') && (
        <div
          className="fixed inset-0 z-[140] bg-dark-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setModalType(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full p-6 relative overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-amber-500" />
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 pt-1">
              <h3 className="font-serif font-bold text-lg text-dark-900">
                {modalType === 'addRoom' ? 'Add Room to Inventory' : 'Edit Room Parameters'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-dark-900 p-1 cursor-pointer transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={modalType === 'editRoom'}
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    className={`w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none ${
                      modalType === 'editRoom' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20'
                    }`}
                  />
                  {modalType === 'editRoom' && (
                    <span className="text-[10px] text-gray-400">Fixed room identifier</span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Nightly Rate ($) *
                  </label>
                  <input
                    type="number"
                    required
                    value={roomForm.rate}
                    onChange={(e) => setRoomForm({ ...roomForm, rate: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Room Type
                  </label>
                  <select
                    value={roomForm.type}
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 bg-white"
                  >
                    <option value="Single Classic">Single Classic</option>
                    <option value="Single Deluxe">Single Deluxe</option>
                    <option value="Double Deluxe">Double Deluxe</option>
                    <option value="Double Executive">Double Executive</option>
                    <option value="Luxury Suite">Luxury Suite</option>
                    <option value="Penthouse Panoramic">Penthouse Panoramic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Floor Location
                  </label>
                  <input
                    type="text"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                    placeholder="e.g. Floor 2 (East Wing)"
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Capacity
                </label>
                <input
                  type="text"
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                  placeholder="e.g. 2 Adults, 1 Child"
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Features & Amenities
                </label>
                <input
                  type="text"
                  value={roomForm.features}
                  onChange={(e) => setRoomForm({ ...roomForm, features: e.target.value })}
                  placeholder="e.g. King Bed • Balcony • Marble Bath"
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors font-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-gold-500 hover:bg-gold-600 rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOD MODAL */}
      {(modalType === 'addFood' || modalType === 'editFood') && (
        <div
          className="fixed inset-0 z-[140] bg-dark-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setModalType(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full p-6 relative overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-amber-500" />
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 pt-1">
              <h3 className="font-serif font-bold text-lg text-dark-900">
                {modalType === 'addFood' ? 'Add Culinary Item' : 'Edit Culinary Item'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-dark-900 p-1 cursor-pointer transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Dish / Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={foodForm.name}
                  onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={foodForm.price}
                    onChange={(e) => setFoodForm({ ...foodForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={foodForm.category}
                    onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 bg-white"
                  >
                    <option>Breakfast</option>
                    <option>All-Day Dining</option>
                    <option>Chef Special</option>
                    <option>Beverages</option>
                    <option>Desserts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Preparation Time
                </label>
                <input
                  type="text"
                  value={foodForm.prepTime}
                  onChange={(e) => setFoodForm({ ...foodForm, prepTime: e.target.value })}
                  placeholder="e.g. 15-20 mins"
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={foodForm.description}
                  onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors font-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-gold-500 hover:bg-gold-600 rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER ACCOUNT MODAL (Add / Edit User in Postgres users table) */}
      {(modalType === 'addUser' || modalType === 'editUser') && (
        <div
          className="fixed inset-0 z-[140] bg-dark-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            setModalType(null);
            setSelectedItemForEdit(null);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full p-6 relative overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-amber-500" />
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 pt-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gold-50 text-gold-700 border border-gold-200 flex items-center justify-center">
                  <UserCheck size={16} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-dark-900">
                    {modalType === 'addUser' ? 'Create User Account' : 'Edit User Account'}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-light">
                    Direct synchronization with database users table
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalType(null);
                  setSelectedItemForEdit(null);
                }}
                className="text-gray-400 hover:text-dark-900 p-1 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@efoyhotel.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    System Role *
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 bg-white"
                  >
                    <option value="guest">Guest / Member</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="kitchen">Kitchen Staff</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Phone Contact
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 234-5678"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  {modalType === 'addUser' ? 'Password *' : 'New Password (Optional)'}
                </label>
                <div className="relative">
                  <input
                    type={showUserPassword ? 'text' : 'password'}
                    required={modalType === 'addUser'}
                    placeholder={modalType === 'addUser' ? 'Min 6 characters' : 'Leave blank to preserve current password'}
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full text-xs pl-3 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserPassword(!showUserPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark-900 transition-colors cursor-pointer"
                  >
                    {showUserPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {modalType === 'editUser' && (
                  <p className="text-[10px] text-gray-400 mt-1 font-light">
                    Only fill if you wish to reset or change the user's password.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalType(null);
                    setSelectedItemForEdit(null);
                  }}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors font-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-gold-500 hover:bg-gold-600 rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  {modalType === 'addUser' ? 'Create Account' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROOM CATEGORY MODAL */}
      {(modalType === 'addCategory' || modalType === 'editCategory') && (
        <div
          className="fixed inset-0 z-[140] bg-dark-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setModalType(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full p-6 relative overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-amber-500" />
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 pt-1">
              <h3 className="font-serif font-bold text-lg text-dark-900">
                {modalType === 'addCategory' ? 'Add Room Category' : 'Edit Suite Classification'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-gray-400 hover:text-dark-900 p-1 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Presidential Penthouse"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Base Rate ($ / night) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={categoryForm.baseRate}
                    onChange={(e) => setCategoryForm({ ...categoryForm, baseRate: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Guest Capacity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 Persons"
                    value={categoryForm.capacity}
                    onChange={(e) => setCategoryForm({ ...categoryForm, capacity: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Amenities & Features
                </label>
                <input
                  type="text"
                  placeholder="e.g. King Bed • Balcony • Panoramic Skyline View"
                  value={categoryForm.features}
                  onChange={(e) => setCategoryForm({ ...categoryForm, features: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Tier overview, luxury finishes, and VIP privileges..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Preview Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={categoryForm.imageUrl}
                  onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalType(null);
                    setSelectedItemForEdit(null);
                  }}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors font-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-gold-500 hover:bg-gold-600 rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  {modalType === 'addCategory' ? 'Create Tier' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CULINARY INVENTORY MODAL */}
      {(modalType === 'addInventory' || modalType === 'editInventory') && (
        <div
          className="fixed inset-0 z-[140] bg-dark-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setModalType(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full p-6 relative overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-amber-500" />
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 pt-1">
              <h3 className="font-serif font-bold text-lg text-dark-900">
                {modalType === 'addInventory' ? 'Add Inventory Item' : 'Modify Stock SKU'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-gray-400 hover:text-dark-900 p-1 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInventory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Item / Ingredient Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prime Wagyu Beef Ribeye"
                  value={inventoryForm.name}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={inventoryForm.category}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 bg-white"
                  >
                    <option>Produce</option>
                    <option>Meat & Poultry</option>
                    <option>Seafood</option>
                    <option>Dairy & Cheese</option>
                    <option>Bakery & Dry Goods</option>
                    <option>Beverages & Wine</option>
                    <option>Spices & Condiments</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Measurement Unit
                  </label>
                  <select
                    value={inventoryForm.unit}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 bg-white"
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="g">g (Grams)</option>
                    <option value="L">L (Liters)</option>
                    <option value="bottles">bottles</option>
                    <option value="boxes">boxes</option>
                    <option value="units">units / pcs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Current Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={inventoryForm.quantity}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Min Stock Threshold *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={inventoryForm.minStock}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, minStock: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Linked Menu Dish (Auto-86 Trigger)
                </label>
                <select
                  value={inventoryForm.linkedDishId}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, linkedDishId: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 bg-white"
                >
                  <option value="">-- No Linked Menu Item --</option>
                  {menuItems.map((dish) => (
                    <option key={dish.id} value={dish.id}>
                      {dish.name} (${dish.price})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1 font-light">
                  If this item's stock reaches 0, the kitchen will receive an automatic 86 prompt.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalType(null);
                    setSelectedItemForEdit(null);
                  }}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors font-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-gold-500 hover:bg-gold-600 rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  {modalType === 'addInventory' ? 'Add to Inventory' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DELETIONS */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmTarget)}
        onClose={() => setDeleteConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
        title={deleteConfirmTarget?.title || 'Confirm Deletion'}
        message={
          deleteConfirmTarget?.message ||
          'Are you sure you want to delete this item? This action cannot be undone.'
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        icon="trash"
      />
    </div>
  );
};

export default AdminDashboard;
